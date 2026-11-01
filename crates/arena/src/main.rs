use std::io::{BufRead, Write};
use std::process::{Child, Command, Stdio};

const MAX_PLIES: u32 = 100;

struct Engine {
    proc: Child,
    reader: std::io::BufReader<std::process::ChildStdout>,
    writer: std::process::ChildStdin,
    name: String,
    alive: bool,
}

impl Engine {
    fn new(name: &str, cmd: &str, args: &[&str]) -> Result<Self, String> {
        let mut proc = Command::new(cmd)
            .args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("failed to spawn {name}: {e}"))?;

        let reader = std::io::BufReader::new(proc.stdout.take().unwrap());
        let stderr = proc.stderr.take().unwrap();
        let writer = proc.stdin.take().unwrap();

        let engine_name = name.to_string();
        let mut engine = Engine {
            proc,
            reader,
            writer,
            name: engine_name.clone(),
            alive: true,
        };

        engine.send("uci")?;
        engine.wait_for("uciok")?;
        engine.send("isready")?;
        engine.wait_for("readyok")?;

        // Drain any stderr output
        let _ = std::thread::spawn(move || {
            let mut stderr_reader = std::io::BufReader::new(stderr);
            let mut line = String::new();
            while stderr_reader.read_line(&mut line).unwrap_or(0) > 0 {
                eprintln!("[{engine_name} stderr] {}", line.trim());
                line.clear();
            }
        });

        Ok(engine)
    }

    fn send(&mut self, msg: &str) -> Result<(), String> {
        if !self.alive {
            return Err(format!("{} is dead", self.name));
        }
        self.writer
            .write_all(format!("{msg}\n").as_bytes())
            .map_err(|e| format!("write error to {}: {e}", self.name))?;
        self.writer
            .flush()
            .map_err(|e| format!("flush error to {}: {e}", self.name))
    }

    fn readline(&mut self) -> Result<Option<String>, String> {
        if !self.alive {
            return Err(format!("{} is dead", self.name));
        }
        let mut line = String::new();
        match self.reader.read_line(&mut line) {
            Ok(0) => {
                self.alive = false;
                Ok(None)
            }
            Ok(_) => {
                line.pop();
                Ok(Some(line))
            }
            Err(e) => {
                self.alive = false;
                Err(format!("read error from {}: {e}", self.name))
            }
        }
    }

    fn wait_for(&mut self, pattern: &str) -> Result<(), String> {
        // Small delay to let the subprocess produce output
        std::thread::sleep(std::time::Duration::from_millis(10));
        loop {
            let line = match self.readline()? {
                Some(l) => l,
                None => return Err(format!("{} exited waiting for {pattern}", self.name)),
            };
            if line.contains(pattern) {
                return Ok(());
            }
        }
    }

    fn bestmove(&mut self, moves: &[String], depth: u32) -> Result<String, String> {
        if !self.alive {
            return Ok("0000".to_string());
        }
        if moves.is_empty() {
            self.send("position startpos")?;
        } else {
            self.send(&format!("position startpos moves {}", moves.join(" ")))?;
        }
        self.send(&format!("go depth {depth}"))?;

        loop {
            let line = match self.readline()? {
                Some(l) => l,
                None => return Ok("0000".to_string()),
            };
            if line.starts_with("bestmove ") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                return Ok(parts.get(1).unwrap_or(&"0000").to_string());
            }
            if line.contains("CRITICAL ERROR") || line.contains("Illegal move") {
                self.alive = false;
                return Ok("0000".to_string());
            }
        }
    }

    fn close(&mut self) {
        if self.alive {
            let _ = self.send("quit");
        }
        let _ = self.proc.wait();
    }
}

struct GameResult {
    winner: String,
    moves: Vec<String>,
    reason: String,
}

