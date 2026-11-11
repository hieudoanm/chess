use anyhow::{Context, Result};
use chess_core::{apply_move, find_move_from_uci, from_san, parse_pgn, Position};
use std::fs;
use std::io::{self, Write};

struct Puzzle {
    fen: String,
    solution: Vec<String>,
    id: String,
}

fn normalize_solution(fen: &str, tokens: &[String]) -> Option<Vec<String>> {
    let mut pos = Position::from_fen(fen)?;
    let mut out = Vec::new();
    for token in tokens {
        let m = from_san(&pos, token).or_else(|| find_move_from_uci(&pos, token))?;
        apply_move(&mut pos, m);
        out.push(m.to_uci());
    }
    Some(out)
}

fn load_puzzles(path: &str) -> Result<Vec<Puzzle>> {
    let text = fs::read_to_string(path).with_context(|| format!("read {}", path))?;
    let games = parse_pgn(&text);
    let mut puzzles = Vec::new();
    for g in games {
        let Some(fen) = g.headers.get("FEN") else {
            continue;
        };
        if g.moves.is_empty() {
            continue;
        }
        let Some(solution) = normalize_solution(fen, &g.moves) else {
            continue;
        };
        puzzles.push(Puzzle {
            fen: fen.clone(),
            solution,
            id: g
                .headers
                .get("PuzzleId")
                .or_else(|| g.headers.get("Site"))
                .cloned()
                .unwrap_or_default(),
        });
    }
    Ok(puzzles)
}

pub fn run(path: &str, limit: usize) -> Result<()> {
    let puzzles = load_puzzles(path)?;
    if puzzles.is_empty() {
        anyhow::bail!("no puzzles found (need FEN header + moves)");
    }
    let stdin = io::stdin();
    let mut solved = 0u32;
    let mut attempted = 0u32;

    for (i, puzzle) in puzzles.iter().take(limit.max(1)).enumerate() {
        let Some(mut pos) = Position::from_fen(&puzzle.fen) else {
            eprintln!("puzzle {}: invalid FEN, skipped", i + 1);
            continue;
        };
        println!(
            "\n--- Puzzle {} of {} ---",
            i + 1,
            puzzles.len().min(limit.max(1))
        );
        if !puzzle.id.is_empty() {
            println!("id: {}", puzzle.id);
        }
        println!("FEN: {}", puzzle.fen);

        let mut step = 0usize;
        let mut failed = false;
        while step < puzzle.solution.len() {
            print!("Your move (SAN or UCI, 'q' to quit): ");
            io::stdout().flush()?;
            let mut input = String::new();
            if stdin.read_line(&mut input)? == 0 {
                return Ok(());
            }
            let input = input.trim();
            if input == "q" || input == "quit" {
                return Ok(());
            }
            attempted += 1;
            let expected = find_move_from_uci(&pos, &puzzle.solution[step]).unwrap();
            let played = find_move_from_uci(&pos, input).or_else(|| from_san(&pos, input));
            match played {
                Some(m) if m == expected => {
                    apply_move(&mut pos, m);
                    step += 1;
                    if step < puzzle.solution.len() {
                        let reply = find_move_from_uci(&pos, &puzzle.solution[step]).unwrap();
                        apply_move(&mut pos, reply);
                        step += 1;
                        println!("Correct! Opponent plays on...");
                    } else {
                        println!("Correct! Puzzle solved.");
                    }
                }
                Some(_) => {
                    println!("Wrong. Expected: {}", expected.to_uci());
                    failed = true;
                    break;
                }
                None => println!("Could not parse '{}'", input),
            }
        }
        if !failed && step >= puzzle.solution.len() {
            solved += 1;
        }
    }
    println!("\nScore: {}/{}", solved, attempted);
    Ok(())
}
