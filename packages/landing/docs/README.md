# chess documentation

**chess** is a multi-crate Rust chess engine with a command-line interface —
board representation, legal move generation, negamax search with alpha-beta
pruning, and a UCI-compatible CLI.

## Sections

- **Getting started** — install the `chess` binary and run your first commands.
- **Concepts** — how the board, move generation, and search engine fit together.
- **Guides** — the UCI protocol and the MCP server for editor integration.

## Crates

| Crate          | Purpose                                           |
| -------------- | ------------------------------------------------- |
| `chess-core`   | Board, pieces, move generation, rules, FEN        |
| `chess-engine` | Negamax search with alpha-beta pruning            |
| `chess-cli`    | `chess` binary: subcommands, UCI mode, MCP server |

## Installation guides

- [CLI on macOS (Apple Silicon)](guides/how-to-install-cli-macos-silicon.md)
- [CLI on macOS (Intel)](guides/how-to-install-cli-macos-intel.md)
- [CLI on Linux](guides/how-to-install-cli-linux.md)
- [CLI on Windows](guides/how-to-install-cli-windows.md)
- [Desktop app on macOS (Apple Silicon)](guides/how-to-install-desktop-macos-silicon.md)
- [Desktop app on macOS (Intel)](guides/how-to-install-desktop-macos-intel.md)
- [Desktop app on Linux](guides/how-to-install-desktop-linux.md)
- [Desktop app on Windows](guides/how-to-install-desktop-windows.md)
- [Browser extension on Chromium](guides/how-to-install-extension-chromium.md)
- [Browser extension on Firefox](guides/how-to-install-extension-gecko.md)
