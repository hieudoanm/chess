# Board and move generation

`chess-core` owns all board state and rules. The central types:

- `Board` — piece placement, with FEN import/export.
- `Position` — full game state: side to move, castling rights, en passant
  target, halfmove and fullmove clocks.
- `Piece` / `PieceType` / `Color` — piece representation.
- `Square` — board squares with SAN notation.
- `Move` / `MoveType` — moves including promotions and castling.

## Legality filtering

Move generation produces pseudo-legal moves first, then filters out any move
that leaves the side's own king in check. The result is the set of fully legal
moves used by search, `chess moves`, and check/checkmate/stalemate detection.

## Key source files

- `crates/core/src/position.rs` — board state, check detection
- `crates/core/src/move_gen.rs` — move generation with legality filtering
- `crates/core/src/perft.rs` — perft node counting
- `crates/core/src/rules.rs` — evaluation, game result, apply_move
