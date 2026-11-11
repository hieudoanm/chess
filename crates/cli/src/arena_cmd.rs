use anyhow::Result;
use arena::{play_game, Engine};

fn split_cmd(cmd: &str) -> (String, Vec<String>) {
    let mut parts = cmd.split_whitespace();
    let prog = parts.next().unwrap_or(cmd).to_string();
    (prog, parts.map(|s| s.to_string()).collect())
}

pub fn run(
    white_cmd: &str,
    black_cmd: &str,
    games: u32,
    depth: u32,
    moves: Option<&str>,
) -> Result<()> {
    let (wprog, wargs) = split_cmd(white_cmd);
    let (bprog, bargs) = split_cmd(black_cmd);
    let wargs_ref: Vec<&str> = wargs.iter().map(|s| s.as_str()).collect();
    let bargs_ref: Vec<&str> = bargs.iter().map(|s| s.as_str()).collect();

    let start_moves: Vec<String> = moves
        .map(|m| m.split_whitespace().map(|s| s.to_string()).collect())
        .unwrap_or_default();

    let mut w_wins = 0u32;
    let mut b_wins = 0u32;
    let mut draws = 0u32;

    for g in 0..games.max(1) {
        let swap = g % 2 == 1;
        println!("\n--- Game {} ---", g + 1);

        let mut ew = Engine::new("white-cmd", &wprog, &wargs_ref)
            .map_err(|e| anyhow::anyhow!("{}: {}", white_cmd, e))?;
        let mut eb = Engine::new("black-cmd", &bprog, &bargs_ref)
            .map_err(|e| anyhow::anyhow!("{}: {}", black_cmd, e))?;

        let (white, black) = if swap {
            (&mut eb, &mut ew)
        } else {
            (&mut ew, &mut eb)
        };
        match play_game(white, black, depth, &start_moves) {
            Ok(res) => {
                let outcome = if res.winner == "draw" {
                    "draw".to_string()
                } else {
                    format!("{} wins", res.winner)
                };
                println!(
                    "  {} ({}, {} plies)",
                    outcome,
                    res.reason,
                    res.moves.len() - start_moves.len()
                );
                println!("  {}", res.moves.join(" "));
                let winner_is_white_cmd = (res.winner == "white") != swap;
                match res.winner.as_str() {
                    "white" | "black" => {
                        if winner_is_white_cmd {
                            w_wins += 1;
                        } else {
                            b_wins += 1;
                        }
                    }
                    _ => draws += 1,
                }
            }
            Err(e) => eprintln!("game error: {}", e),
        }
        ew.close();
        eb.close();
    }

    println!("\n=== RESULTS ===");
    println!("{}: {} wins", white_cmd, w_wins);
    println!("{}: {} wins", black_cmd, b_wins);
    println!("draws: {}", draws);
    Ok(())
}
