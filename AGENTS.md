# Chess Engine - Agent Guidelines

## Project Structure

Multi-crate Rust workspace at `/Users/hieudoan/git/github.com/hieudoanm/chess`:

- `crates/core` (`chess-core`): Board, pieces, move generation, rules, FEN
- `crates/engine` (`chess-engine`): Negamax search with alpha-beta pruning
- `crates/cli` (`chess-cli`): CLI binary `chess` with subcommands including MCP server

## Build & Test

```bash
cargo build              # Build all crates
cargo build --release    # Release build
cargo test               # Run all tests
cargo run -p chess-cli -- <subcommand>  # Run CLI
```

## CLI Subcommands

- `chess board` - Print starting FEN
- `chess moves` - List legal moves from start
- `chess play --depth N` - Interactive play with engine
- `chess uci` - UCI protocol mode (stdin/stdout)
- `chess mcp` - MCP server over stdio JSON-RPC
- `chess bench` - Perft benchmark (depths 1-5, nodes/sec)

### UCI

The engine speaks UCI. `chess uci` reads commands from stdin: `uci`, `isready`, `ucinewgame`, `position startpos|fen ... moves ...`, `go [depth N]`, `stop`, `quit`. Responds with `bestmove <move>`.

### Bench

`chess bench` runs perft from the starting position. Depths 1-3 match published values (20, 400, 8902).

### Key Files

- `crates/core/src/position.rs` - Board state, check detection
- `crates/core/src/move_gen.rs` - Move generation with legality filtering
- `crates/core/src/perft.rs` - Perft node counting
- `crates/core/src/rules.rs` - Evaluation, game result, apply_move
- `crates/engine/src/lib.rs` - Negamax search engine
- `crates/cli/src/main.rs` - CLI entry point

## Conventions

- Rust 2021 edition
- No comments in code unless asked
- Follow existing module structure
- Workspace members in `crates/`
