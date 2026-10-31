use anyhow::{Context, Result};
use reqwest::Client;
use serde::Deserialize;
use std::path::Path;

const CHESS_COM_BASE: &str = "https://api.chess.com/pub";

/// Async client for the Chess.com public API.
pub struct ChessComClient {
    pub http: Client,
}

impl ChessComClient {
    /// Create a new client with a polite User-Agent (required by Chess.com).
    pub fn new() -> Result<Self> {
        let http = Client::builder()
            .user_agent("chess-engine-training/0.1 (contact: example@example.com)")
            .timeout(std::time::Duration::from_secs(30))
            .build()?;

        Ok(ChessComClient { http })
    }

    /// Get the list of monthly game archive URLs for a player.
    /// Returns URLs like `https://api.chess.com/pub/player/hikaru/games/2014/01`
    pub async fn get_game_archives(&self, player: &str) -> Result<Vec<String>> {
        let url = format!("{}/player/{}/games/archives", CHESS_COM_BASE, player);

        #[derive(Deserialize)]
        struct ArchivesResponse {
            archives: Vec<String>,
        }

        let resp: ArchivesResponse = self
            .http
            .get(&url)
            .send()
            .await
            .with_context(|| format!("GET {}", url))?
            .error_for_status()
            .with_context(|| format!("GET {} failed", url))?
            .json()
            .await
            .with_context(|| format!("parse JSON from {}", url))?;

        Ok(resp.archives)
    }

    /// Download PGN content for a monthly archive URL.
    /// Converts `.../games/2014/01` to `.../games/2014/01/pgn`
    pub async fn download_pgn(&self, archive_url: &str) -> Result<String> {
        let pgn_url = format!("{}/pgn", archive_url);

        let pgn = self
            .http
            .get(&pgn_url)
            .send()
            .await
            .with_context(|| format!("GET {}", pgn_url))?
            .error_for_status()
            .with_context(|| format!("GET {} failed", pgn_url))?
            .text()
            .await
            .with_context(|| format!("read text from {}", pgn_url))?;

        Ok(pgn)
    }

    /// Get list of players with a specific title.
    /// Title can be GM, IM, FM, CM, NM, WGM, WIM, WFM, WCM, WNM
    pub async fn get_titled_players(&self, title: &str) -> Result<Vec<String>> {
        let url = format!("{}/titled/{}", CHESS_COM_BASE, title);

        #[derive(Deserialize)]
        struct TitledResponse {
            players: Vec<String>,
        }

        let resp: TitledResponse = self
            .http
            .get(&url)
            .send()
            .await
            .with_context(|| format!("GET {}", url))?
            .error_for_status()
            .with_context(|| format!("GET {} failed", url))?
            .json()
            .await
            .with_context(|| format!("parse JSON from {}", url))?;

        Ok(resp.players)
    }

    /// Extract (year, month) from an archive URL like
    /// `https://api.chess.com/pub/player/hikaru/games/2014/01`
    pub fn extract_year_month(&self, archive_url: &str) -> Result<(u32, u32)> {
        let path = Path::new(archive_url);
        let parts: Vec<String> = path
            .components()
            .map(|c| c.as_os_str().to_string_lossy().to_string())
            .collect();

        let games_idx = parts
            .iter()
            .position(|p| p == "games")
            .context("URL does not contain 'games' segment")?;

        if parts.len() < games_idx + 3 {
            anyhow::bail!(
                "URL does not contain year/month after 'games': {}",
                archive_url
            );
        }

        let year: u32 = parts[games_idx + 1].parse().context("invalid year")?;
        let month: u32 = parts[games_idx + 2].parse().context("invalid month")?;

        Ok((year, month))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_year_month() {
        let client = ChessComClient::new().unwrap();
        let (y, m) = client
            .extract_year_month("https://api.chess.com/pub/player/hikaru/games/2014/01")
            .unwrap();
        assert_eq!(y, 2014);
        assert_eq!(m, 1);

        let (y, m) = client
            .extract_year_month("https://api.chess.com/pub/player/hikaru/games/2023/12")
            .unwrap();
        assert_eq!(y, 2023);
        assert_eq!(m, 12);
    }
}
