use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone)]
pub struct PairingPlayer {
    pub name: String,
    pub points: f64,
    pub opponents: Vec<String>,
}

impl PairingPlayer {
    pub fn new(name: &str) -> Self {
        PairingPlayer {
            name: name.to_string(),
            points: 0.0,
            opponents: Vec::new(),
        }
    }

    pub fn with_points(name: &str, points: f64) -> Self {
        PairingPlayer {
            name: name.to_string(),
            points,
            opponents: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Pairing {
    pub white: String,
    pub black: String,
}

#[derive(Debug, Clone)]
pub struct RoundPairings {
    pub round: u32,
    pub pairs: Vec<Pairing>,
    pub byes: Vec<String>,
}

/// Generate a round-robin schedule using the circle method.
/// Returns `n - 1` rounds for even `n`, `n` rounds for odd `n` (with byes).
pub fn round_robin_schedule(players: &[String]) -> Vec<RoundPairings> {
    let n = players.len();
    if n < 2 {
        return Vec::new();
    }
    let mut list: Vec<String> = players.to_vec();
    if n % 2 == 1 {
        list.push("BYE".to_string());
    }
    let m = list.len();
    let rounds = m - 1;
    let mut schedule = Vec::new();

    for round in 0..rounds {
        let mut pairs = Vec::new();
        let mut byes = Vec::new();
        for i in 0..m / 2 {
            let a = &list[i];
            let b = &list[m - 1 - i];
            if a == "BYE" {
                byes.push(b.clone());
            } else if b == "BYE" {
                byes.push(a.clone());
            } else {
                let (white, black) = if round % 2 == 0 {
                    (a.clone(), b.clone())
                } else {
                    (b.clone(), a.clone())
                };
                pairs.push(Pairing { white, black });
            }
        }
        let (rotating, fixed) = list.split_at_mut(m - 1);
        rotating.rotate_right(1);
        let _ = fixed;
        schedule.push(RoundPairings {
            round: (round + 1) as u32,
            pairs,
            byes,
        });
    }
    schedule
}

/// Swiss pairing: sort by points descending, pair adjacent players avoiding
/// previous opponents. Odd count gets a bye for the lowest-ranked unpaired player.
pub fn swiss_pair(players: &[PairingPlayer]) -> RoundPairings {
    let mut sorted: Vec<PairingPlayer> = players.to_vec();
    sorted.sort_by(|a, b| {
        b.points
            .partial_cmp(&a.points)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| a.name.cmp(&b.name))
    });

    let mut pairs = Vec::new();
    let mut byes = Vec::new();
    let mut paired: HashSet<String> = HashSet::new();
    let n = sorted.len();

    // Try to pair top-down, skipping rematches where possible
    let mut i = 0;
    while i < n {
        if paired.contains(&sorted[i].name) {
            i += 1;
            continue;
        }
        // Find best opponent for sorted[i]
        let mut chosen = sorted
            .iter()
            .enumerate()
            .skip(i + 1)
            .find(|(_, p)| {
                !paired.contains(&p.name)
                    && !sorted[i].opponents.contains(&p.name)
                    && !p.opponents.contains(&sorted[i].name)
            })
            .map(|(j, _)| j);
        // Fall back to first unpaired opponent (rematch allowed)
        if chosen.is_none() {
            chosen = sorted
                .iter()
                .enumerate()
                .skip(i + 1)
                .find(|(_, p)| !paired.contains(&p.name))
                .map(|(j, _)| j);
        }
        match chosen {
            Some(j) => {
                let (a, b) = (sorted[i].clone(), sorted[j].clone());
                // Higher score gets white; tie -> alternate by name for determinism
                let (white, black) = if a.points > b.points {
                    (a.name, b.name)
                } else if b.points > a.points {
                    (b.name, a.name)
                } else if a.name < b.name {
                    (a.name, b.name)
                } else {
                    (b.name, a.name)
                };
                pairs.push(Pairing { white, black });
                paired.insert(sorted[i].name.clone());
                paired.insert(sorted[j].name.clone());
                i += 1;
            }
            None => {
                byes.push(sorted[i].name.clone());
                paired.insert(sorted[i].name.clone());
                i += 1;
            }
        }
    }

    RoundPairings {
        round: 0,
        pairs,
        byes,
    }
}

/// Buchholz tie-break: sum of opponents' points.
pub fn buchholz(player: &PairingPlayer, all: &[PairingPlayer]) -> f64 {
    let points: HashMap<&str, f64> = all.iter().map(|p| (p.name.as_str(), p.points)).collect();
    player
        .opponents
        .iter()
        .map(|opp| points.get(opp.as_str()).copied().unwrap_or(0.0))
        .sum()
}

/// Sonneborn-Berger: sum of opponent points weighted by game score.
/// Requires a score lookup; `scores` maps "A|B" -> score for A.
pub fn sonneborn_berger(
    player: &PairingPlayer,
    all: &[PairingPlayer],
    scores: &HashMap<(String, String), f64>,
) -> f64 {
    let points: HashMap<&str, f64> = all.iter().map(|p| (p.name.as_str(), p.points)).collect();
    player
        .opponents
        .iter()
        .map(|opp| {
            let opp_points = points.get(opp.as_str()).copied().unwrap_or(0.0);
            let score = scores
                .get(&(player.name.clone(), opp.clone()))
                .or_else(|| scores.get(&(opp.clone(), player.name.clone())))
                .copied()
                .unwrap_or(0.0);
            opp_points * score
        })
        .sum()
}

#[derive(Debug, Clone)]
pub struct Standing {
    pub name: String,
    pub points: f64,
    pub buchholz: f64,
    pub sonneborn_berger: f64,
}

/// Compute standings sorted by points, then Buchholz, then SB.
pub fn standings(
    players: &[PairingPlayer],
    scores: &HashMap<(String, String), f64>,
) -> Vec<Standing> {
    let mut result: Vec<Standing> = players
        .iter()
        .map(|p| Standing {
            buchholz: buchholz(p, players),
            sonneborn_berger: sonneborn_berger(p, players, scores),
            name: p.name.clone(),
            points: p.points,
        })
        .collect();
    result.sort_by(|a, b| {
        b.points
            .partial_cmp(&a.points)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| {
                b.buchholz
                    .partial_cmp(&a.buchholz)
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .then_with(|| {
                b.sonneborn_berger
                    .partial_cmp(&a.sonneborn_berger)
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .then_with(|| a.name.cmp(&b.name))
    });
    result
}
