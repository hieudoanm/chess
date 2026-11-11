use anyhow::{Context, Result};
use rusqlite::Connection;
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Default)]
pub struct PlayerStats {
    pub games: u64,
    pub wins: u64,
    pub draws: u64,
    pub losses: u64,
    pub white_games: u64,
    pub white_wins: u64,
    pub black_games: u64,
    pub black_wins: u64,
    pub avg_own_elo: f64,
    pub avg_opp_elo: f64,
    pub top_openings: Vec<(String, u64)>,
}

impl PlayerStats {
    pub fn score(&self) -> f64 {
        if self.games == 0 {
            return 0.0;
        }
        (self.wins as f64 + self.draws as f64 * 0.5) / self.games as f64
    }
}

fn extract_eco(pgn: &str) -> Option<String> {
    let idx = pgn.find("[ECO \"")? + 6;
    let rest = &pgn[idx..];
    let end = rest.find('"')?;
    Some(rest[..end].to_string())
}

fn record_result(stats: &mut PlayerStats, is_white: bool, result: &str) {
    if is_white {
        stats.white_games += 1;
    } else {
        stats.black_games += 1;
    }
    match result {
        "1-0" => {
            if is_white {
                stats.wins += 1;
                stats.white_wins += 1;
            } else {
                stats.losses += 1;
            }
        }
        "0-1" => {
            if is_white {
                stats.losses += 1;
            } else {
                stats.wins += 1;
                stats.black_wins += 1;
            }
        }
        "1/2-1/2" => stats.draws += 1,
        _ => {}
    }
}

/// Aggregate statistics for a player (case-insensitive name match) over the
/// games.sqlite database at `db_path`.
pub fn player_stats(db_path: &Path, player: &str) -> Result<PlayerStats> {
    let conn = Connection::open(db_path).with_context(|| format!("open {}", db_path.display()))?;
    let mut stmt = conn.prepare(
        "SELECT white, black, result, white_elo, black_elo, pgn FROM games
         WHERE lower(white) = lower(?) OR lower(black) = lower(?)",
    )?;
    let rows = stmt.query_map(rusqlite::params![player, player], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, Option<String>>(3)?,
            row.get::<_, Option<String>>(4)?,
            row.get::<_, String>(5)?,
        ))
    })?;

    let mut stats = PlayerStats::default();
    let mut eco_counts: HashMap<String, u64> = HashMap::new();
    let mut elo_sum = 0.0;
    let mut opp_sum = 0.0;
    let mut elo_n = 0u64;

    for row in rows {
        let (white, black, result, white_elo, black_elo, pgn) = row?;
        let is_white = white.eq_ignore_ascii_case(player);
        if !is_white && !black.eq_ignore_ascii_case(player) {
            continue;
        }
        stats.games += 1;
        record_result(&mut stats, is_white, &result);
        let (own, opp) = if is_white {
            (white_elo, black_elo)
        } else {
            (black_elo, white_elo)
        };
        if let (Some(o), Some(p)) = (
            own.and_then(|v| v.parse::<f64>().ok()),
            opp.and_then(|v| v.parse::<f64>().ok()),
        ) {
            elo_sum += o;
            opp_sum += p;
            elo_n += 1;
        }
        if let Some(eco) = extract_eco(&pgn) {
            *eco_counts.entry(eco).or_insert(0) += 1;
        }
    }

    if elo_n > 0 {
        stats.avg_own_elo = elo_sum / elo_n as f64;
        stats.avg_opp_elo = opp_sum / elo_n as f64;
    }
    let mut ecos: Vec<(String, u64)> = eco_counts.into_iter().collect();
    ecos.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    ecos.truncate(10);
    stats.top_openings = ecos;
    Ok(stats)
}

#[derive(Debug)]
pub struct MonthStats {
    pub month: String,
    pub games: u64,
    pub wins: u64,
    pub draws: u64,
    pub losses: u64,
}

