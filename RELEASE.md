## Chess — latest build

A chess engine and CLI in Rust: legal move generation, negamax search,
UCI protocol mode, perft benchmarks, an interactive play mode, and an
MCP server exposing engine operations.

### Download

| Platform | Asset |
| --- | --- |
| Linux x86_64 | `chess-x86_64-unknown-linux-gnu` |
| macOS Apple Silicon | `chess-aarch64-apple-darwin` |
| Windows x86_64 | `chess-x86_64-pc-windows-msvc.exe` |

### Quick start

```sh
chess board              # starting position FEN
chess play --depth 5     # interactive game
chess uci                # UCI protocol mode
chess mcp                # MCP server over stdio
chess bench              # perft benchmark
```

### Documentation

- [README](https://github.com/hieudoanm/chess#readme)
- [CONTRIBUTING](https://github.com/hieudoanm/chess/blob/master/CONTRIBUTING.md)
