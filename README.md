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

## Top Chess Engines (CCRL 40/15, Oct 2026)

| Rank | Engine                                                              | CCRL 40/15 | Type       | Licence  | GitHub                                                    | Notes                           |
| ---- | ------------------------------------------------------------------- | ---------- | ---------- | -------- | --------------------------------------------------------- | ------------------------------- |
| 1    | [Stockfish 19](https://github.com/official-stockfish/Stockfish)     | 3650       | NNUE       | GPL-3.0  | [GitHub](https://github.com/official-stockfish/Stockfish) | Strongest engine, TCEC champion |
| 2    | [Reckless 0.9.0](https://github.com/codedeliveryservice/Reckless)   | 3644       | NNUE       | AGPL-3.0 | [GitHub](https://github.com/codedeliveryservice/Reckless) | Written in Rust                 |
| 3    | [PlentyChess 7.0.0](https://github.com/Yoshie2000/PlentyChess)      | 3642       | NNUE       | GPL-3.0  | [GitHub](https://github.com/Yoshie2000/PlentyChess)       |                                 |
| 4    | [pawnocchio 2.0.1](https://github.com/JonathanHallstrom/pawnocchio) | 3641       | NNUE       | GPL-3.0  | [GitHub](https://github.com/JonathanHallstrom/pawnocchio) |                                 |
| 5    | Torch v4d                                                           | 3639       | Neural net | Private  |                                                           | Chess.com                       |
| 6    | [Coda 0.9.4](https://github.com/adamtwiss/coda)                     | 3638       | NNUE       | GPL-3.0  | [GitHub](https://github.com/adamtwiss/coda)               |                                 |
| 7    | [Integral v8](https://github.com/aronpetko/integral)                | 3638       | NNUE       | None     | [GitHub](https://github.com/aronpetko/integral)           | Free download                   |
| 8    | [Cinder 0.6.1](https://github.com/brunocodutra/cinder)              | 3637       | NNUE       | GPL-3.0  | [GitHub](https://github.com/brunocodutra/cinder)          |                                 |
| 9    | [Obsidian 16.0](https://github.com/gab8192/Obsidian)                | 3636       | NNUE       | GPL-3.0  | [GitHub](https://github.com/gab8192/Obsidian)             |                                 |
| 10   | [Alexandria 9.0.0](https://github.com/PGG106/Alexandria)            | 3635       | NNUE       | GPL-3.0  | [GitHub](https://github.com/PGG106/Alexandria)            |                                 |

Lc0 (Leela Chess Zero) is also among the strongest, especially with GPU support (CCRL FRC: ~4080 on RTX 5050).

- [Lc0 GitHub](https://github.com/LeelaChessZero/lc0)

Sources: [Rama Chess](https://ramachess.com/best-chess-engines/), [CCI Ratings](https://computer-chess-index.github.io/cci/)
