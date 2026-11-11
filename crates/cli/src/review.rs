use anyhow::{Context, Result};
use chess_core::{
    apply_move, calculate_accuracy, classify_move, from_san, parse_pgn, to_san,
    win_percent_from_centipawns, MoveClass, PgnGame, Position,
};
use chess_engine::{Engine, SearchLimits};
use std::fs;

struct MoveEval {
    san: String,
    best_san: String,
    best_score: i32,
    played_score: i32,
    win_percent_lost: f64,
    class: MoveClass,
    side: chess_core::Color,
}

fn search_limits(depth: u32, movetime_ms: Option<u64>) -> SearchLimits {
    SearchLimits {
        max_depth: if movetime_ms.is_some() {
            None
        } else {
            Some(depth)
        },
        movetime: movetime_ms.map(std::time::Duration::from_millis),
        nodes: None,
    }
}

fn eval_position(
    engine: &mut Engine,
    pos: &Position,
    limits: SearchLimits,
) -> (i32, Option<chess_core::Move>) {
    engine.position = pos.clone();
    let search = engine.search_limited(limits);
    (search.score, search.best_move)
}

fn review_game(
    engine: &mut Engine,
    start: &Position,
    sans: &[String],
    limits: SearchLimits,
) -> Vec<MoveEval> {
    let mut pos = start.clone();
    let mut out = Vec::new();
    for san in sans {
        let (best_score, best_move) = eval_position(engine, &pos, limits);
        let best_san = best_move
            .map(|m| to_san(&pos, m))
            .unwrap_or_else(|| "?".to_string());
        let played = match from_san(&pos, san) {
            Some(m) => m,
            None => break,
        };
        let mut after = pos.clone();
        apply_move(&mut after, played);
        let (after_score, _) = eval_position(engine, &after, limits);
        let played_score = -after_score;
        let wp_best = win_percent_from_centipawns(best_score as f64);
        let wp_played = win_percent_from_centipawns(played_score as f64);
        let wpl = (wp_best - wp_played).max(0.0);
        out.push(MoveEval {
            san: san.clone(),
            best_san,
            best_score,
            played_score,
            win_percent_lost: wpl,
            class: classify_move(wpl),
            side: pos.side_to_move,
        });
        apply_move(&mut pos, played);
    }
    out
}

fn cp_label(score: i32) -> String {
    if score > 90000 {
        format!("M{}", (100000 - score + 1) / 2)
    } else if score < -90000 {
        format!("-M{}", (100000 + score + 1) / 2)
    } else {
        format!("{:+}", score)
    }
}

fn eval_games(
    engine: &mut Engine,
    games: &[PgnGame],
    limits: SearchLimits,
) -> Result<Vec<(PgnGame, Vec<MoveEval>)>> {
    let mut out = Vec::new();
    for game in games {
        let start = game
            .headers
            .get("FEN")
            .and_then(|f| Position::from_fen(f))
            .unwrap_or_else(Position::standard);
        let evals = review_game(engine, &start, &game.moves, limits);
        if !evals.is_empty() {
            out.push((game.clone(), evals));
        }
    }
    Ok(out)
}

fn print_game(evals: &[MoveEval]) {
    println!(
        "{:>4} {:<10} {:<10} {:>7} {:>7} {:>7}  Class",
        "#", "Played", "Best", "Played", "Best", "Lost"
    );
    let mut acc_white = (0.0, 0u32);
    let mut acc_black = (0.0, 0u32);
    let mut blunders = Vec::new();
    for (i, e) in evals.iter().enumerate() {
        println!(
            "{:>4} {:<10} {:<10} {:>7} {:>7} {:>6.1}%  {}",
            i + 1,
            e.san,
            e.best_san,
            cp_label(e.played_score),
            cp_label(e.best_score),
            e.win_percent_lost,
            e.class.label()
        );
        let acc = calculate_accuracy(e.win_percent_lost);
        match e.side {
            chess_core::Color::White => {
                acc_white.0 += acc;
                acc_white.1 += 1;
            }
            chess_core::Color::Black => {
                acc_black.0 += acc;
                acc_black.1 += 1;
            }
        }
        if e.class == MoveClass::Blunder || e.class == MoveClass::Mistake {
            blunders.push(format!(
                "{}.{} {} ({})",
                i / 2 + 1,
                if i % 2 == 0 { "" } else { ".." },
                e.san,
                e.class.label()
            ));
        }
    }
    let avg = |(s, n): (f64, u32)| if n > 0 { s / n as f64 } else { 0.0 };
    println!(
        "Accuracy: White {:.1}%  Black {:.1}%",
        avg(acc_white),
        avg(acc_black)
    );
    if !blunders.is_empty() {
        println!("Notable: {}", blunders.join(", "));
    }
}

