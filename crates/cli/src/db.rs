use anyhow::{Context, Result};
use games::db::{query_games, GameFilter};
use games::explorer::default_db_paths;

pub fn run(filter: GameFilter, out: Option<&str>) -> Result<()> {
    let db = default_db_paths()
        .into_iter()
        .find(|p| p.exists())
        .context("games.sqlite not found (set CHESS_GAMES_DB or run parse-pgn)")?;
    let rows = query_games(&db, &filter)?;
    println!("{} games", rows.len());
    for g in &rows {
        println!(
            "{}  {} - {}  {}  {}  {}",
            g.date, g.white, g.black, g.result, g.eco, g.id
        );
    }
    if let Some(path) = out {
        let pgn = rows
            .iter()
            .map(|g| g.pgn.trim().to_string())
            .collect::<Vec<_>>()
            .join("\n\n");
        std::fs::write(path, format!("{}\n", pgn)).with_context(|| format!("write {}", path))?;
        eprintln!("wrote PGN to {}", path);
    }
    Ok(())
}
