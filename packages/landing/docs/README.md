# chess documentation

**chess** is a multi-crate Rust chess engine with a command-line interface —
board representation, legal move generation, negamax search with alpha-beta
pruning, and a UCI-compatible CLI.

## Sections

- **Getting started** — install the `chess` binary and run your first commands.
- **Concepts** — how the board, move generation, and search engine fit together.
- **Guides** — the UCI protocol and the MCP server for editor integration.

## Crates

| Crate | Purpose |
| --- | --- |
| `chess-core` | Board, pieces, move generation, rules, FEN |
| `chess-engine` | Negamax search with alpha-beta pruning |
| `chess-cli` | `chess` binary: subcommands, UCI mode, MCP server |
