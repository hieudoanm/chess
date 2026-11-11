use anyhow::{Context, Result};
use chess_core::{
    apply_move, find_move_from_uci, from_san, opening_for_moves, to_fen, to_san, Position,
};
use games::explorer::{default_db_paths, opening_stats};
use games::lichess::explorer;

/// Convert user-supplied move tokens (SAN or UCI) into a SAN prefix and the
/// resulting position.
pub fn moves_to_prefix(tokens: &[String]) -> Result<(Position, Vec<String>)> {
    let mut pos = Position::standard();
    let mut sans = Vec::new();
    for tok in tokens {
        let m = from_san(&pos, tok)
            .or_else(|| find_move_from_uci(&pos, tok))
            .with_context(|| format!("cannot parse move '{}'", tok))?;
        sans.push(to_san(&pos, m));
        apply_move(&mut pos, m);
    }
    Ok((pos, sans))
}

pub fn run(tokens: &[String], online: bool) -> Result<()> {
    let (pos, prefix) = moves_to_prefix(tokens)?;

    if online {
        return run_online(&pos);
    }

    if let Some((eco, name)) = opening_for_moves(&prefix) {
        println!("{} {}", eco, name);
    }
    let label = if prefix.is_empty() {
        "start position".to_string()
    } else {
        prefix.join(" ")
    };
    let db = default_db_paths()
        .into_iter()
        .find(|p| p.exists())
        .context("games.sqlite not found (set CHESS_GAMES_DB or run parse-pgn)")?;
    let stats = opening_stats(&db, &prefix)?;

    println!("Opening explorer: {}", label);
    println!("Database: {}", db.display());
    println!("Games: {}", stats.games);
    if stats.games == 0 {
        println!("No games found for this prefix.");
        return Ok(());
    }
    println!(
        "Score (White): {:.1}%  (draws {:.1}%)",
        stats.score_white() * 100.0,
        stats.draws as f64 / stats.games as f64 * 100.0
    );
    println!(
        "Avg rating: White {:.0}  Black {:.0}",
        stats.avg_white_elo, stats.avg_black_elo
    );
    if !stats.continuations.is_empty() {
        println!("\nTop continuations:");
        for (san, count) in &stats.continuations {
            println!(
                "  {:<8} {:>6} ({:.1}%)",
                san,
                count,
                *count as f64 / stats.games as f64 * 100.0
            );
        }
    }
    Ok(())
}

fn run_online(pos: &Position) -> Result<()> {
    let rt = tokio::runtime::Runtime::new()?;
    let result = rt.block_on(explorer(&to_fen(pos), &[]))?;

    if !result.opening.name.is_empty() {
        println!("{} {}", result.opening.eco, result.opening.name);
    }
    let total = result.white.total() + result.black.total() + result.draws;
    println!("Games: {}", total);
    if total == 0 {
        println!("No games found for this position.");
        return Ok(());
    }
    println!(
        "Score (White to move side): {:.1}%",
        if total > 0 {
            let side = if pos.side_to_move == chess_core::Color::White {
                &result.white
            } else {
                &result.black
            };
            (side.win as f64 + result.draws as f64 * 0.5) / total as f64 * 100.0
        } else {
            0.0
        }
    );
    if !result.moves.is_empty() {
        println!("\nTop moves:");
        for m in &result.moves {
            let mt = m.white + m.draws + m.black;
            let pct = if mt > 0 {
                m.white as f64 / mt as f64 * 100.0
            } else {
                0.0
            };
            println!(
                "  {:<8} {:>6} games  white-score {:.1}%  avg rating {}",
                m.san, mt, pct, m.average_rating
            );
        }
    }
    Ok(())
}
