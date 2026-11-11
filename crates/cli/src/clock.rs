use std::sync::mpsc;
use std::time::{Duration, Instant};

fn fmt_time(secs: f64) -> String {
    if secs <= 0.0 {
        return "0:00.0".to_string();
    }
    let m = (secs / 60.0) as u32;
    let s = secs % 60.0;
    format!("{}:{:04.1}", m, s)
}

fn is_quit(s: &str) -> bool {
    matches!(s.trim(), "q" | "quit")
}

pub fn run(base_secs: u32, increment_secs: u32, wname: &str, bname: &str) -> anyhow::Result<()> {
    let base = base_secs as f64;
    let inc = increment_secs as f64;
    let (tx, rx) = mpsc::channel::<String>();
    std::thread::spawn(move || {
        use std::io::BufRead;
        let stdin = std::io::stdin();
        for line in stdin.lock().lines() {
            let line = line.unwrap_or_default();
            let quit = is_quit(&line);
            if tx.send(line).is_err() || quit {
                break;
            }
        }
    });

    let mut clocks = [base, base];
    let mut turn = 0usize;
    let mut turn_start = Instant::now();
    let mut moves = 0u32;

    fn render(clocks: [f64; 2], turn: usize, moves: u32, wname: &str, bname: &str, extra: f64) {
        let mut c = clocks;
        c[turn] = (c[turn] - extra).max(0.0);
        println!(
            "\r{}: {}   {}: {}   (move {})",
            wname,
            fmt_time(c[0]),
            bname,
            fmt_time(c[1]),
            moves
        );
    }

    println!(
        "{}: {}   {}: {}",
        wname,
        fmt_time(base),
        bname,
        fmt_time(base)
    );
    println!("Press Enter after each move. 'q' to quit.");
    use std::io::Write;
    let _ = std::io::stdout().flush();

    loop {
        let displayed = clocks[turn] - turn_start.elapsed().as_secs_f64();
        if displayed <= 0.0 {
            let winner = if turn == 0 { bname } else { wname };
            println!("\n{} flags! {} wins after {} moves.", winner, winner, moves);
            return Ok(());
        }
        match rx.recv_timeout(Duration::from_millis(100)) {
            Ok(line) => {
                let elapsed = turn_start.elapsed().as_secs_f64();
                turn_start = Instant::now();
                clocks[turn] = (clocks[turn] - elapsed).max(0.0) + inc;
                if is_quit(&line) {
                    println!("\nGame aborted after {} moves.", moves);
                    return Ok(());
                }
                turn = 1 - turn;
                moves += 1;
                render(clocks, turn, moves, wname, bname, 0.0);
                let _ = std::io::stdout().flush();
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {
                render(
                    clocks,
                    turn,
                    moves,
                    wname,
                    bname,
                    turn_start.elapsed().as_secs_f64(),
                );
                let _ = std::io::stdout().flush();
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => {
                println!("\nInput closed after {} moves.", moves);
                return Ok(());
            }
        }
    }
}
