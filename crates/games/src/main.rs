use games::ChessComClient;
use rusqlite::Connection;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::Semaphore;

const MAX_CONCURRENT_DOWNLOADS: usize = 8;

fn output_dir_for(player: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("pgn")
        .join(player)
}

fn load_players_from_db() -> anyhow::Result<Vec<String>> {
    let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("players")
        .join("titled_players.sqlite");
    let conn = Connection::open(&db_path)?;
    let mut stmt = conn.prepare("SELECT username FROM players WHERE username IS NOT NULL ORDER BY joined DESC, last_online DESC")?;
    let players: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))?
        .filter_map(|r| r.ok())
        .collect();
    Ok(players)
}

async fn download_archive(
    client: Arc<ChessComClient>,
    archive_url: String,
    output_dir: PathBuf,
    idx: usize,
    total: usize,
    semaphore: Arc<Semaphore>,
) -> anyhow::Result<()> {
    let _permit = semaphore.acquire().await?;

    let (year, month) = match client.extract_year_month(&archive_url) {
        Ok((y, m)) => (y, m),
        Err(e) => {
            eprintln!("  Skipping bad URL {}: {}", archive_url, e);
            return Ok(());
        }
    };
    let filename = format!("{}_{:02}.pgn", year, month);
    let output_path = output_dir.join(&filename);

    if output_path.exists() {
        println!(
            "[{}/{}] Skipping {} (already exists)",
            idx + 1,
            total,
            filename
        );
        return Ok(());
    }

    println!(
        "[{}/{}] Downloading {} -> {}",
        idx + 1,
        total,
        archive_url,
        filename
    );

    let pgn = match client.download_pgn(&archive_url).await {
        Ok(p) => p,
        Err(e) => {
            eprintln!("  Failed to download {}: {}", archive_url, e);
            return Ok(());
        }
    };

    std::fs::write(&output_path, &pgn)?;

    println!("  Saved {} ({} bytes)", filename, pgn.len());

    Ok(())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = Arc::new(ChessComClient::new()?);
    let semaphore = Arc::new(Semaphore::new(MAX_CONCURRENT_DOWNLOADS));
    let players = load_players_from_db()?;

    println!("Loaded {} players from DB", players.len());
    println!("Starting download with {} concurrent downloads", MAX_CONCURRENT_DOWNLOADS);

    for (pidx, player) in players.iter().enumerate() {
        let output_dir = output_dir_for(player);
        std::fs::create_dir_all(&output_dir)?;

        println!("\n[Player {}/{}] Fetching game archives for {}", pidx + 1, players.len(), player);
        let archives = match client.get_game_archives(player).await {
            Ok(a) => a,
            Err(e) => {
                eprintln!("[Player {}/{}] Skipping {}: {}", pidx + 1, players.len(), player, e);
                continue;
            }
        };

        println!("[Player {}/{}] Found {} archives for {}", pidx + 1, players.len(), archives.len(), player);

        let archive_urls: Vec<String> = archives.to_vec();
        let total = archive_urls.len();

        let mut handles = Vec::new();
        for (idx, archive_url) in archive_urls.into_iter().enumerate() {
            let client = client.clone();
            let semaphore = semaphore.clone();
            let output_dir = output_dir.clone();

            handles.push(tokio::spawn(async move {
                download_archive(client, archive_url, output_dir, idx, total, semaphore).await
            }));
        }

        for handle in handles {
            if let Err(e) = handle.await {
                eprintln!("Task join error: {}", e);
            }
        }

        println!("[Player {}/{}] Done. PGN files saved to {:?}", pidx + 1, players.len(), output_dir);
    }

    println!("\nAll done!");
    Ok(())
}
