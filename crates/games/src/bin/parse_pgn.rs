use anyhow::Result;
use rusqlite::Connection;
use std::fs;

#[allow(clippy::regex_creation_in_loops)]
fn main() -> Result<()> {
    fs::create_dir_all("database")?;
    let conn = Connection::open("database/games.sqlite")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, file TEXT, event TEXT, site TEXT, date TEXT, round TEXT, white TEXT, black TEXT, result TEXT, time_control TEXT, white_elo TEXT, black_elo TEXT, pgn TEXT)",
        [],
    )?;

    for entry in glob::glob("pgn/**/*.pgn")? {
        let path = entry?;
        println!("Processing {}", path.display());
        let content = fs::read_to_string(&path)?;
        let mut count = 0;
        for game in content.split("\n\n[").filter(|s| !s.trim().is_empty()) {
            let game = if game.starts_with('[') { game.to_string() } else { format!("[{}", game) };
            // parse tags
            let mut tags = std::collections::BTreeMap::new();
            for cap in regex::Regex::new(r#"\[(\w+)\s+"([^"]*)"\]"#)?.captures_iter(&game) {
                tags.insert(cap[1].to_string(), cap[2].to_string());
            }
            let id = if let Some(link) = tags.get("Link") {
                regex::Regex::new(r"(\d+)$")
                    .unwrap()
                    .captures(link)
                    .and_then(|c| c.get(1))
                    .map(|m| m.as_str().to_string())
                    .unwrap_or_else(|| link.clone())
            } else {
                use std::collections::hash_map::DefaultHasher;
                use std::hash::{Hash, Hasher};
                let mut h = DefaultHasher::new();
                game.hash(&mut h);
                format!("{:x}", h.finish())
            };
            conn.execute(
                "INSERT OR REPLACE INTO games (id,file,event,site,date,round,white,black,result,time_control,white_elo,black_elo,pgn) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)",
                rusqlite::params![
                    id,
                    path.to_string_lossy(),
                    tags.get("Event"),
                    tags.get("Site"),
                    tags.get("Date"),
                    tags.get("Round"),
                    tags.get("White"),
                    tags.get("Black"),
                    tags.get("Result"),
                    tags.get("TimeControl"),
                    tags.get("WhiteElo"),
                    tags.get("BlackElo"),
                    game.trim()
                ],
            )?;
            count += 1;
        }
        println!("  Inserted {} games from {}", count, path.display());
    }
    // export to CSV
    use std::io::Write;
    let mut f = fs::File::create("database/games.csv")?;
    let mut stmt = conn.prepare("SELECT id,file,event,site,date,round,white,black,result,time_control,white_elo,black_elo FROM games")?;
    let cols = stmt.column_names();
    writeln!(f, "{}", cols.join(","))?;
    let rows = stmt.query_map([], |row| {
        Ok((0..12).map(|i| row.get::<_, Option<String>>(i).unwrap_or(None).unwrap_or_default()).collect::<Vec<_>>())
    })?;
    for row in rows {
        let r = row?;
        let line = r.iter().map(|s| format!("\"{}\"", s.replace('"', "\"\""))).collect::<Vec<_>>().join(",");
        writeln!(f, "{}", line)?;
    }
    Ok(())
}
