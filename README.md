# Chess Engine

A multi-crate Rust chess engine with CLI interface.

## Structure

```
chess/
  Cargo.toml          # Workspace root
  crates/
    core/             # chess-core: board, pieces, move generation, rules
    engine/           # chess-engine: negamax search with alpha-beta pruning
    cli/              # chess-cli: command-line interface
```

## Crates

### chess-core
Core chess types and logic:
- `Board` - Board representation with FEN support
- `Position` - Game state (side to move, castling rights, en passant, clocks)
- `Piece` / `PieceType` / `Color` - Chess piece types and colors
- `Square` - Board square representation with SAN notation
- `Move` / `MoveType` - Move representation including promotions and castling
- Move generation with legality filtering (no moves that leave king in check)
- Check detection, checkmate, stalemate detection

### chess-engine
Engine search:
- Negamax algorithm with alpha-beta pruning
- Material-based evaluation
- Configurable search depth

### chess-cli
Command-line interface:
- `chess board` - Display starting FEN
- `chess moves` - List all legal moves from start
- `chess play --depth 3` - Interactive play mode with engine recommendations
- `chess uci` - UCI protocol mode (reads commands from stdin)

### UCI protocol

The engine speaks the standard UCI protocol. Run `chess uci` and send commands:

```
uci
isready
position startpos moves e2e4 e7e5
go depth 3
bestmove g1f3
quit
```

### MCP server

The engine exposes an MCP (Model Context Protocol) server over stdio JSON-RPC, built into the `chess` binary:

```
cargo run -p chess-cli -- mcp
# then send MCP messages to stdin, e.g.:
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_board","arguments":{}}}
```

Available MCP tools:
- `new_game` - Start a new game
- `get_board` - Get current board (ASCII + FEN)
- `get_legal_moves` - List legal moves (UCI)
- `make_move` - Play a move (UCI notation)
- `get_best_move` - Engine's best move at a depth

Available MCP resources:
- `chess://board` - Current board state

### Benchmark

Run `cargo run -p chess-cli -- bench` to benchmark move generation (perft) from the starting position:

```
cargo run -p chess-cli -- bench
```

Reports node counts at depths 1-5, ns/node, and total nodes/second. Depths 1-3 match the published perft values for the initial position (20, 400, 8902).

Supported UCI commands: `uci`, `isready`, `ucinewgame`, `position` (startpos/fen + moves), `go` (depth, wtime, btime, winc, binc, nodes, mate, infinite), `stop`, `quit`.

## Usage

```bash
# Build
cargo build --release

# View starting position
cargo run -p chess-cli -- board

# List legal opening moves
cargo run -p chess-cli -- moves

# Interactive play
cargo run -p chess-cli -- play --depth 3
```

## Testing

```bash
cargo test
```
