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

fn format_score(score: i32) -> String {
    if score > 90000 {
        format!("mate {}", (100000 - score + 1) / 2)
    } else if score < -90000 {
        format!("mate -{}", (100000 + score + 1) / 2)
    } else {
        format!("cp {}", score)
    }
}

fn handle_go(
    engine: &mut Engine,
    args: &[&str],
    out: &mut io::StdoutLock,
    moves_so_far: &[String],
) {
    let mut depth: Option<u32> = None;
    let mut movetime_ms: Option<u64> = None;
    let mut nodes: Option<u64> = None;
    let mut mate: Option<u32> = None;
    let mut wtime = 0u64;
    let mut btime = 0u64;
    let mut winc = 0u64;
    let mut binc = 0u64;
    let mut movestogo: Option<u32> = None;
    let mut multipv: u32 = 1;
    let mut infinite = false;

    let mut i = 0;
    while i < args.len() {
        let val = args.get(i + 1).and_then(|s| s.parse::<u64>().ok());
        match args[i] {
            "depth" => {
                depth = val.map(|v| v as u32);
                i += 2;
            }
            "movetime" => {
                movetime_ms = val;
                i += 2;
            }
            "nodes" => {
                nodes = val;
                i += 2;
            }
            "mate" => {
                mate = val.map(|v| v as u32);
                i += 2;
            }
            "wtime" => {
                wtime = val.unwrap_or(0);
                i += 2;
            }
            "btime" => {
                btime = val.unwrap_or(0);
                i += 2;
            }
            "winc" => {
                winc = val.unwrap_or(0);
                i += 2;
            }
            "binc" => {
                binc = val.unwrap_or(0);
                i += 2;
            }
            "movestogo" => {
                movestogo = val.map(|v| v as u32);
                i += 2;
            }
            "multipv" => {
                multipv = val.unwrap_or(1) as u32;
                i += 2;
            }
            "infinite" => {
                infinite = true;
                i += 1;
            }
            _ => {
                i += 1;
            }
        }
    }

    let side = if engine.position.side_to_move == chess_core::Color::White {
        "white"
    } else {
        "black"
    };
    let moves_refs: Vec<&str> = moves_so_far.iter().map(|s| s.as_str()).collect();

    if multipv == 1 {
        if let Some(book_move) = opening_book_move(&engine.position, side, &moves_refs) {
            if let Some(bm) = find_move_from_uci(&engine.position, &book_move) {
                apply_move(&mut engine.position, bm);
                writeln!(out, "bestmove {}", book_move).unwrap();
                out.flush().unwrap();
                return;
            }
        }
    }

    // Derive a movetime budget from clock + increment + movestogo when present.
    if movetime_ms.is_none() && (wtime > 0 || btime > 0) {
        let (time, inc) = if engine.position.side_to_move == chess_core::Color::White {
            (wtime, winc)
        } else {
            (btime, binc)
        };
        if time > 0 {
            let moves_left = movestogo.unwrap_or(30).max(1) as u64;
            movetime_ms = Some((time / moves_left).saturating_add(inc));
        }
    }

    let limits = chess_engine::SearchLimits {
        max_depth: mate.map(|m| (m * 2).min(128)).or(depth),
        movetime: movetime_ms.map(std::time::Duration::from_millis),
        nodes,
    };
    let limits = if infinite && limits.max_depth.is_none() && limits.movetime.is_none() {
        chess_engine::SearchLimits {
            movetime: Some(std::time::Duration::from_secs(30)),
            ..limits
        }
    } else {
        limits
    };
    let limits =
        if limits.max_depth.is_none() && limits.movetime.is_none() && limits.nodes.is_none() {
            chess_engine::SearchLimits {
                max_depth: Some(3),
                ..limits
            }
        } else {
            limits
        };

    if multipv > 1 {
        let lines = engine.search_multi(limits, multipv as usize);
        let depth_label = limits.max_depth.unwrap_or(4);
        for (k, line) in lines.iter().enumerate() {
            let pv: Vec<String> = line.pv.iter().map(|m| m.to_uci()).collect();
            writeln!(
                out,
                "info depth {} multipv {} score {} pv {}",
                depth_label,
                k + 1,
                format_score(line.score),
                pv.join(" ")
            )
            .unwrap();
        }
        match lines.first() {
            Some(line) => {
                apply_move(&mut engine.position, line.mv);
                writeln!(out, "bestmove {}", line.mv.to_uci()).unwrap();
            }
            None => writeln!(out, "bestmove 0000").unwrap(),
        }
        out.flush().unwrap();
        return;
    }

    let search = engine.search_limited(limits);
    for info in &search.infos {
        let pv: Vec<String> = info.pv.iter().map(|m| m.to_uci()).collect();
        writeln!(
            out,
            "info depth {} score {} nodes {} pv {}",
            info.depth,
            format_score(info.score),
            info.nodes,
            pv.join(" ")
        )
        .unwrap();
    }
    if let Some(bm) = search.best_move {
        apply_move(&mut engine.position, bm);
        writeln!(out, "bestmove {}", search.best_move.unwrap().to_uci()).unwrap();
    } else {
        writeln!(out, "bestmove 0000").unwrap();
    }
    out.flush().unwrap();
}
