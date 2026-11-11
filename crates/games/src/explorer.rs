use anyhow::{Context, Result};
use rusqlite::Connection;
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Default)]
pub struct OpeningStats {
    pub games: u64,
    pub white_wins: u64,
    pub draws: u64,
    pub black_wins: u64,
    pub avg_white_elo: f64,
    pub avg_black_elo: f64,
    pub continuations: Vec<(String, u64)>,
}

impl OpeningStats {
    pub fn score_white(&self) -> f64 {
        if self.games == 0 {
            return 0.0;
        }
        (self.white_wins as f64 + self.draws as f64 * 0.5) / self.games as f64
    }
}

/// Strip `{...}` comments, `(...)` variations, `;` and `%` line comments and
/// collect SAN move tokens (move numbers, NAGs and results removed, `!`/`?`
/// annotations stripped).
pub fn movetext_sans(pgn: &str) -> Vec<String> {
    let Some(start) = pgn.find("\n\n").or_else(|| pgn.find("\r\n\r\n")) else {
        return Vec::new();
    };
    let text = &pgn[start..];
    let bytes = text.as_bytes();
    let mut i = 0;
    let mut depth_paren = 0u32;
    let mut in_brace = false;
    let mut in_line_comment = false;
    let mut tokens = Vec::new();
    let mut cur = String::new();

    while i < bytes.len() {
        let c = bytes[i] as char;
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
            }
            i += 1;
            continue;
        }
        if in_brace {
            if c == '}' {
                in_brace = false;
            }
            i += 1;
            continue;
        }
        match c {
            '{' => in_brace = true,
            '(' => depth_paren += 1,
            ')' => depth_paren = depth_paren.saturating_sub(1),
            ';' | '%' if depth_paren == 0 => in_line_comment = true,
            c if c.is_whitespace() => {
                push_token(&mut tokens, &mut cur);
            }
            _ if depth_paren == 0 => cur.push(c),
            _ => {}
        }
        i += 1;
    }
    push_token(&mut tokens, &mut cur);
    tokens
}

fn push_token(tokens: &mut Vec<String>, cur: &mut String) {
    if cur.is_empty() {
        return;
    }
    let tok = cur.trim_end_matches(['!', '?']).to_string();
    cur.clear();
    if tok.is_empty() || tok.starts_with('$') || is_move_number(&tok) || is_result(&tok) {
        return;
    }
    tokens.push(tok);
}

fn is_move_number(tok: &str) -> bool {
    tok.contains('.') && tok.chars().all(|c| c.is_ascii_digit() || c == '.')
}

fn is_result(tok: &str) -> bool {
    matches!(tok, "1-0" | "0-1" | "1/2-1/2" | "*" | "1/2")
}

fn has_san_column(conn: &Connection) -> Result<bool> {
    let n: i64 = conn.query_row(
        "SELECT COUNT(*) FROM pragma_table_info('games') WHERE name = 'san_moves'",
        [],
        |r| r.get(0),
    )?;
    Ok(n > 0)
}

/// Add a `san_moves` column (space-separated SAN tokens) and backfill it once.
/// Makes prefix lookups indexable instead of scanning raw PGN text.
fn ensure_san_column(conn: &Connection) -> Result<()> {
    if has_san_column(conn)? {
        return Ok(());
    }
    conn.execute_batch(
        "ALTER TABLE games ADD COLUMN san_moves TEXT;
         CREATE INDEX idx_games_san_moves ON games(san_moves);",
    )?;
    let rows: Vec<(i64, String)> = {
        let mut stmt = conn.prepare("SELECT rowid, pgn FROM games")?;
        let mapped = stmt.query_map([], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
        })?;
        let mut v = Vec::new();
        for row in mapped {
            v.push(row?);
        }
        v
    };
    let tx = conn.unchecked_transaction()?;
    {
        let mut upd = tx.prepare("UPDATE games SET san_moves = ?1 WHERE rowid = ?2")?;
        for (rowid, pgn) in &rows {
            let moves = movetext_sans(pgn).join(" ");
            upd.execute(rusqlite::params![moves, rowid])?;
        }
    }
    tx.commit()?;
    Ok(())
}

/// Find games in `db_path` (games.sqlite) whose SAN move list starts with
/// `prefix_sans`, and aggregate result statistics plus the most common
/// continuations.
pub fn opening_stats(db_path: &Path, prefix_sans: &[String]) -> Result<OpeningStats> {
    let conn = Connection::open(db_path).with_context(|| format!("open {}", db_path.display()))?;
    conn.pragma_update(None, "case_sensitive_like", "ON")?;
    ensure_san_column(&conn)?;

    let prefix = prefix_sans.join(" ");
    let (sql, params): (&str, Vec<String>) = if prefix.is_empty() {
        (
            "SELECT result, white_elo, black_elo, san_moves FROM games",
            vec![],
        )
    } else {
        (
            "SELECT result, white_elo, black_elo, san_moves FROM games
             WHERE san_moves = ?1 OR san_moves LIKE ?2",
            vec![prefix.clone(), format!("{} %", prefix)],
        )
    };
    let mut stmt = conn.prepare(sql)?;
    let rows = stmt.query_map(rusqlite::params_from_iter(params.iter()), |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, Option<String>>(1)?,
            row.get::<_, Option<String>>(2)?,
            row.get::<_, String>(3)?,
        ))
    })?;

    let mut stats = OpeningStats::default();
    let mut elo_w_sum = 0.0;
    let mut elo_b_sum = 0.0;
    let mut elo_count = 0u64;
    let mut cont: HashMap<String, u64> = HashMap::new();
    let prefix_tokens: Vec<&str> = prefix_sans.iter().map(|s| s.as_str()).collect();

    for row in rows {
        let (result, white_elo, black_elo, san_moves) = row?;
        let mut tokens = san_moves.split(' ');
        if !prefix_tokens.iter().all(|p| tokens.next() == Some(*p)) {
            continue;
        }
        stats.games += 1;
        match result.as_str() {
            "1-0" => stats.white_wins += 1,
            "0-1" => stats.black_wins += 1,
            "1/2-1/2" => stats.draws += 1,
            _ => {}
        }
        let (w, b): (Option<f64>, Option<f64>) = (
            white_elo.and_then(|v| v.parse().ok()),
            black_elo.and_then(|v| v.parse().ok()),
        );
        if let (Some(w), Some(b)) = (w, b) {
            elo_w_sum += w;
            elo_b_sum += b;
            elo_count += 1;
        }
        if let Some(next) = tokens.next() {
            if !next.is_empty() {
                *cont.entry(next.to_string()).or_insert(0) += 1;
            }
        }
    }

    if elo_count > 0 {
        stats.avg_white_elo = elo_w_sum / elo_count as f64;
        stats.avg_black_elo = elo_b_sum / elo_count as f64;
    }
    let mut conts: Vec<(String, u64)> = cont.into_iter().collect();
    conts.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    conts.truncate(12);
    stats.continuations = conts;
    Ok(stats)
}

/// Candidate locations for the games SQLite database.
pub fn default_db_paths() -> Vec<std::path::PathBuf> {
    let mut paths = Vec::new();
    if let Ok(p) = std::env::var("CHESS_GAMES_DB") {
        paths.push(std::path::PathBuf::from(p));
    }
    paths.push(std::path::PathBuf::from("database/games.sqlite"));
    paths.push(std::path::PathBuf::from(
        "crates/games/database/games.sqlite",
    ));
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            paths.push(dir.join("database/games.sqlite"));
        }
    }
    paths
}
