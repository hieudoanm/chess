use chess_core::{apply_move, find_move_from_uci, Position};
use chess_engine::Engine;
use std::io::{self, BufRead, Write};

const ENGINE_NAME: &str = "chess";
const ENGINE_AUTHOR: &str = "Kilo";

pub fn run() {
    let mut engine = Engine::new();

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
            }
            "position" => {
                handle_position(&mut engine, &parts[1..]);
            }
            "go" => {
                handle_go(&mut engine, &parts[1..], &mut out);
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

fn handle_position(engine: &mut Engine, args: &[&str]) {
    if args.is_empty() {
        return;
    }

    let mut idx = if args[0] == "startpos" {
        engine.position = Position::standard();
        1
    } else if args[0] == "fen" {
        if args.len() < 7 {
            return;
        }
        let fen = args[1..7].join(" ");
        match Position::from_fen(&fen) {
            Some(pos) => engine.position = pos,
            None => return,
        }
        7
    } else {
        return;
    };

    if idx < args.len() && args[idx] == "moves" {
        idx += 1;
    }
    while idx < args.len() {
        if let Some(m) = find_move_from_uci(&engine.position, args[idx]) {
            apply_move(&mut engine.position, m);
        }
        idx += 1;
    }
}

fn handle_go(engine: &mut Engine, args: &[&str], out: &mut io::StdoutLock) {
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

    let search = engine.search(depth);
    if let Some(bm) = search.best_move {
        apply_move(&mut engine.position, bm);
        writeln!(out, "bestmove {}", search.best_move.unwrap().to_uci()).unwrap();
    } else {
        writeln!(out, "bestmove 0000").unwrap();
    }
    out.flush().unwrap();
}
