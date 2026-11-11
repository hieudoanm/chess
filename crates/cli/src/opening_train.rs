use anyhow::Result;
use chess_core::{apply_move, from_san, openings, Position};
use std::io::{self, Write};
use std::time::{SystemTime, UNIX_EPOCH};

fn pick_openings(
    count: usize,
    eco_prefix: Option<&str>,
    min_len: usize,
) -> Vec<(String, String, Vec<String>)> {
    let all = openings();
    let mut seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.subsec_nanos() as u64 ^ d.as_secs())
        .unwrap_or(0x9e3779b97f4a7c15);
    let mut rng = move || {
        seed ^= seed << 13;
        seed ^= seed >> 7;
        seed ^= seed << 17;
        seed
    };
    let mut pool: Vec<_> = all
        .iter()
        .filter(|e| e.moves.len() >= min_len && eco_prefix.is_none_or(|p| e.eco.starts_with(p)))
        .collect();
    // shuffle
    for i in (1..pool.len()).rev() {
        let j = (rng() as usize) % (i + 1);
        pool.swap(i, j);
    }
    pool.into_iter()
        .take(count)
        .map(|e| (e.eco.to_string(), e.name.to_string(), e.moves.clone()))
        .collect()
}

pub fn run(count: usize, eco_prefix: Option<&str>) -> Result<()> {
    let drills = pick_openings(count.max(1), eco_prefix, 2);
    if drills.is_empty() {
        anyhow::bail!("no openings matched");
    }
    let stdin = io::stdin();
    let mut correct = 0u32;
    let mut total = 0u32;

    for (i, (eco, name, line)) in drills.iter().enumerate() {
        println!("\n=== Opening {} of {} ===", i + 1, drills.len());
        println!("{} {} — {}", eco, name, line.join(" "));
        let mut pos = Position::standard();
        let mut ok = true;
        for (step, expected_san) in line.iter().enumerate() {
            print!("Move {} (SAN or UCI, 'skip'/'q'): ", step + 1);
            io::stdout().flush()?;
            let mut input = String::new();
            if stdin.read_line(&mut input)? == 0 {
                return Ok(());
            }
            let input = input.trim();
            if input == "q" || input == "quit" {
                println!("Score: {}/{} moves correct", correct, total);
                return Ok(());
            }
            if input == "skip" {
                ok = false;
                break;
            }
            total += 1;
            let played =
                from_san(&pos, input).or_else(|| chess_core::find_move_from_uci(&pos, input));
            let expected = from_san(&pos, expected_san)
                .or_else(|| chess_core::find_move_from_uci(&pos, expected_san));
            match (played, expected) {
                (Some(p), Some(e)) if p == e => {
                    correct += 1;
                    apply_move(&mut pos, p);
                }
                (Some(p), Some(e)) => {
                    println!("Wrong — played {}, expected {}", p.to_san(), e.to_san());
                    ok = false;
                    break;
                }
                _ => {
                    println!("Could not parse '{}'", input);
                    ok = false;
                    break;
                }
            }
        }
        if ok {
            println!("Line complete!");
        }
    }
    println!("\nScore: {}/{} moves correct", correct, total);
    Ok(())
}
