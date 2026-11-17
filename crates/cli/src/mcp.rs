use chess_core::{find_move_from_uci, generate_moves};
use chess_engine::Engine;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::io::{self, AsyncBufReadExt, AsyncWriteExt, BufReader};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
struct JsonRpcRequest {
    jsonrpc: Option<String>,
    id: Option<Value>,
    method: String,
    params: Option<Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonRpcResponse {
    jsonrpc: String,
    id: Value,
    result: Value,
}

struct McpServer {
    engine: Engine,
}

impl McpServer {
    fn new() -> Self {
        Self {
            engine: Engine::new(),
        }
    }

    fn board_text(&self) -> String {
        let position = &self.engine.position;
        let mut lines = Vec::new();
        lines.push("    a   b   c   d   e   f   g   h".to_string());
        lines.push("  +---+---+---+---+---+---+---+---+".to_string());
        for rank in (0..8).rev() {
            let mut row = format!("{} |", rank + 1);
            for file in 0..8 {
                let sq = chess_core::square::Square::new(file, rank).unwrap();
                let piece = position.get_piece(sq);
                match piece {
                    Some(p) => row.push_str(&format!(" {} |", p.symbol())),
                    None => row.push_str("   |"),
                }
            }
            row.push_str(&format!(" {}", rank + 1));
            lines.push(row);
            lines.push("  +---+---+---+---+---+---+---+---+".to_string());
        }
        lines.push("    a   b   c   d   e   f   g   h".to_string());
        lines.push(format!(
            "\nFEN: {}\nSide to move: {:?}\n",
            self.fen(),
            position.side_to_move
        ));
        lines.join("\n")
    }

    fn fen(&self) -> String {
        chess_core::board::Board {
            position: self.engine.position.clone(),
        }
        .to_fen()
    }

    fn legal_moves_uci(&self) -> Vec<String> {
        generate_moves(&self.engine.position)
            .into_iter()
            .map(|m| m.to_uci())
            .collect()
    }

    fn handle_initialize(&self, _params: Option<Value>) -> Value {
        serde_json::json!({
            "protocolVersion": "2025-11-25",
            "capabilities": {
                "tools": { "listChanged": false },
                "resources": { "listChanged": false },
                "prompts": { "listChanged": false }
            },
            "serverInfo": {
                "name": "chess-mcp",
                "version": env!("CARGO_PKG_VERSION")
            }
        })
    }

