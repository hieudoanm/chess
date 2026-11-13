# Quickstart

## View the starting position

```bash
chess board
```

Prints the FEN of the standard initial position.

## List legal moves

```bash
chess moves
```

Lists the legal moves from the starting position.

## Play against the engine

```bash
chess play --depth 3
```

Interactive play; `--depth` controls the search depth per move.

## Benchmark

```bash
chess bench
```

Runs a perft benchmark over depths 1–5 and reports nodes per second. Depths
1–3 match published perft values (20, 400, 8902), which makes it a quick
correctness check after changes.
