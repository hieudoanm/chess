use chess_core::{apply_move, find_move_from_uci, Position};
use chess_engine::Engine;
use std::io::{self, BufRead, Write};

const ENGINE_NAME: &str = "chess";
const ENGINE_AUTHOR: &str = "Kilo";

// Opening book: maps move sequences to recommended book moves
// Each entry is (moves_so_far, our_color, book_move_uci)
const OPENING_BOOK: &[(&[&str], &str, &str)] = &[
    // White openings (we play white)
    (&[], "white", "e2e4"),
    (&["e2e4", "e7e5"], "white", "g1f3"),
    (&["e2e4", "e7e5", "g1f3", "b8c6"], "white", "f1c4"),
    (&["e2e4", "c7c5"], "white", "g1f3"),
    (&["e2e4", "e7e6"], "white", "d2d4"),
    (&["e2e4", "c7c6"], "white", "d2d4"),
    (&["d2d4", "d7d5"], "white", "c2c4"),
    (&["d2d4", "g8f6"], "white", "c2c4"),
    (&["c2c4"], "white", "g1f3"),
    (&["g1f3", "d7d5"], "white", "d2d4"),
    // Black openings (we play black)
    (&["e2e4"], "black", "e7e5"),
    (&["e2e4", "g1f3"], "black", "e7e5"),
    (&["e2e4", "g1f3", "b1c3"], "black", "e7e5"),
    (&["d2d4"], "black", "d7d5"),
    (&["d2d4", "d7d5", "c2c4"], "black", "e7e6"),
    (&["c2c4"], "black", "e7e5"),
    (&["g1f3", "d7d5"], "black", "g8f6"),
    // More common lines
    (&["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"], "white", "d2d3"),
    (
        &["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "d2d3"],
        "black",
        "g8f6",
    ),
    (
        &["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "d2d3", "g8f6"],
        "white",
        "g1e2",
    ),
];

fn opening_book_move(_position: &Position, side: &str, moves_so_far: &[&str]) -> Option<String> {
    for (seq, color, bm) in OPENING_BOOK {
        if *color == side
            && seq.len() == moves_so_far.len()
            && seq.iter().zip(moves_so_far.iter()).all(|(a, b)| a == b)
        {
            return Some((*bm).to_string());
        }
    }
    None
}

pub fn run() {
    let mut engine = Engine::new();
    let mut moves_so_far: Vec<String> = Vec::new();

    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut out = stdout.lock();

    for line in stdin.lock().lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => break,
        };
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        let parts: Vec<&str> = trimmed.split_whitespace().collect();
        if parts.is_empty() {
            continue;
        }

        match parts[0] {
            "uci" => {
                writeln!(out, "id name {}", ENGINE_NAME).unwrap();
                writeln!(out, "id author {}", ENGINE_AUTHOR).unwrap();
                writeln!(out, "uciok").unwrap();
                out.flush().unwrap();
            }
            "isready" => {
                writeln!(out, "readyok").unwrap();
                out.flush().unwrap();
            }
            "ucinewgame" => {
                engine = Engine::new();
                moves_so_far.clear();
            }
            "position" => {
                moves_so_far = handle_position(&mut engine, &parts[1..], &mut moves_so_far);
            }
            "go" => {
                handle_go(&mut engine, &parts[1..], &mut out, &moves_so_far);
            }
            "stop" => {
                // Best-effort; our search is synchronous and fast
            }
            "quit" => {
                break;
            }
            _ => {}
        }
    }
}

fn handle_position(
    engine: &mut Engine,
    args: &[&str],
    moves_so_far: &mut Vec<String>,
) -> Vec<String> {
    moves_so_far.clear();
    if args.is_empty() {
        return moves_so_far.clone();
    }

    let mut idx = if args[0] == "startpos" {
        engine.position = Position::standard();
        1
    } else if args[0] == "fen" {
        if args.len() < 7 {
            return moves_so_far.clone();
        }
        let fen = args[1..7].join(" ");
        match Position::from_fen(&fen) {
            Some(pos) => engine.position = pos,
            None => return moves_so_far.clone(),
        }
        7
    } else {
        return moves_so_far.clone();
    };

    if idx < args.len() && args[idx] == "moves" {
        idx += 1;
    }
    while idx < args.len() {
        if let Some(m) = find_move_from_uci(&engine.position, args[idx]) {
            apply_move(&mut engine.position, m);
            moves_so_far.push(args[idx].to_string());
        }
        idx += 1;
    }
    moves_so_far.clone()
}

fn handle_go(
    engine: &mut Engine,
    args: &[&str],
    out: &mut io::StdoutLock,
    moves_so_far: &[String],
) {
    let mut depth: u32 = 3;

    let mut i = 0;
    while i < args.len() {
        match args[i] {
            "depth" if i + 1 < args.len() => {
                depth = args[i + 1].parse().unwrap_or(3);
                i += 2;
                continue;
            }
            "wtime" | "btime" | "winc" | "binc" | "nodes" | "mate" | "infinite" => {
                i += 2;
                continue;
            }
            _ => {}
        }
        i += 1;
    }

    let side = if engine.position.side_to_move == chess_core::Color::White {
        "white"
    } else {
        "black"
    };
    let moves_refs: Vec<&str> = moves_so_far.iter().map(|s| s.as_str()).collect();

    if let Some(book_move) = opening_book_move(&engine.position, side, &moves_refs) {
        if let Some(bm) = find_move_from_uci(&engine.position, &book_move) {
            apply_move(&mut engine.position, bm);
            writeln!(out, "bestmove {}", book_move).unwrap();
            out.flush().unwrap();
            return;
        }
    }

    let search = engine.search(depth);
    if let Some(bm) = search.best_move {
        apply_move(&mut engine.position, bm);
        writeln!(out, "bestmove {}", search.best_move.unwrap().to_uci()).unwrap();
    } else {
        writeln!(out, "bestmove 0000").unwrap();
    }
    out.flush().unwrap();
}