    fn handle_tools_list(&self) -> Value {
        serde_json::json!({
            "tools": [
                {
                    "name": "new_game",
                    "title": "New Game",
                    "description": "Start a new chess game from the standard starting position",
                    "annotations": {
                        "readOnlyHint": false,
                        "destructiveHint": true,
                        "idempotentHint": true,
                        "openWorldHint": false
                    },
                    "inputSchema": {
                        "type": "object",
                        "properties": {},
                        "additionalProperties": false
                    }
                },
                {
                    "name": "get_board",
                    "title": "Get Board",
                    "description": "Get the current board state as ASCII art and FEN",
                    "annotations": {
                        "readOnlyHint": true,
                        "destructiveHint": false,
                        "idempotentHint": true,
                        "openWorldHint": false
                    },
                    "inputSchema": {
                        "type": "object",
                        "properties": {},
                        "additionalProperties": false
                    }
                },
                {
                    "name": "get_legal_moves",
                    "title": "Get Legal Moves",
                    "description": "List all legal moves for the current position (UCI notation)",
                    "annotations": {
                        "readOnlyHint": true,
                        "destructiveHint": false,
                        "idempotentHint": true,
                        "openWorldHint": false
                    },
                    "inputSchema": {
                        "type": "object",
                        "properties": {},
                        "additionalProperties": false
                    }
                },
                {
                    "name": "make_move",
                    "title": "Make Move",
                    "description": "Make a move on the board (UCI notation, e.g. e2e4)",
                    "annotations": {
                        "readOnlyHint": false,
                        "destructiveHint": false,
                        "idempotentHint": true,
                        "openWorldHint": false
                    },
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "move": {
                                "type": "string",
                                "description": "Move in UCI notation (e.g. e2e4, e7e8q)"
                            }
                        },
                        "required": ["move"],
                        "additionalProperties": false
                    }
                },
                {
                    "name": "get_best_move",
                    "title": "Get Best Move",
                    "description": "Get the engine's best move for the current position",
                    "annotations": {
                        "readOnlyHint": true,
                        "destructiveHint": false,
                        "idempotentHint": true,
                        "openWorldHint": false
                    },
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "depth": {
                                "type": "integer",
                                "description": "Search depth (default 3)",
                                "minimum": 1,
                                "maximum": 6
                            }
                        },
                        "additionalProperties": false
                    }
                }
            ]
        })
    }

    fn handle_tools_call(&mut self, name: &str, args: Option<Value>) -> Value {
        match name {
            "new_game" => {
                self.engine = Engine::new();
                serde_json::json!({
                    "content": [
                        {
                            "type": "text",
                            "text": format!("New game started.\n{}", self.board_text())
                        }
                    ]
                })
            }
            "get_board" => {
                serde_json::json!({
                    "content": [
                        {
                            "type": "text",
                            "text": self.board_text()
                        }
                    ]
                })
            }
            "get_legal_moves" => {
                let moves = self.legal_moves_uci();
                serde_json::json!({
                    "content": [
                        {
                            "type": "text",
                            "text": format!("Legal moves: {}", moves.join(", "))
                        }
                    ]
                })
            }
            "make_move" => {
                let uci = args
                    .as_ref()
                    .and_then(|params| params.get("move"))
                    .and_then(|mv| mv.as_str())
                    .map(|s| s.to_owned())
                    .unwrap_or_default();
                match find_move_from_uci(&self.engine.position, &uci) {
                    Some(m) => {
                        chess_core::rules::apply_move(&mut self.engine.position, m);
                        serde_json::json!({
                            "content": [
                                {
                                    "type": "text",
                                    "text": format!("Move played: {}\n{}", uci, self.board_text())
                                }
                            ]
                        })
                    }
                    None => {
                        serde_json::json!({
                            "content": [
                                {
                                    "type": "text",
                                    "text": format!("Illegal move: {}", uci)
                                }
                            ],
                            "isError": true
                        })
                    }
                }
            }
            "get_best_move" => {
                let depth = args
                    .and_then(|v| v.get("depth").and_then(|v| v.as_u64()))
                    .unwrap_or(3) as u32;
                let search = self.engine.search(depth);
                match search.best_move {
                    Some(bm) => serde_json::json!({
                        "content": [
                            {
                                "type": "text",
                                "text": format!("Best move: {} (depth {}, score: {})\n{}", bm.to_uci(), depth, search.score, self.board_text())
                            }
                        ]
                    }),
                    None => serde_json::json!({
                        "content": [
                            {
                                "type": "text",
                                "text": "No legal moves available."
                            }
                        ]
                    }),
                }
            }
            _ => serde_json::json!({
                "error": {
                    "code": -32601,
                    "message": format!("Unknown tool: {}", name)
                }
            }),
        }
    }

    fn handle_prompts_list(&self) -> Value {
        serde_json::json!({
            "prompts": [
                {
                    "name": "analyze_position",
                    "title": "Analyze Position",
                    "description": "Explain the current position: material, threats, and candidate plans",
                    "arguments": []
                },
                {
                    "name": "suggest_move",
                    "title": "Suggest Move",
                    "description": "Ask the engine for its best move at a chosen depth",
                    "arguments": [
                        {
                            "name": "depth",
                            "description": "Search depth 1-6 (default 3)",
                            "required": false
                        }
                    ]
                }
            ]
        })
    }

    fn handle_prompts_get(&self, name: &str, args: Option<Value>) -> Value {
        let depth = args
            .as_ref()
            .and_then(|a| a.get("depth"))
            .and_then(|v| v.as_u64())
            .unwrap_or(3)
            .clamp(1, 6);
        let (prompt_text, moves) = match name {
            "analyze_position" => (
                "Analyze the current chess position. Report material balance,                  whose move it is, immediate tactical threats, and two or three                  candidate plans. Use the board tools to verify before answering."
                    .to_string(),
                self.legal_moves_uci(),
            ),
            "suggest_move" => (
                format!(
                    "Find the engine's best move at depth {depth}. Report the                      move in UCI notation, the score, and a short explanation                      of why it is best."
                ),
                self.legal_moves_uci(),
            ),
            _ => {
                return serde_json::json!({
                    "error": {"code": -32602, "message": format!("Unknown prompt: {name}")}
                })
            }
        };
        serde_json::json!({
            "description": format!("Chess prompt: {name}"),
            "messages": [
                {
                    "role": "user",
                    "content": {
                        "type": "text",
                        "text": format!("{prompt_text}

FEN: {}
Legal moves ({}): {}", self.fen(), moves.len(), moves.join(", "))
                    }
                }
            ]
        })
    }

    fn handle_resources_list(&self) -> Value {
        serde_json::json!({
            "resources": [
                {
                    "uri": "chess://board",
                    "name": "Current Board",
                    "description": "Current chess board state as FEN and ASCII",
                    "mimeType": "text/plain"
                }
            ]
        })
    }

    fn handle_resources_read(&self, uri: &str) -> Value {
        match uri {
            "chess://board" => serde_json::json!({
                "contents": [
                    {
                        "uri": uri,
                        "mimeType": "text/plain",
                        "text": format!("FEN: {}\n{}", self.fen(), self.board_text())
                    }
                ]
            }),
            _ => serde_json::json!({
                "error": {
                    "code": -32602,
                    "message": format!("Unknown resource: {}", uri)
                }
            }),
        }
    }
}

