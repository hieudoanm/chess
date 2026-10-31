use games::ChessComClient;
use std::collections::BTreeSet;
use std::fs;
use std::path::PathBuf;

const TITLES: &[&str] = &["GM", "IM", "FM", "CM", "NM", "WGM", "WIM", "WFM", "WCM", "WNM"];

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = ChessComClient::new()?;
    let mut player_set = BTreeSet::new();

    for title in TITLES {
        println!("Fetching titled players for {}", title);
        match client.get_titled_players(title).await {
            Ok(players) => {
                println!("  Found {} {}", players.len(), title);
                for p in players {
                    player_set.insert(p);
                }
            }
            Err(e) => {
                eprintln!("  Failed to fetch {} players: {}", title, e);
            }
        }
    }

    let players: Vec<String> = player_set.into_iter().collect();
    println!("Total unique titled players: {}", players.len());

    let output_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("players");
    fs::create_dir_all(&output_dir)?;
    let output_path = output_dir.join("titled_players.txt");
    
    let content = players.join("\n") + "\n";
    fs::write(&output_path, content)?;
    println!("Saved to {:?}", output_path);

    Ok(())
}
