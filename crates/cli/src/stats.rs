use anyhow::{Context, Result};
use chess_core::eco_name;
use games::explorer::default_db_paths;
use games::stats::{player_history, player_stats, player_time_controls};

pub fn run(player: &str, history: bool, time_control: bool) -> Result<()> {
    let db = default_db_paths()
        .into_iter()
        .find(|p| p.exists())
        .context("games.sqlite not found (set CHESS_GAMES_DB or run parse-pgn)")?;
    let stats = player_stats(&db, player)?;

    println!("Player stats: {}", player);
    println!("Database: {}", db.display());
    println!("Games: {}", stats.games);
    if stats.games == 0 {
        println!("No games found.");
        return Ok(());
    }
    println!(
        "Score: {:.1}%  ({}W {}D {}L)",
        stats.score() * 100.0,
        stats.wins,
        stats.draws,
        stats.losses
    );
    println!(
        "As White: {}/{} wins ({:.0}%)   As Black: {}/{} wins ({:.0}%)",
        stats.white_wins,
        stats.white_games,
        if stats.white_games > 0 {
            stats.white_wins as f64 / stats.white_games as f64 * 100.0
        } else {
            0.0
        },
        stats.black_wins,
        stats.black_games,
        if stats.black_games > 0 {
            stats.black_wins as f64 / stats.black_games as f64 * 100.0
        } else {
            0.0
        }
    );
    println!(
        "Avg rating: own {:.0}  opponents {:.0}",
        stats.avg_own_elo, stats.avg_opp_elo
    );
    if !stats.top_openings.is_empty() {
        println!("\nTop openings:");
        for (eco, count) in &stats.top_openings {
            let name = eco_name(eco).unwrap_or("?");
            println!("  {:<5} {:<35} {:>5}", eco, name, count);
        }
    }
    if history {
        let months = player_history(&db, player)?;
        if !months.is_empty() {
            println!("\nScore by month:");
            for m in months {
                println!(
                    "  {}  {:>4} games  {:>5.1}%  ({}W {}D {}L)",
                    m.month,
                    m.games,
                    m.score() * 100.0,
                    m.wins,
                    m.draws,
                    m.losses
                );
            }
        }
    }
    if time_control {
        let tcs = player_time_controls(&db, player)?;
        if !tcs.is_empty() {
            println!("\nBy time control:");
            for t in tcs {
                println!(
                    "  {:<18} {:>5} games  {:>5.1}%  ({}W {}D {}L)",
                    t.time_control,
                    t.games,
                    t.score() * 100.0,
                    t.wins,
                    t.draws,
                    t.losses
                );
            }
        }
    }
    Ok(())
}