pub async fn run() -> io::Result<()> {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut lines = BufReader::new(stdin).lines();
    let mut out = stdout;

    let mut server = McpServer::new();

    while let Some(line) = lines.next_line().await? {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if let Some(response) = server.process(trimmed) {
            out.write_all(response.as_bytes()).await?;
            out.write_all(b"\n").await?;
            out.flush().await?;
        }
    }

    Ok(())
}

impl McpServer {
    /// Process one JSON-RPC frame; returns the serialized response line, or
    /// `None` for notifications and parse-free replies. Shared by the stdio
    /// loop and the streamable-HTTP transport.
    fn process(&mut self, trimmed: &str) -> Option<String> {
        let request: Result<JsonRpcRequest, _> = serde_json::from_str(trimmed);

        match request {
            Ok(req) => {
                let has_id = req.id.is_some();
                let id = req.id.unwrap_or(serde_json::Value::Null);

                let maybe_response = match req.method.as_str() {
                    "initialize" => {
                        let result = self.handle_initialize(req.params);
                        Some(
                            serde_json::to_string(&JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id,
                                result,
                            })
                            .unwrap(),
                        )
                    }
                    "tools/list" => {
                        let result = self.handle_tools_list();
                        Some(
                            serde_json::to_string(&JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id,
                                result,
                            })
                            .unwrap(),
                        )
                    }
                    "tools/call" => {
                        let name = req
                            .params
                            .as_ref()
                            .and_then(|p| p.get("name").and_then(|v| v.as_str()))
                            .unwrap_or("");
                        let args = req.params.as_ref().and_then(|p| p.get("arguments"));
                        let result = self.handle_tools_call(name, args.cloned());
                        Some(
                            serde_json::to_string(&JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id,
                                result,
                            })
                            .unwrap(),
                        )
                    }
                    "prompts/list" => {
                        let result = self.handle_prompts_list();
                        Some(
                            serde_json::to_string(&JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id,
                                result,
                            })
                            .unwrap(),
                        )
                    }
                    "prompts/get" => {
                        let name = req
                            .params
                            .as_ref()
                            .and_then(|p| p.get("name").and_then(|v| v.as_str()))
                            .unwrap_or("");
                        let args = req.params.as_ref().and_then(|p| p.get("arguments"));
                        let result = self.handle_prompts_get(name, args.cloned());
                        Some(
                            serde_json::to_string(&JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id,
                                result,
                            })
                            .unwrap(),
                        )
                    }
                    "resources/list" => {
                        let result = self.handle_resources_list();
                        Some(
                            serde_json::to_string(&JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id,
                                result,
                            })
                            .unwrap(),
                        )
                    }
                    "resources/read" => {
                        let uri = req
                            .params
                            .as_ref()
                            .and_then(|p| p.get("uri").and_then(|v| v.as_str()))
                            .unwrap_or("");
                        let result = self.handle_resources_read(uri);
                        Some(
                            serde_json::to_string(&JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id,
                                result,
                            })
                            .unwrap(),
                        )
                    }
                    "ping" => Some(
                        serde_json::to_string(&JsonRpcResponse {
                            jsonrpc: "2.0".to_string(),
                            id,
                            result: serde_json::Value::Null,
                        })
                        .unwrap(),
                    ),
                    "initialized" => None,
                    method => Some(
                        serde_json::to_string(&JsonRpcError {
                            jsonrpc: "2.0".to_string(),
                            id,
                            error: serde_json::json!({
                                "code": -32601,
                                "message": format!("Method not found: {}", method)
                            }),
                        })
                        .unwrap(),
                    ),
                };

                if !has_id {
                    return None;
                }
                maybe_response
            }
            Err(e) => {
                let error = serde_json::to_string(&JsonRpcError {
                    jsonrpc: "2.0".to_string(),
                    id: Value::Null,
                    error: serde_json::json!({
                        "code": -32700,
                        "message": format!("Parse error: {}", e)
                    }),
                })
                .unwrap();
                Some(error)
            }
        }
    }
}