fn export_game(game: &PgnGame, evals: &[MoveEval]) -> PgnGame {
    let mut annotated = PgnGame {
        headers: game.headers.clone(),
        moves: Vec::new(),
        result: game.result.clone(),
    };
    for (san, e) in game.moves.iter().zip(evals.iter()) {
        annotated.moves.push(format!(
            "{} {{ [%eval {}] best {} }}",
            san,
            cp_label(e.played_score),
            e.best_san
        ));
    }
    annotated
}

pub fn run(
    input: Option<&str>,
    fen: Option<&str>,
    moves: Option<&str>,
    depth: u32,
    movetime_ms: Option<u64>,
    export: Option<&str>,
) -> Result<()> {
    let limits = search_limits(depth, movetime_ms);
    let mut engine = Engine::new();

    // Case 1: --fen + --moves -> a single synthetic game.
    if let Some(f) = fen {
        Position::from_fen(f).context("invalid FEN")?;
        let sans: Vec<String> = moves
            .unwrap_or("")
            .split_whitespace()
            .map(|s| s.to_string())
            .collect();
        let mut headers = std::collections::BTreeMap::new();
        headers.insert("FEN".to_string(), f.to_string());
        headers.insert("SetUp".to_string(), "1".to_string());
        let game = PgnGame {
            headers,
            moves: sans,
            result: "*".to_string(),
        };
        let results = eval_games(&mut engine, &[game], limits)?;
        for (game, evals) in &results {
            println!("\n=== Game ===");
            print_game(evals);
            if export.is_some() {
                write_export(export, &[export_game(game, evals)])?;
            }
        }
        return Ok(());
    }

    // Case 2: input path or literal PGN/FEN text.
    let input = input.context("provide a PGN file/FEN or --fen")?;
    let text = if std::path::Path::new(input).exists() {
        fs::read_to_string(input).with_context(|| format!("read {}", input))?
    } else {
        input.to_string()
    };

    // Literal FEN + --moves?
    if let Some(pos) = Position::from_fen(&text) {
        if let Some(m) = moves {
            let sans: Vec<String> = m.split_whitespace().map(|s| s.to_string()).collect();
            let mut headers = std::collections::BTreeMap::new();
            headers.insert("FEN".to_string(), to_fen_public(&pos));
            headers.insert("SetUp".to_string(), "1".to_string());
            let game = PgnGame {
                headers,
                moves: sans,
                result: "*".to_string(),
            };
            let results = eval_games(&mut engine, &[game], limits)?;
            for (_, evals) in &results {
                println!("\n=== Game ===");
                print_game(evals);
            }
            return Ok(());
        }
        // Bare FEN: show the position, nothing to review.
        println!("{}", to_fen_public(&pos));
        println!("(no moves to review — pass --moves \"...\" or a PGN)");
        return Ok(());
    }

    let games = parse_pgn(&text);
    if games.is_empty() {
        anyhow::bail!("no games found");
    }
    let results = eval_games(&mut engine, &games, limits)?;
    let mut exported = Vec::new();
    for (gi, (game, evals)) in results.iter().enumerate() {
        println!("\n=== Game {} ===", gi + 1);
        print_game(evals);
        exported.push(export_game(game, evals));
    }
    if let Some(path) = export {
        write_export(Some(path), &exported)?;
    }
    Ok(())
}

fn to_fen_public(pos: &Position) -> String {
    chess_core::to_fen(pos)
}

fn write_export(path: Option<&str>, games: &[PgnGame]) -> Result<()> {
    let Some(path) = path else { return Ok(()) };
    fs::write(path, chess_core::to_pgn(games)).with_context(|| format!("write {}", path))?;
    eprintln!("wrote annotated PGN to {}", path);
    Ok(())
}
