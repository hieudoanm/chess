#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["requests"]
# ///
"""All games a Chess.com username has played vs titled players.

Usage:
    ./versus.py <username> [--dir PATH] [--max-archives N]

Fetches the titled-player lists for GM/IM/FM/CM/NM/WGM/WIM/WFM/WCM/WNM,
downloads the user's monthly game archives, and writes CSVs into
<dir>/csv/<username>_* plus JSON copies into <dir>/json/<username>_*:

    <username>_games.csv      every game vs a titled player (W/D/L per row)
    <username>_opponents.csv  per-opponent win/draw/loss counts and score
    <username>_stats.json     full stats payload for index.html
"""

import argparse
import csv
import json
import re
import sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import requests

BASE = "https://api.chess.com/pub"
TITLES = ["GM", "IM", "FM", "CM", "NM", "WGM", "WIM", "WFM", "WCM", "WNM"]
MAX_WORKERS = 8
SPEEDS = ["bullet", "blitz", "rapid", "-"]


def speed_of(time_control: str) -> str:
    """Classify a 'base+increment' time control as bullet/blitz/rapid."""
    base = time_control.split("+")[0].strip()
    if not base.isdigit():
        return "-"
    secs = int(base)
    if secs < 180:
        return "bullet"
    if secs < 600:
        return "blitz"
    return "rapid"


session = requests.Session()
session.headers["User-Agent"] = "chess-versus/0.1"


def get_json(url: str):
    r = session.get(url, timeout=30)
    r.raise_for_status()
    return r.json()


def fetch_titled() -> dict[str, set[str]]:
    titled: dict[str, set[str]] = defaultdict(set)
    for title in TITLES:
        players = get_json(f"{BASE}/titled/{title}").get("players", [])
        for p in players:
            titled[p.lower()].add(title)
        print(f"  {title}: {len(players)} players", file=sys.stderr)
    return titled


def fetch_archives(username: str) -> list[str]:
    return get_json(f"{BASE}/player/{username}/games/archives").get("archives", [])


def iter_games(pgn: str):
    """Yield header dicts for each game in a PGN blob."""
    headers = {}
    for line in pgn.splitlines():
        line = line.strip()
        if line.startswith("[") and line.endswith("]"):
            m = re.match(r'\[(\w+)\s+"(.*)"\]', line)
            if m:
                headers[m.group(1)] = m.group(2)
        elif line == "" or not line.startswith("["):
            if headers:
                yield headers
                headers = {}
    if headers:
        yield headers


def game_outcome(g: dict, user_lower: str):
    """Return (opponent, user_is_white, result) if the game involves a titled player."""
    white = g.get("White", "").lower()
    black = g.get("Black", "").lower()
    if white == user_lower:
        opp, is_white = black, True
    elif black == user_lower:
        opp, is_white = white, False
    else:
        return None
    return opp, is_white


def scan_archive(args) -> list[dict]:
    url, user_lower, titled = args
    try:
        pgn = session.get(f"{url}/pgn", timeout=60).text
    except requests.RequestException as e:
        print(f"  archive failed {url}: {e}", file=sys.stderr)
        return []
    found = []
    for g in iter_games(pgn):
        info = game_outcome(g, user_lower)
        if info is None:
            continue
        opp, is_white = info
        titles = titled.get(opp)
        if not titles:
            continue
        result = g.get("Result", "*")
        if result == "1/2-1/2":
            outcome = "draw"
        elif (is_white and result == "1-0") or (not is_white and result == "0-1"):
            outcome = "win"
        else:
            outcome = "loss"
        tc = g.get("TimeControl", "-")
        found.append(
            {
                "opponent": opp,
                "title": "/".join(sorted(titles)),
                "date": g.get("Date", ""),
                "result": result,
                "outcome": outcome,
                "eco": g.get("ECO", ""),
                "time_control": tc,
                "speed": speed_of(tc),
            }
        )
    return found


