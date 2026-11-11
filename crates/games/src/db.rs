use anyhow::{Context, Result};
use rusqlite::Connection;
use std::path::Path;

#[derive(Debug)]
pub struct GameRow {
    pub id: String,
    pub white: String,
    pub black: String,
    pub result: String,
    pub date: String,
    pub eco: String,
    pub pgn: String,
}

#[derive(Debug, Default)]
pub struct GameFilter {
    pub player: Option<String>,
    pub white: Option<String>,
    pub black: Option<String>,
    pub eco: Option<String>,
    pub result: Option<String>,
    pub moves_prefix: Option<String>,
    pub limit: Option<u32>,
}

fn extract_eco(pgn: &str) -> String {
    pgn.find("[ECO \"")
        .and_then(|idx| {
            let rest = &pgn[idx + 6..];
            rest.find('"').map(|end| rest[..end].to_string())
        })
        .unwrap_or_default()
}

/// Query the games database with optional filters. Returns matching rows
/// (most recent first is not guaranteed; order is by rowid).
pub fn query_games(db_path: &Path, filter: &GameFilter) -> Result<Vec<GameRow>> {
    let conn = Connection::open(db_path).with_context(|| format!("open {}", db_path.display()))?;
    conn.pragma_update(None, "case_sensitive_like", "ON")?;

    let mut sql = String::from("SELECT id, white, black, result, date, pgn FROM games WHERE 1=1");
    let mut params: Vec<String> = Vec::new();

    if let Some(p) = &filter.player {
        sql.push_str(" AND (white LIKE ? OR black LIKE ?)");
        params.push(format!("%{}%", p));
        params.push(format!("%{}%", p));
    }
    if let Some(w) = &filter.white {
        sql.push_str(" AND white LIKE ?");
        params.push(format!("%{}%", w));
    }
    if let Some(b) = &filter.black {
        sql.push_str(" AND black LIKE ?");
        params.push(format!("%{}%", b));
    }
    if let Some(r) = &filter.result {
        sql.push_str(" AND result = ?");
        params.push(r.clone());
    }
    if let Some(eco) = &filter.eco {
        sql.push_str(" AND pgn LIKE ?");
        params.push(format!("%[ECO \"{}\"]%", eco));
    }
    if let Some(prefix) = &filter.moves_prefix {
        // Requires san_moves column; create lazily if missing is handled by
        // explorer::opening_stats migration — here we degrade gracefully.
        let has: i64 = conn.query_row(
            "SELECT COUNT(*) FROM pragma_table_info('games') WHERE name = 'san_moves'",
            [],
            |r| r.get(0),
        )?;
        if has > 0 {
            sql.push_str(" AND (san_moves = ? OR san_moves LIKE ?)");
            params.push(prefix.clone());
            params.push(format!("{} %", prefix));
        }
    }
    if let Some(limit) = filter.limit {
        sql.push_str(&format!(" LIMIT {}", limit));
    }

    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map(rusqlite::params_from_iter(params.iter()), |row| {
        let pgn: String = row.get(5)?;
        Ok(GameRow {
            id: row.get(0)?,
            white: row.get(1)?,
            black: row.get(2)?,
            result: row.get(3)?,
            date: row.get(4)?,
            eco: extract_eco(&pgn),
            pgn,
        })
    })?;

    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

/// Fetch games whose id matches exactly or by unique prefix.
pub fn get_games_by_id(db_path: &Path, id: &str) -> Result<Vec<GameRow>> {
    let conn = Connection::open(db_path).with_context(|| format!("open {}", db_path.display()))?;
    let mut stmt = conn.prepare(
        "SELECT id, white, black, result, date, pgn FROM games
         WHERE id = ? OR id LIKE (? || '%')",
    )?;
    let rows = stmt.query_map(rusqlite::params![id, id], |row| {
        let pgn: String = row.get(5)?;
        Ok(GameRow {
            id: row.get(0)?,
            white: row.get(1)?,
            black: row.get(2)?,
            result: row.get(3)?,
            date: row.get(4)?,
            eco: extract_eco(&pgn),
            pgn,
        })
    })?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}