impl MonthStats {
    pub fn score(&self) -> f64 {
        if self.games == 0 {
            return 0.0;
        }
        (self.wins as f64 + self.draws as f64 * 0.5) / self.games as f64
    }
}

fn month_of(date: &str) -> String {
    let d = date.trim();
    if d.len() >= 7 {
        format!("{}-{}", &d[..4], &d[5..7])
    } else {
        d.to_string()
    }
}

/// Monthly score breakdown for a player, oldest first.
pub fn player_history(db_path: &Path, player: &str) -> Result<Vec<MonthStats>> {
    let conn = Connection::open(db_path).with_context(|| format!("open {}", db_path.display()))?;
    let mut stmt = conn.prepare(
        "SELECT date, result, white, black FROM games
         WHERE lower(white) = lower(?) OR lower(black) = lower(?)",
    )?;
    let rows = stmt.query_map(rusqlite::params![player, player], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
        ))
    })?;
    let mut map: HashMap<String, MonthStats> = HashMap::new();
    for row in rows {
        let (date, result, white, black) = row?;
        let is_white = white.eq_ignore_ascii_case(player);
        if !is_white && !black.eq_ignore_ascii_case(player) {
            continue;
        }
        let month = month_of(&date);
        let e = map.entry(month.clone()).or_insert_with(|| MonthStats {
            month: month.clone(),
            games: 0,
            wins: 0,
            draws: 0,
            losses: 0,
        });
        e.games += 1;
        match result.as_str() {
            "1-0" => {
                if is_white {
                    e.wins += 1;
                } else {
                    e.losses += 1;
                }
            }
            "0-1" => {
                if is_white {
                    e.losses += 1;
                } else {
                    e.wins += 1;
                }
            }
            "1/2-1/2" => e.draws += 1,
            _ => {}
        }
    }
    let mut out: Vec<MonthStats> = map.into_values().collect();
    out.sort_by(|a, b| a.month.cmp(&b.month));
    Ok(out)
}

#[derive(Debug)]
pub struct TcStats {
    pub time_control: String,
    pub games: u64,
    pub wins: u64,
    pub draws: u64,
    pub losses: u64,
}

impl TcStats {
    pub fn score(&self) -> f64 {
        if self.games == 0 {
            return 0.0;
        }
        (self.wins as f64 + self.draws as f64 * 0.5) / self.games as f64
    }
}

/// Results grouped by time control for a player, most games first.
pub fn player_time_controls(db_path: &Path, player: &str) -> Result<Vec<TcStats>> {
    let conn = Connection::open(db_path).with_context(|| format!("open {}", db_path.display()))?;
    let mut stmt = conn.prepare(
        "SELECT time_control, result, white, black FROM games
         WHERE lower(white) = lower(?) OR lower(black) = lower(?)",
    )?;
    let rows = stmt.query_map(rusqlite::params![player, player], |row| {
        Ok((
            row.get::<_, Option<String>>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
        ))
    })?;
    let mut map: HashMap<String, TcStats> = HashMap::new();
    for row in rows {
        let (tc, result, white, black) = row?;
        let tc = tc.unwrap_or_else(|| "-".to_string());
        let is_white = white.eq_ignore_ascii_case(player);
        if !is_white && !black.eq_ignore_ascii_case(player) {
            continue;
        }
        let e = map.entry(tc.clone()).or_insert_with(|| TcStats {
            time_control: tc,
            games: 0,
            wins: 0,
            draws: 0,
            losses: 0,
        });
        e.games += 1;
        match result.as_str() {
            "1-0" => {
                if is_white {
                    e.wins += 1;
                } else {
                    e.losses += 1;
                }
            }
            "0-1" => {
                if is_white {
                    e.losses += 1;
                } else {
                    e.wins += 1;
                }
            }
            "1/2-1/2" => e.draws += 1,
            _ => {}
        }
    }
    let mut out: Vec<TcStats> = map.into_values().collect();
    out.sort_by(|a, b| {
        b.games
            .cmp(&a.games)
            .then_with(|| a.time_control.cmp(&b.time_control))
    });
    Ok(out)
}
