# Contributing to chess

Thanks for contributing to chess, a multi-crate Rust chess engine with a CLI
interface.

## Repository layout

- `crates/core` (`chess-core`) — board, pieces, move generation, rules, FEN.
- `crates/engine` (`chess-engine`) — negamax search with alpha-beta pruning.
- `crates/cli` (`chess-cli`) — the `chess` binary: subcommands, UCI mode, MCP
  server.

## Setup

```bash
git clone https://github.com/hieudoanm/chess.git
cd chess
cargo build
```

## Checks

Run before opening a pull request:

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

CI runs the same checks plus a release build on every push to `master`.

## Conventions

- Rust 2021 edition; workspace members live in `crates/`.
- Keep crates focused: rules and move generation in `core`, search in
  `engine`, CLI surface in `cli`.
- The engine must keep speaking UCI (`chess uci`) and keep `chess bench`
  perft values correct at depths 1–3.
- Add tests for new move-generation, search, or CLI behavior.

## Pull requests

- Small, focused changes with a clear description.
- Update `README.md` or `AGENTS.md` when commands or structure change.
- Do not commit `nnue_weights.bin` changes or other large binaries unless the
  change is intentional.

## License

By contributing, you agree that your contributions will be licensed under the
repository license in [`LICENSE`](LICENSE).
