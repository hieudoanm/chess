use anyhow::{Context, Result};
use reqwest::Client;
use serde::Deserialize;
use std::time::Duration;

const LICHESS_BASE: &str = "https://lichess.org/api";
const EXPLORER_BASE: &str = "https://explorer.lichess.ovh";

/// Fetch a user's games from the Lichess API as PGN text.
/// `max` limits the number of games (most recent first).
pub async fn fetch_user_games_pgn(username: &str, max: u32) -> Result<String> {
    let client = Client::builder()
        .user_agent("chess-engine/0.1 (https://github.com/hieudoanm/chess)")
        .timeout(std::time::Duration::from_secs(60))
        .build()?;

    let url = format!(
        "{}/games/user/{}?max={}&as_pgn=1",
        LICHESS_BASE, username, max
    );
    let pgn = client
        .get(&url)
        .send()
        .await
        .with_context(|| format!("GET {}", url))?
        .error_for_status()
        .with_context(|| format!("GET {} failed", url))?
        .text()
        .await
        .with_context(|| format!("read text from {}", url))?;

    Ok(pgn)
}

#[derive(Debug, Default, Deserialize)]
pub struct ExplorerCounts {
    #[serde(default)]
    pub win: u64,
    #[serde(default)]
    pub draw: u64,
    #[serde(default)]
    pub loss: u64,
}

impl ExplorerCounts {
    pub fn total(&self) -> u64 {
        self.win + self.draw + self.loss
    }
}

#[derive(Debug, Default, Deserialize)]
pub struct ExplorerMove {
    #[serde(default)]
    pub san: String,
    #[serde(default)]
    pub uci: String,
    #[serde(default)]
    pub white: u64,
    #[serde(default)]
    pub draws: u64,
    #[serde(default)]
    pub black: u64,
    #[serde(default)]
    pub average_rating: u64,
}

#[derive(Debug, Default, Deserialize)]
pub struct ExplorerOpening {
    #[serde(default)]
    pub eco: String,
    #[serde(default)]
    pub name: String,
}

#[derive(Debug, Default, Deserialize)]
pub struct ExplorerResult {
    #[serde(default)]
    pub white: ExplorerCounts,
    #[serde(default)]
    pub black: ExplorerCounts,
    #[serde(default)]
    pub draws: u64,
    #[serde(default)]
    pub moves: Vec<ExplorerMove>,
    #[serde(default)]
    pub opening: ExplorerOpening,
}

/// Query the Lichess opening explorer for a position (FEN) or a move line.
/// Pass `play` as a space-separated list of UCI moves to explore a line.
pub async fn explorer(fen: &str, play: &[&str]) -> Result<ExplorerResult> {
    let client = Client::builder()
        .user_agent("chess-engine/0.1 (https://github.com/hieudoanm/chess)")
        .timeout(Duration::from_secs(20))
        .build()?;
    let mut url = format!("{}/lichess?fen={}&topGames=0", EXPLORER_BASE, fen);
    if !play.is_empty() {
        url.push_str(&format!("&play={}", play.join(" ")));
    }
    let mut req = client.get(&url);
    if let Ok(token) = std::env::var("LICHESS_TOKEN") {
        if !token.is_empty() {
            req = req.bearer_auth(token);
        }
    }
    let result: ExplorerResult = req
        .send()
        .await
        .with_context(|| format!("GET {}", url))?
        .error_for_status()
        .with_context(|| format!("GET {} failed", url))?
        .json()
        .await
        .with_context(|| format!("parse explorer JSON from {}", url))?;
    Ok(result)
}
