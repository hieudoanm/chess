use games::ChessComClient;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::Semaphore;

const PLAYER_DIRS: &[&str] = &[
    "anishgiri",
    "azerichess",
    "banhgiahuy2606",
    "chefshouse",
    "chesswarrior7197",
    "crescentmoon2411",
    "danielnaroditsky",
    "denlaz",
    "dominguezonyoutube",
    "duhless",
    "fabianocaruana",
    "faustinooro",
    "firouzja2003",
    "ghandeevam2003",
    "gmwso",
    "grischuk",
    "gukeshdommaraju",
    "hikaru",
    "javokhir_sindarov05",
    "lachesisq",
    "levonaronian",
    "liemle",
    "lyonbeast",
    "magnuscarlsen",
    "parhamov",
    "penguingm1",
    "polish_fighter3000",
    "rpragchess",
    "sergeykarjakin",
    "thevish",
    "tradjabov",
    "veselintopalov359",
    "viditchess",
    "vincentkeymer",
    "vladimirkramnik",
    "volodar_murzin",
    "wonderfultime",
];

const MAX_CONCURRENT_DOWNLOADS: usize = 8;

fn output_dir_for(player: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("pgn")
        .join(player)
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

    for player in PLAYER_DIRS {
        let output_dir = output_dir_for(player);
        std::fs::create_dir_all(&output_dir)?;

        println!("Fetching game archives for {}", player);
        let archives = match client.get_game_archives(player).await {
            Ok(a) => a,
            Err(e) => {
                eprintln!("Skipping {}: {}", player, e);
                continue;
            }
        };

        println!("Found {} archives for {}", archives.len(), player);

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

        // Wait for all downloads for this player to complete
        for handle in handles {
            if let Err(e) = handle.await {
                eprintln!("Task join error: {}", e);
            }
        }

        println!("Done. PGN files saved to {:?}", output_dir);
    }

    Ok(())
}
