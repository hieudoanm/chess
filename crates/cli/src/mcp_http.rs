//! Minimal Streamable-HTTP transport for MCP.
//!
//! Implements the subset of the Streamable HTTP transport that request/
//! response tools need: `POST /mcp` carries one JSON-RPC message and gets an
//! `application/json` reply; notifications get `202 Accepted`. `GET` and
//! `DELETE` return `405` because this server never initiates messages, which
//! the spec permits. When a token is configured (`--token` or
//! `MCP_AUTH_TOKEN`), every request must carry `Authorization: Bearer <token>`.

use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::{Arc, Mutex};

const MAX_HEADER_BYTES: usize = 64 * 1024;
const MAX_BODY_BYTES: usize = 8 * 1024 * 1024;

/// Handles one raw JSON-RPC request body. Returns the serialized response
/// body, or `None` when the request is a notification that needs no reply.
pub type Handler = Arc<Mutex<dyn FnMut(&str) -> Option<String> + Send>>;

/// Serve MCP over HTTP/1.1 on `addr` (e.g. `127.0.0.1:8080`) until the process
/// exits. One thread per connection; the handler is shared behind a mutex so
/// stateful servers stay consistent.
pub fn serve<F>(addr: &str, token: Option<String>, handler: F) -> std::io::Result<()>
where
    F: FnMut(&str) -> Option<String> + Send + 'static,
{
    let listener = TcpListener::bind(addr)?;
    let handler: Handler = Arc::new(Mutex::new(handler));
    eprintln!("[mcp] streamable-http listening on http://{addr}/mcp");
    for stream in listener.incoming() {
        match stream {
            Ok(mut stream) => {
                let handler = Arc::clone(&handler);
                let token = token.clone();
                std::thread::spawn(move || {
                    let _ = handle_connection(&mut stream, token.as_deref(), &handler);
                });
            }
            Err(err) => eprintln!("[mcp] accept failed: {err}"),
        }
    }
    Ok(())
}

fn handle_connection(
    stream: &mut std::net::TcpStream,
    token: Option<&str>,
    handler: &Handler,
) -> std::io::Result<()> {
    let mut buf = Vec::new();
    let header_end = loop {
        let mut chunk = [0u8; 8192];
        let n = stream.read(&mut chunk)?;
        if n == 0 {
            return Ok(());
        }
        buf.extend_from_slice(&chunk[..n]);
        if buf.len() > MAX_HEADER_BYTES {
            return respond(
                stream,
                431,
                "text/plain",
                b"request headers too large",
                None,
            );
        }
        if let Some(pos) = find(&buf, b"\r\n\r\n") {
            break pos + 4;
        }
    };

    let head = String::from_utf8_lossy(&buf[..header_end]).into_owned();
    let mut lines = head.lines();
    let request_line = lines.next().unwrap_or("");
    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("");
    let path = parts.next().unwrap_or("");

    let mut content_length = 0usize;
    let mut authorized = token.is_none();
    let mut protocol_version = mcp_protocol_version();
    for line in lines {
        let line = line.trim_end_matches('\r');
        if let Some((name, value)) = line.split_once(':') {
            let name = name.trim().to_ascii_lowercase();
            let value = value.trim();
            match name.as_str() {
                "content-length" => content_length = value.parse().unwrap_or(0),
                "authorization" => {
                    if let Some(expected) = token {
                        authorized = value == format!("Bearer {expected}");
                    }
                }
                "mcp-protocol-version" => protocol_version = value.to_string(),
                _ => {}
            }
        }
    }

    if !authorized {
        return respond(
            stream,
            401,
            "application/json",
            br#"{"error":"unauthorized"}"#,
            None,
        );
    }
    if path != "/mcp" {
        return respond(
            stream,
            404,
            "application/json",
            br#"{"error":"not found"}"#,
            None,
        );
    }
    if method != "POST" {
        return respond(
            stream,
            405,
            "application/json",
            br#"{"error":"method not allowed"}"#,
            None,
        );
    }
    if content_length > MAX_BODY_BYTES {
        return respond(
            stream,
            413,
            "application/json",
            br#"{"error":"body too large"}"#,
            None,
        );
    }

    while buf.len() < header_end + content_length {
        let mut chunk = [0u8; 8192];
        let n = stream.read(&mut chunk)?;
        if n == 0 {
            break;
        }
        buf.extend_from_slice(&chunk[..n]);
    }
    let end = (header_end + content_length).min(buf.len());
    let body_str = String::from_utf8_lossy(&buf[header_end..end]);

    // JSON-RPC batching was removed from the spec; reject arrays.
    if body_str.trim_start().starts_with('[') {
        let msg = br#"{"jsonrpc":"2.0","id":null,"error":{"code":-32600,"message":"batch requests are not supported"}}"#;
        return respond(
            stream,
            400,
            "application/json",
            msg,
            Some(&protocol_version),
        );
    }

    let reply = {
        let mut guard = handler
            .lock()
            .map_err(|_| std::io::Error::other("handler poisoned"))?;
        guard(&body_str)
    };
    match reply {
        Some(body) => respond(
            stream,
            200,
            "application/json",
            body.as_bytes(),
            Some(&protocol_version),
        ),
        None => respond(
            stream,
            202,
            "application/json",
            b"",
            Some(&protocol_version),
        ),
    }
}

