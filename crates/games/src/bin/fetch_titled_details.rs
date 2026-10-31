use games::ChessComClient;
use rusqlite::{params, Connection};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Semaphore;

const MAX_CONCURRENT: usize = 8;

#[derive(serde::Deserialize)]
struct PlayerProfile {
    player_id: Option<i64>,
    id: Option<i64>,
    url: Option<String>,
    username: Option<String>,
    title: Option<String>,
    name: Option<String>,
    country: Option<String>,
    location: Option<String>,
    followers: Option<i64>,
    joined: Option<i64>,
    last_online: Option<i64>,
    status: Option<String>,
    is_streamer: Option<bool>,
    verified: Option<bool>,
    league: Option<String>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = Arc::new(ChessComClient::new()?);
    let semaphore = Arc::new(Semaphore::new(MAX_CONCURRENT));
    
    let players_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("players")
        .join("titled_players.txt");
    let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("players")
        .join("titled_players.sqlite");
    
    let content = fs::read_to_string(&players_path)?;
    let all_players: Vec<String> = content
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.trim().to_string())
        .collect();
    
    let conn = Connection::open(&db_path)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS players (
            player_id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            title TEXT,
            name TEXT,
            country TEXT,
            location TEXT,
            followers INTEGER,
            joined INTEGER,
            last_online INTEGER,
            status TEXT,
            is_streamer INTEGER,
            verified INTEGER,
            league TEXT,
            url TEXT,
            chess_rapid_last_rating INTEGER,
            chess_rapid_best_rating INTEGER,
            chess_rapid_win INTEGER,
            chess_rapid_draw INTEGER,
            chess_rapid_loss INTEGER,
            chess_blitz_last_rating INTEGER,
            chess_blitz_best_rating INTEGER,
            chess_blitz_win INTEGER,
            chess_blitz_draw INTEGER,
            chess_blitz_loss INTEGER,
            chess_bullet_last_rating INTEGER,
            chess_bullet_best_rating INTEGER,
            chess_bullet_win INTEGER,
            chess_bullet_draw INTEGER,
            chess_bullet_loss INTEGER,
            updated_at INTEGER DEFAULT (strftime('%s','now'))
        )",
        [],
    )?;
    
    let mut stmt = conn.prepare("SELECT username FROM players")?;
    let existing: HashSet<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))?
        .collect::<Result<_, _>>()?;
    drop(stmt);
    drop(conn);
    
    let players: Vec<String> = all_players
        .into_iter()
        .filter(|p| !existing.contains(p))
        .collect();
    
    println!("Fetching details for {} players ({} already exist)", players.len(), existing.len());
    
    let mut handles = Vec::new();
    let total = players.len();
    for (idx, player) in players.into_iter().enumerate() {
        let client = client.clone();
        let semaphore = semaphore.clone();
        let db_path = db_path.clone();
        handles.push(tokio::spawn(async move {
            let _permit = match semaphore.acquire().await {
                Ok(p) => p,
                Err(_) => return,
            };
            println!("[{}/{}] Fetching {}", idx + 1, total, player);
            let result = fetch_and_save(&client, &db_path, &player).await;
            if let Err(e) = result {
                eprintln!("[{}/{}] Failed {}: {}", idx + 1, total, player, e);
            } else {
                println!("[{}/{}] Saved {}", idx + 1, total, player);
            }
        }));
    }
    
    for handle in handles {
        let _ = handle.await;
    }
    
    println!("Done");
    Ok(())
}

async fn fetch_and_save(client: &ChessComClient, db_path: &PathBuf, username: &str) -> anyhow::Result<()> {
    let profile_url = format!("https://api.chess.com/pub/player/{}", username);
    let stats_url = format!("https://api.chess.com/pub/player/{}/stats", username);
    
    let profile: PlayerProfile = client.http
        .get(&profile_url)
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;
    
    let stats: Option<serde_json::Value> = if let Ok(resp) = client.http.get(&stats_url).send().await {
        if resp.status().is_success() {
            resp.json().await.ok()
        } else {
            None
        }
    } else {
        None
    };
    
    let conn = Connection::open(db_path)?;
    
    let mut rr_last = None; let mut rr_best = None; let mut rr_w = None; let mut rr_d = None; let mut rr_l = None;
    let mut rb_last = None; let mut rb_best = None; let mut rb_w = None; let mut rb_d = None; let mut rb_l = None;
    let mut bu_last = None; let mut bu_best = None; let mut bu_w = None; let mut bu_d = None; let mut bu_l = None;
    
    if let Some(s) = &stats {
        if let Some(v) = s.get("chess_rapid") {
            rr_last = v.get("last").and_then(|x| x.get("rating")).and_then(|x| x.as_i64());
            rr_best = v.get("best").and_then(|x| x.get("rating")).and_then(|x| x.as_i64());
            if let Some(r) = v.get("record") {
                rr_w = r.get("win").and_then(|x| x.as_i64());
                rr_d = r.get("draw").and_then(|x| x.as_i64());
                rr_l = r.get("loss").and_then(|x| x.as_i64());
            }
        }
        if let Some(v) = s.get("chess_blitz") {
            rb_last = v.get("last").and_then(|x| x.get("rating")).and_then(|x| x.as_i64());
            rb_best = v.get("best").and_then(|x| x.get("rating")).and_then(|x| x.as_i64());
            if let Some(r) = v.get("record") {
                rb_w = r.get("win").and_then(|x| x.as_i64());
                rb_d = r.get("draw").and_then(|x| x.as_i64());
                rb_l = r.get("loss").and_then(|x| x.as_i64());
            }
        }
        if let Some(v) = s.get("chess_bullet") {
            bu_last = v.get("last").and_then(|x| x.get("rating")).and_then(|x| x.as_i64());
            bu_best = v.get("best").and_then(|x| x.get("rating")).and_then(|x| x.as_i64());
            if let Some(r) = v.get("record") {
                bu_w = r.get("win").and_then(|x| x.as_i64());
                bu_d = r.get("draw").and_then(|x| x.as_i64());
                bu_l = r.get("loss").and_then(|x| x.as_i64());
            }
        }
    }
    
    conn.execute(
        "INSERT OR REPLACE INTO players 
         (player_id, username, title, name, country, location, followers, joined, last_online, 
          status, is_streamer, verified, league, url,
          chess_rapid_last_rating, chess_rapid_best_rating, chess_rapid_win, chess_rapid_draw, chess_rapid_loss,
          chess_blitz_last_rating, chess_blitz_best_rating, chess_blitz_win, chess_blitz_draw, chess_blitz_loss,
          chess_bullet_last_rating, chess_bullet_best_rating, chess_bullet_win, chess_bullet_draw, chess_bullet_loss)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29)",
        params![
            profile.player_id.or(profile.id),
            username,
            profile.title,
            profile.name,
            profile.country,
            profile.location,
            profile.followers,
            profile.joined,
            profile.last_online,
            profile.status,
            profile.is_streamer.map(|b| if b { 1i32 } else { 0i32 }),
            profile.verified.map(|b| if b { 1i32 } else { 0i32 }),
            profile.league,
            profile.url,
            rr_last, rr_best, rr_w, rr_d, rr_l,
            rb_last, rb_best, rb_w, rb_d, rb_l,
            bu_last, bu_best, bu_w, bu_d, bu_l,
        ],
    )?;
    Ok(())
}
