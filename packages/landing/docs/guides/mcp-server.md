# MCP server

`chess mcp` runs an MCP (Model Context Protocol) server over stdio using
newline-delimited JSON-RPC 2.0, exposing the engine to MCP-compatible clients.

```bash
chess mcp
```

Point your MCP client configuration at the `chess` binary with the `mcp`
subcommand; the server speaks JSON-RPC on stdin/stdout.
