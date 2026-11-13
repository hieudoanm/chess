# Search and evaluation

`chess-engine` implements a negamax search with alpha-beta pruning over the
legal move list produced by `chess-core`.

- **Negamax** — the same search from both sides' perspectives; a position is
  scored from the point of view of the side to move.
- **Alpha-beta pruning** — cutoffs skip subtrees that cannot affect the result.
- **Evaluation** — material and piece-square heuristics in
  `crates/core/src/rules.rs`.

The CLI exposes the search through `chess play --depth N`, through UCI
`go depth N`, and through `chess bench` (perft, which counts nodes without
searching).

## Performance

`chess bench` reports nodes/sec for perft depths 1–5 — useful both as a
throughput measure and as a regression check, since perft counts are exact.