fn mcp_protocol_version() -> String {
    std::env::var("MCP_PROTOCOL_VERSION").unwrap_or_else(|_| "2025-11-25".to_string())
}

fn find(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack
        .windows(needle.len())
        .position(|window| window == needle)
}

fn respond(
    stream: &mut std::net::TcpStream,
    status: u16,
    content_type: &str,
    body: &[u8],
    protocol_version: Option<&str>,
) -> std::io::Result<()> {
    let reason = match status {
        200 => "OK",
        202 => "Accepted",
        400 => "Bad Request",
        401 => "Unauthorized",
        404 => "Not Found",
        405 => "Method Not Allowed",
        413 => "Payload Too Large",
        431 => "Request Header Fields Too Large",
        _ => "Error",
    };
    let mut head = format!(
        "HTTP/1.1 {status} {reason}\r\ncontent-type: {content_type}\r\ncontent-length: {}\r\nconnection: close\r\n",
        body.len()
    );
    if let Some(version) = protocol_version {
        head.push_str(&format!("mcp-protocol-version: {version}\r\n"));
    }
    head.push_str("\r\n");
    stream.write_all(head.as_bytes())?;
    stream.write_all(body)?;
    stream.flush()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn post(port: u16, path: &str, body: &str, auth: Option<&str>) -> (u16, String) {
        let mut stream = std::net::TcpStream::connect(("127.0.0.1", port)).unwrap();
        let auth_header = auth
            .map(|t| format!("authorization: Bearer {t}\r\n"))
            .unwrap_or_default();
        write!(
            stream,
            "POST {path} HTTP/1.1\r\nhost: localhost\r\ncontent-type: application/json\r\ncontent-length: {}\r\n{auth_header}\r\n{}",
            body.len(),
            body
        )
        .unwrap();
        let mut raw = String::new();
        stream.read_to_string(&mut raw).unwrap();
        let status = raw
            .split_whitespace()
            .nth(1)
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        let body = raw.split("\r\n\r\n").nth(1).unwrap_or("").to_string();
        (status, body)
    }

    #[test]
    fn serves_initialize_over_http() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        drop(listener);
        std::thread::spawn(move || {
            serve(
                &format!("127.0.0.1:{port}"),
                None,
                |body: &str| {
                    if body.contains("\"initialize\"") {
                        Some(r#"{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-11-25","capabilities":{},"serverInfo":{"name":"t","version":"0"}}}"#.to_string())
                    } else {
                        None
                    }
                },
            )
            .unwrap();
        });
        std::thread::sleep(std::time::Duration::from_millis(150));
        let (status, body) = post(
            port,
            "/mcp",
            r#"{"jsonrpc":"2.0","id":1,"method":"initialize"}"#,
            None,
        );
        assert_eq!(status, 200);
        assert!(body.contains("protocolVersion"));
    }

    #[test]
    fn notification_gets_202_and_wrong_path_404() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        drop(listener);
        std::thread::spawn(move || {
            serve(&format!("127.0.0.1:{port}"), None, |_| None).unwrap();
        });
        std::thread::sleep(std::time::Duration::from_millis(150));
        let (status, _) = post(port, "/mcp", r#"{"jsonrpc":"2.0","method":"ping"}"#, None);
        assert_eq!(status, 202);
        let (status, _) = post(
            port,
            "/other",
            r#"{"jsonrpc":"2.0","id":1,"method":"ping"}"#,
            None,
        );
        assert_eq!(status, 404);
    }
}
