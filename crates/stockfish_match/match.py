#!/usr/bin/env python3
"""Stockfish match harness for the chess engine."""

import subprocess
import sys
import time

ENGINE_DEFAULT = "/Users/hieudoan/git/github.com/hieudoanm/chess/target/release/chess"
STOCKFISH_DEFAULT = "stockfish"
MAX_PLIES = 100


class UCIEngine:
    def __init__(self, name, cmd, options=None):
        self.name = name
        self.alive = True
        self.proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        try:
            self.send("uci")
            self.wait_for("uciok")
            if options:
                for k, v in (options or {}).items():
                    self.send(f"setoption name {k} value {v}")
            self.send("isready")
            self.wait_for("readyok")
        except Exception as e:
            print(f"[WARN] {name} failed to init: {e}", file=sys.stderr)
            self.alive = False

    def send(self, msg):
        if not self.alive:
            return
        try:
            self.proc.stdin.write(msg + "\n")
            self.proc.stdin.flush()
        except Exception:
            self.alive = False

    def readline(self):
        if not self.alive:
            raise RuntimeError(f"{self.name} is dead")
        line = self.proc.stdout.readline()
        if not line:
            self.alive = False
            raise RuntimeError(f"{self.name} exited")
        return line.strip()

    def wait_for(self, pattern):
        while True:
            line = self.readline()
            if pattern in line:
                return line

    def bestmove(self, moves, depth=3):
        if not self.alive:
            return "0000"
        if moves:
            self.send(f"position startpos moves {moves}")
        else:
            self.send("position startpos")
        self.send(f"go depth {depth}")
        while True:
            try:
                line = self.readline()
            except RuntimeError:
                return "0000"
            if line.startswith("bestmove"):
                parts = line.split()
                return parts[1] if len(parts) > 1 else "0000"
            if "CRITICAL ERROR" in line or "Illegal move" in line:
                self.alive = False
                return "0000"

    def close(self):
        if self.alive:
            try:
                self.send("quit")
            except Exception:
                pass
        try:
            self.proc.wait(timeout=3)
        except Exception:
            self.proc.kill()


def play_game(white, black, max_plies=MAX_PLIES, depth=3):
    moves = []
    start = time.time()
    for ply in range(max_plies):
        engine = white if ply % 2 == 0 else black
        bm = engine.bestmove(" ".join(moves), depth)
        if bm == "0000":
            if not engine.alive:
                return (
                    ("black" if ply % 2 == 0 else "white"),
                    moves,
                    time.time() - start,
                    "engine_crash",
                )
            return (
                ("black" if ply % 2 == 0 else "white"),
                moves,
                time.time() - start,
                "checkmate",
            )
        moves.append(bm)
        if not white.alive or not black.alive:
            loser = "white" if not white.alive else "black"
            return (
                ("black" if loser == "white" else "white"),
                moves,
                time.time() - start,
                "engine_crash",
            )
    return "draw", moves, time.time() - start, "max_plies"


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Chess engine vs Stockfish match")
    parser.add_argument(
        "--engine", default=ENGINE_DEFAULT, help="Path to our engine binary"
    )
    parser.add_argument(
        "--stockfish", default=STOCKFISH_DEFAULT, help="Path to Stockfish binary"
    )
    parser.add_argument("--games", type=int, default=6, help="Number of games")
    parser.add_argument(
        "--depth", type=int, default=7, help="Search depth for our engine"
    )
    parser.add_argument(
        "--skill", type=int, default=1, help="Stockfish skill level (0-20)"
    )
    args = parser.parse_args()

    results = {"us_wins": 0, "us_losses": 0, "draws": 0, "crash_wins": 0}
    stockfish_opts = {"Skill Level": args.skill}

    for g in range(args.games):
        our_color = "white" if g % 2 == 0 else "black"
        print(f"\n--- Game {g + 1}: us={our_color} ---")

        us = UCIEngine("us", [args.engine, "uci"])
        sf = UCIEngine("stockfish", [args.stockfish], stockfish_opts)

        if not us.alive or not sf.alive:
            print("[WARN] One engine failed to start, skipping game")
            us.close()
            sf.close()
            continue

        white = us if our_color == "white" else sf
        black = sf if our_color == "white" else us

        winner, moves, elapsed, reason = play_game(white, black, depth=args.depth)

        us.close()
        sf.close()

        is_crash_win = reason == "engine_crash"
        if winner == "draw":
            results["draws"] += 1
            outcome = "DRAW"
        elif (winner == "white" and our_color == "white") or (
            winner == "black" and our_color == "black"
        ):
            results["us_wins"] += 1
            if is_crash_win:
                results["crash_wins"] += 1
                outcome = "WIN (us) [SF crash]"
            else:
                outcome = "WIN (us) [valid]"
        else:
            results["us_losses"] += 1
            outcome = "LOSS (us)"

        print(
            f"  Result: {outcome:20s} reason={reason:12s} plies={len(moves):3d} time={elapsed:.1f}s"
        )
        print(f"  Moves: {' '.join(moves)}")

    print("\n=== RESULTS ===")
    print(f"Games:      {args.games}")
    print(
        f"Our wins:   {results['us_wins']} ({results['crash_wins']} crash, {results['us_wins'] - results['crash_wins']} valid)"
    )
    print(f"Our losses: {results['us_losses']}")
    print(f"Our draws:  {results['draws']}")
    valid_wins = results["us_wins"] - results["crash_wins"]
    score = valid_wins + 0.5 * results["draws"]
    print(f"Valid score: {score}/{args.games} ({100 * score / args.games:.1f}%)")
    print(f"Stockfish skill: {args.skill}, our depth: {args.depth}")


if __name__ == "__main__":
    main()
