use anyhow::Result;
use chess_core::{round_robin_schedule, standings, swiss_pair, PairingPlayer, Standing};
use std::collections::HashMap;
use std::fs;

struct PlayerSpec {
    name: String,
    points: f64,
    opponents: Vec<String>,
}

type PlayerScores = HashMap<(String, String), f64>;

fn score_value(s: &str) -> Option<f64> {
    match s {
        "1" | "win" | "w" | "1-0" => Some(1.0),
        "0.5" | "draw" | "d" | "1/2-1/2" => Some(0.5),
        "0" | "loss" | "l" | "0-1" => Some(0.0),
        _ => None,
    }
}

/// Load players and results.
/// `player_args`: bare names from CLI.
/// `players_file`: lines `name [points] [opp1,opp2,...]`.
/// `results_file`: lines `White Black score`.
fn load_players(
    player_args: &[String],
    players_file: Option<&str>,
    results_file: Option<&str>,
) -> Result<(Vec<PairingPlayer>, PlayerScores)> {
    let mut map: HashMap<String, PlayerSpec> = HashMap::new();

    if let Some(file) = players_file {
        for line in fs::read_to_string(file)?.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.is_empty() {
                continue;
            }
            let name = parts[0].to_string();
            let points = parts.get(1).and_then(|p| p.parse().ok()).unwrap_or(0.0);
            let opponents = parts
                .get(2)
                .map(|o| o.split(',').map(|s| s.to_string()).collect())
                .unwrap_or_default();
            map.insert(
                name.clone(),
                PlayerSpec {
                    name,
                    points,
                    opponents,
                },
            );
        }
    }
    for name in player_args {
        map.entry(name.clone()).or_insert_with(|| PlayerSpec {
            name: name.clone(),
            points: 0.0,
            opponents: Vec::new(),
        });
    }

    // Apply results: each line "White Black score" updates points/opponents/scores.
    let mut scores: PlayerScores = HashMap::new();
    if let Some(file) = results_file {
        for line in fs::read_to_string(file)?.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() < 3 {
                continue;
            }
            let (w, b, s) = (parts[0], parts[1], parts[2]);
            let Some(score) = score_value(s) else {
                continue;
            };
            scores.insert((w.to_string(), b.to_string()), score);
            let wspec = map.entry(w.to_string()).or_insert_with(|| PlayerSpec {
                name: w.to_string(),
                points: 0.0,
                opponents: Vec::new(),
            });
            wspec.points += score;
            wspec.opponents.push(b.to_string());
            let bspec = map.entry(b.to_string()).or_insert_with(|| PlayerSpec {
                name: b.to_string(),
                points: 0.0,
                opponents: Vec::new(),
            });
            bspec.points += 1.0 - score;
            bspec.opponents.push(w.to_string());
        }
    }

    let players: Vec<PairingPlayer> = map
        .into_values()
        .map(|s| PairingPlayer {
            name: s.name,
            points: s.points,
            opponents: s.opponents,
        })
        .collect();

    Ok((players, scores))
}

pub fn run(
    player_args: &[String],
    swiss: bool,
    players_file: Option<&str>,
    results_file: Option<&str>,
) -> Result<()> {
    let (players, scores) = load_players(player_args, players_file, results_file)?;
    if players.len() < 2 {
        anyhow::bail!("need at least 2 players");
    }

    if swiss {
        let round = swiss_pair(&players);
        print_round(&round);
        let table = standings(&players, &scores);
        print_standings(&table);
    } else {
        let names: Vec<String> = players.iter().map(|p| p.name.clone()).collect();
        for round in round_robin_schedule(&names) {
            print_round(&round);
        }
    }
    Ok(())
}

fn print_round(round: &chess_core::RoundPairings) {
    if round.round > 0 {
        println!("Round {}", round.round);
    }
    for p in &round.pairs {
        println!("  {} - {}", p.white, p.black);
    }
    for b in &round.byes {
        println!("  {} (bye)", b);
    }
    println!();
}

fn print_standings(table: &[Standing]) {
    println!("{:<20} {:>6} {:>8} {:>8}", "Player", "Pts", "Buchh", "SB");
    for s in table {
        println!(
            "{:<20} {:>6.1} {:>8.1} {:>8.1}",
            s.name, s.points, s.buchholz, s.sonneborn_berger
        );
    }
}
