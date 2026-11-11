use std::io::{BufRead, Write};
use std::process::{Child, Command, Stdio};

pub const MAX_PLIES: u32 = 100;

pub struct Engine {
    proc: Child,
    reader: std::io::BufReader<std::process::ChildStdout>,
    writer: std::process::ChildStdin,
    pub name: String,
    alive: bool,
}

impl Engine {
    pub fn new(name: &str, cmd: &str, args: &[&str]) -> Result<Self, String> {
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

    pub fn send(&mut self, msg: &str) -> Result<(), String> {
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

    pub fn wait_for(&mut self, pattern: &str) -> Result<(), String> {
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

    pub fn bestmove(&mut self, moves: &[String], depth: u32) -> Result<String, String> {
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

    pub fn is_alive(&self) -> bool {
        self.alive
    }

    pub fn close(&mut self) {
        if self.alive {
            let _ = self.send("quit");
        }
        let _ = self.proc.wait();
    }
}

#[derive(Debug)]
pub struct GameResult {
    pub winner: String,
    pub moves: Vec<String>,
    pub reason: String,
}

pub fn play_game(
    white: &mut Engine,
    black: &mut Engine,
    depth: u32,
    start_moves: &[String],
) -> Result<GameResult, String> {
    let mut moves: Vec<String> = start_moves.to_vec();

    for ply in moves.len()..MAX_PLIES as usize {
        let engine: &mut Engine = if ply % 2 == 0 { white } else { black };
        let bm = engine.bestmove(&moves, depth)?;

        if bm == "0000" {
            let loser = if ply % 2 == 0 { "black" } else { "white" };
            let reason = if engine.is_alive() {
                "checkmate".to_string()
            } else {
                "engine_crash".to_string()
            };
            return Ok(GameResult {
                winner: if reason == "engine_crash" {
                    if ply % 2 == 0 {
                        "white".to_string()
                    } else {
                        "black".to_string()
                    }
                } else {
                    loser.to_string()
                },
                moves,
                reason,
            });
        }

        moves.push(bm);

        if !white.is_alive() || !black.is_alive() {
            let loser = if !white.is_alive() { "white" } else { "black" };
            return Ok(GameResult {
                winner: if loser == "white" { "black" } else { "white" }.to_string(),
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

#[derive(Debug, Default)]
pub struct Results {
    pub white_wins: u32,
    pub black_wins: u32,
    pub draws: u32,
    pub crash_wins: u32,
}
