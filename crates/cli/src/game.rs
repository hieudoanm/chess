use anyhow::{Context, Result};
use games::db::get_games_by_id;
use games::explorer::default_db_paths;

pub fn run(id: &str) -> Result<()> {
    let db = default_db_paths()
        .into_iter()
        .find(|p| p.exists())
        .context("games.sqlite not found")?;
    let games = get_games_by_id(&db, id)?;
    if games.is_empty() {
        anyhow::bail!("no game with id '{}'", id);
    }
    for g in &games {
        println!(
            "{} vs {}  {}  {}  [{}]",
            g.white, g.black, g.result, g.date, g.eco
        );
        println!("id: {}", g.id);
        println!("{}", g.pgn.trim());
        if games.len() > 1 {
            println!("---");
        }
    }
    Ok(())
}