fn play_game(white: &mut Engine, black: &mut Engine, depth: u32) -> Result<GameResult, String> {
    let mut moves: Vec<String> = Vec::new();

    for ply in 0..MAX_PLIES {
        let engine: &mut Engine = if ply % 2 == 0 { white } else { black };
        let bm = engine.bestmove(&moves, depth)?;

        if bm == "0000" {
            if !engine.alive {
                let loser = if ply % 2 == 0 { "black" } else { "white" };
                return Ok(GameResult {
                    winner: loser.to_string(),
                    moves,
                    reason: "engine_crash".to_string(),
                });
            } else {
                let loser = if ply % 2 == 0 { "black" } else { "white" };
                return Ok(GameResult {
                    winner: loser.to_string(),
                    moves,
                    reason: "checkmate".to_string(),
                });
            }
        }

        moves.push(bm);

        if !white.alive || !black.alive {
            let loser = if !white.alive { "white" } else { "black" };
            return Ok(GameResult {
                winner: loser.to_string(),
                moves,
                reason: "engine_crash".to_string(),
            });
        }
    }

    Ok(GameResult {
        winner: "draw".to_string(),
        moves,
        reason: "max_plies".to_string(),
    })
}

fn us_won(winner: &str, our_color: &str) -> bool {
    (winner == "white" && our_color == "white") || (winner == "black" && our_color == "black")
}

struct Results {
    us_wins: u32,
    us_losses: u32,
    draws: u32,
    crash_wins: u32,
}

impl Results {
    fn new() -> Self {
        Results {
            us_wins: 0,
            us_losses: 0,
            draws: 0,
            crash_wins: 0,
        }
    }
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let engine_path = args
        .get(1)
        .cloned()
        .unwrap_or_else(|| "../target/release/chess".to_string());
    let stockfish_path = args
        .get(2)
        .cloned()
        .unwrap_or_else(|| "/opt/homebrew/bin/stockfish".to_string());
    let games: u32 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(6);
    let depth: u32 = args.get(4).and_then(|s| s.parse().ok()).unwrap_or(7);
    let skill: u32 = args.get(5).and_then(|s| s.parse().ok()).unwrap_or(1);

    let mut results = Results::new();

    for g in 0..games {
        let our_color = if g % 2 == 0 { "white" } else { "black" };
        println!("\n--- Game {}: us={} ---", g + 1, our_color);

        let mut us = match Engine::new("us", &engine_path, &["uci"]) {
            Ok(e) => e,
            Err(e) => {
                println!("[WARN] our engine failed to start: {e}");
                continue;
            }
        };
        let mut sf = match Engine::new("stockfish", &stockfish_path, &["uci"]) {
            Ok(e) => e,
            Err(e) => {
                println!("[WARN] stockfish failed to start: {e}");
                us.close();
                continue;
            }
        };

        // Stockfish defaults to Skill Level 20; set to requested level
        if skill < 20 {
            let _ = sf.send(&format!("setoption name Skill Level value {skill}"));
            let _ = sf.send("isready");
            let _ = sf.wait_for("readyok");
        }

        let mut engines: [&mut Engine; 2] = if our_color == "white" {
            [&mut us, &mut sf]
        } else {
            [&mut sf, &mut us]
        };

        let (white, black) = engines.split_at_mut(1);
        match play_game(white[0], black[0], depth) {
            Ok(game_result) => {
                let winner = &game_result.winner;
                let reason = &game_result.reason;
                let is_crash_win = reason == "engine_crash";

                let outcome = if winner == "draw" {
                    results.draws += 1;
                    "DRAW".to_string()
                } else if us_won(winner, our_color) {
                    results.us_wins += 1;
                    if is_crash_win {
                        results.crash_wins += 1;
                        "WIN (us) [SF crash]".to_string()
                    } else {
                        "WIN (us) [valid]".to_string()
                    }
                } else {
                    results.us_losses += 1;
                    "LOSS (us)".to_string()
                };

                println!(
                    "  Result: {:20} reason={:12} plies={:3}",
                    outcome,
                    reason,
                    game_result.moves.len()
                );
                println!("  Moves: {}", game_result.moves.join(" "));
            }
            Err(e) => {
                println!("[WARN] game error: {e}");
                us.close();
                sf.close();
                continue;
            }
        }

        us.close();
        sf.close();
    }

    println!("\n=== RESULTS ===");
    println!("Games:      {}", games);
    let valid_wins = results.us_wins - results.crash_wins;
    println!(
        "Our wins:   {} ({} crash, {} valid)",
        results.us_wins, results.crash_wins, valid_wins
    );
    println!("Our losses: {}", results.us_losses);
    println!("Our draws:  {}", results.draws);
    let score = valid_wins as f64 + 0.5 * results.draws as f64;
    println!(
        "Valid score: {}/{} ({:.1}%)",
        score,
        games,
        100.0 * score / games as f64
    );
    println!("Stockfish skill: {skill}, our depth: {depth}");
}