/// Run the MCP server over streamable HTTP on `addr`.
pub fn run_http(addr: &str, token: Option<String>) -> io::Result<()> {
    let server = std::sync::Arc::new(std::sync::Mutex::new(McpServer::new()));
    crate::mcp_http::serve(addr, token, move |body: &str| {
        let mut guard = server.lock().expect("mcp server poisoned");
        guard.process(body.trim())
    })
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonRpcError {
    jsonrpc: String,
    id: Value,
    error: Value,
}

#[cfg(test)]
mod tests {
    use super::*;

    const EXPECTED_TOOLS: [&str; 5] = [
        "new_game",
        "get_board",
        "get_legal_moves",
        "make_move",
        "get_best_move",
    ];

    fn listed_tools() -> Vec<Value> {
        let result = McpServer::new().handle_tools_list();
        result["tools"].as_array().expect("tools array").clone()
    }

    #[test]
    fn tools_list_exposes_every_expected_tool() {
        let tools = listed_tools();
        let names: Vec<&str> = tools
            .iter()
            .filter_map(|tool| tool["name"].as_str())
            .collect();
        for expected in EXPECTED_TOOLS {
            assert!(names.contains(&expected), "missing tool {expected}");
        }
        assert_eq!(names.len(), EXPECTED_TOOLS.len());
    }

    #[test]
    fn every_tool_has_all_four_boolean_annotations() {
        for tool in listed_tools() {
            let name = tool["name"].as_str().unwrap_or("<unnamed>");
            let annotations = &tool["annotations"];
            for hint in [
                "readOnlyHint",
                "destructiveHint",
                "idempotentHint",
                "openWorldHint",
            ] {
                assert!(
                    annotations.get(hint).is_some_and(Value::is_boolean),
                    "{name} missing boolean annotation {hint}"
                );
            }
        }
    }
}