def write_csv(path: Path, header: list[str], rows) -> None:
    with path.open("w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(header)
        w.writerows(rows)


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("username")
    ap.add_argument("--dir", type=Path, default=None)
    ap.add_argument("--max-archives", type=int, default=None)
    args = ap.parse_args()

    base_dir = args.dir or Path(__file__).resolve().parent / "versus"
    csv_dir = base_dir / "csv"
    json_dir = base_dir / "json"
    csv_dir.mkdir(parents=True, exist_ok=True)
    json_dir.mkdir(parents=True, exist_ok=True)
    user = args.username.lower()

    print("Fetching titled players...", file=sys.stderr)
    titled = fetch_titled()
    print(f"Total titled usernames: {len(titled)}", file=sys.stderr)

    profile = get_json(f"{BASE}/player/{args.username}")
    canonical = profile.get("username", args.username)
    player_info = {
        "name": profile.get("name", ""),
        "country": profile.get("country", ""),
        "joined": profile.get("joined", 0),
        "last_online": profile.get("last_online", 0),
        "status": profile.get("status", ""),
        "url": profile.get("url", ""),
        "avatar": profile.get("avatar", ""),
    }
    print(f"Player: {canonical} ({player_info['name']})", file=sys.stderr)

    archives = fetch_archives(canonical)
    archives.sort()
    if args.max_archives:
        archives = archives[: args.max_archives]
    print(f"Archives to scan: {len(archives)}", file=sys.stderr)

    user_lower = canonical.lower()
    games: list[dict] = []
    done = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = [
            ex.submit(scan_archive, (url, user_lower, titled)) for url in archives
        ]
        for f in futures:
            games.extend(f.result())
            done += 1
            if done % 10 == 0:
                print(f"  scanned {done}/{len(archives)}", file=sys.stderr)

    games.sort(key=lambda g: g["date"])
    game_rows = [
        [
            g["opponent"],
            g["title"],
            g["date"],
            g["result"],
            g["outcome"],
            g["eco"],
            g["time_control"],
            g["speed"],
        ]
        for g in games
    ]
    write_csv(
        csv_dir / f"{user}_games.csv",
        ["opponent", "title", "date", "result", "outcome", "eco", "time_control", "speed"],
        game_rows,
    )
    write_json(json_dir / f"{user}_games.json", games)

    # Per-opponent W/D/L aggregation
    agg: dict[str, dict] = {}
    for g in games:
        e = agg.setdefault(
            g["opponent"],
            {
                "title": g["title"],
                "games": 0,
                "wins": 0,
                "draws": 0,
                "losses": 0,
                "first": "",
                "last": "",
            },
        )
        e["games"] += 1
        e[{"win": "wins", "draw": "draws", "loss": "losses"}[g["outcome"]]] += 1
        if not e["first"] or g["date"] < e["first"]:
            e["first"] = g["date"]
        if g["date"] > e["last"]:
            e["last"] = g["date"]

    opponents = []
    for opp, e in sorted(agg.items(), key=lambda kv: (-kv[1]["games"], kv[0])):
        score = (e["wins"] + 0.5 * e["draws"]) / e["games"] if e["games"] else 0.0
        opponents.append(
            {
                "opponent": opp,
                "title": e["title"],
                "games": e["games"],
                "wins": e["wins"],
                "draws": e["draws"],
                "losses": e["losses"],
                "score": round(score, 4),
                "first_date": e["first"],
                "last_date": e["last"],
            }
        )
    write_csv(
        csv_dir / f"{user}_opponents.csv",
        ["opponent", "title", "games", "wins", "draws", "losses", "score", "first_date", "last_date"],
        [
            [
                o["opponent"],
                o["title"],
                o["games"],
                o["wins"],
                o["draws"],
                o["losses"],
                o["score"],
                o["first_date"],
                o["last_date"],
            ]
            for o in opponents
        ],
    )
    write_json(json_dir / f"{user}_opponents.json", opponents)

    # Full stats payload for index.html
    def wdl(rows):
        w = sum(g["outcome"] == "win" for g in rows)
        d = sum(g["outcome"] == "draw" for g in rows)
        l = sum(g["outcome"] == "loss" for g in rows)
        n = len(rows)
        return {
            "games": n,
            "wins": w,
            "draws": d,
            "losses": l,
            "score": round((w + 0.5 * d) / n, 4) if n else 0.0,
        }

    by_speed = {s: wdl([g for g in games if g["speed"] == s]) for s in SPEEDS}

    title_users: dict[str, set[str]] = defaultdict(set)
    for o in opponents:
        for t in o["title"].split("/"):
            title_users[t].add(o["opponent"])
    by_title = []
    for t in TITLES:
        rows = [g for g in games if t in g["title"].split("/")]
        entry = wdl(rows)
        entry["title"] = t
        entry["players"] = len(title_users.get(t, ()))
        entry["usernames"] = sorted(title_users.get(t, ()))
        entry["by_speed"] = {
            s: wdl([g for g in rows if g["speed"] == s]) for s in SPEEDS
        }
        by_title.append(entry)

    eco_agg: dict[str, dict] = {}
    for g in games:
        e = eco_agg.setdefault(g["eco"], {"games": 0, "wins": 0, "draws": 0, "losses": 0})
        e["games"] += 1
        e[{"win": "wins", "draw": "draws", "loss": "losses"}[g["outcome"]]] += 1
    by_eco = sorted(
        (
            {
                "eco": eco,
                "games": e["games"],
                "wins": e["wins"],
                "draws": e["draws"],
                "losses": e["losses"],
                "score": round(
                    (e["wins"] + 0.5 * e["draws"]) / e["games"], 4
                ),
            }
            for eco, e in eco_agg.items()
        ),
        key=lambda x: (-x["games"], x["eco"]),
    )

    stats = {
        "username": canonical,
        "player": player_info,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "totals": wdl(games),
        "by_speed": by_speed,
        "by_title": by_title,
        "by_eco": by_eco,
        "opponents": opponents,
        "games": games,
    }
    write_json(json_dir / f"{user}_stats.json", stats)

    totals = stats["totals"]
    print(
        f"Games vs titled players: {totals['games']} "
        f"({totals['wins']}W {totals['draws']}D {totals['losses']}L)",
        file=sys.stderr,
    )
    print(f"Unique opponents: {len(opponents)}", file=sys.stderr)
    for o in opponents[:20]:
        print(
            f"  {o['opponent']:<25} {o['title']:<12} "
            f"{o['wins']}W {o['draws']}D {o['losses']}L  score={o['score']:.3f}"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
