use arena::{play_game, Engine, Results};

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let engine_path = args
        .get(1)
        .cloned()
        .unwrap_or_else(|| "../target/release/chess".to_string());
    let stockfish_path = args
        .get(2)
        .cloned()
        .unwrap_or_else(|| "/opt/homebrew/bin/stockfish".to_string());
    let games: u32 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(6);
    let depth: u32 = args.get(4).and_then(|s| s.parse().ok()).unwrap_or(7);
    let skill: u32 = args.get(5).and_then(|s| s.parse().ok()).unwrap_or(1);

    let mut results = Results::default();

    for g in 0..games {
        let our_color = if g % 2 == 0 { "white" } else { "black" };
        println!("\n--- Game {}: us={} ---", g + 1, our_color);

        let mut us = match Engine::new("us", &engine_path, &["uci"]) {
            Ok(e) => e,
            Err(e) => {
                println!("[WARN] our engine failed to start: {e}");
                continue;
            }
        };
        let mut sf = match Engine::new("stockfish", &stockfish_path, &["uci"]) {
            Ok(e) => e,
            Err(e) => {
                println!("[WARN] stockfish failed to start: {e}");
                us.close();
                continue;
            }
        };

        if skill < 20 {
            let _ = sf.send(&format!("setoption name Skill Level value {skill}"));
            let _ = sf.send("isready");
            let _ = sf.wait_for("readyok");
        }

        let (white, black) = if our_color == "white" {
            (&mut us, &mut sf)
        } else {
            (&mut sf, &mut us)
        };
        match play_game(white, black, depth, &[]) {
            Ok(game_result) => {
                let winner = game_result.winner.as_str();
                let reason = game_result.reason.as_str();
                match winner {
                    "draw" => results.draws += 1,
                    "white" => {
                        if our_color == "white" {
                            results.white_wins += 1;
                        } else {
                            results.black_wins += 1;
                        }
                    }
                    "black" => {
                        if our_color == "black" {
                            results.black_wins += 1;
                        } else {
                            results.white_wins += 1;
                        }
                    }
                    _ => {}
                }
                if reason == "engine_crash" {
                    results.crash_wins += 1;
                }

                let us_won = (winner == "white" && our_color == "white")
                    || (winner == "black" && our_color == "black");
                let outcome = if winner == "draw" {
                    "DRAW".to_string()
                } else if us_won {
                    if reason == "engine_crash" {
                        "WIN (us) [crash]".to_string()
                    } else {
                        "WIN (us)".to_string()
                    }
                } else {
                    "LOSS (us)".to_string()
                };

                println!(
                    "  Result: {:20} reason={:12} plies={:3}",
                    outcome,
                    reason,
                    game_result.moves.len()
                );
                println!("  Moves: {}", game_result.moves.join(" "));
            }
            Err(e) => {
                println!("[WARN] game error: {e}");
                us.close();
                sf.close();
                continue;
            }
        }

        us.close();
        sf.close();
    }

    println!("\n=== RESULTS ===");
    println!("Games:      {}", games);
    println!("Our wins:   {}", results.white_wins + results.black_wins);
    println!("  crash wins: {}", results.crash_wins);
    println!(
        "Our losses: {}",
        games.saturating_sub(results.white_wins + results.black_wins + results.draws)
    );
    println!("Our draws:  {}", results.draws);
    let score = (results.white_wins + results.black_wins) as f64 + 0.5 * results.draws as f64;
    println!(
        "Score: {}/{} ({:.1}%)",
        score,
        games,
        100.0 * score / games.max(1) as f64
    );
    println!("Stockfish skill: {skill}, our depth: {depth}");
}
