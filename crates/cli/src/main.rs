mod mcp;
mod uci;

use chess_core::{game_result, generate_moves, perft, Board, GameResult, Position};
use chess_engine::Engine;
use clap::Parser;

#[derive(Parser)]
#[command(name = "chess")]
#[command(about = "A Rust chess engine")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(clap::Subcommand)]
enum Commands {
    Play {
        #[arg(long, default_value = "3")]
        depth: u32,
    },
    Fen,
    Moves,
    Board,
    Uci,
    Mcp,
    Bench,
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Play { depth }) => {
            let mut engine = Engine::new();
            loop {
                println!("Side to move: {:?}", engine.position.side_to_move);
                let result = game_result(&engine.position);
                if result != GameResult::Ongoing {
                    println!("Game over: {:?}", result);
                    break;
                }
                let moves = generate_moves(&engine.position);
                println!("Legal moves:");
                for (i, m) in moves.iter().enumerate() {
                    println!("  {}: {}", i, m);
                }
                let search = engine.search(depth);
                if let Some(bm) = search.best_move {
                    println!("Engine recommends: {} (score: {})", bm, search.score);
                }
                print!("Enter move index: ");
                use std::io::{self, Write};
                io::stdout().flush().unwrap();
                let mut input = String::new();
                io::stdin().read_line(&mut input).unwrap();
                let idx: usize = match input.trim().parse() {
                    Ok(v) => v,
                    Err(_) => {
                        println!("Invalid input");
                        continue;
                    }
                };
                if idx >= moves.len() {
                    println!("Invalid move index");
                    continue;
                }
                engine.apply(moves[idx]);
            }
        }
        Some(Commands::Fen) => {
            let board = Board::new();
            println!("{}", board.to_fen());
        }
        Some(Commands::Moves) => {
            let engine = Engine::new();
            let moves = generate_moves(&engine.position);
            for m in moves {
                println!("{}", m);
            }
        }
        Some(Commands::Board) => {
            let board = Board::new();
            println!("{}", board.to_fen());
        }
        Some(Commands::Uci) | None => {
            uci::run();
        }
        Some(Commands::Mcp) => {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(mcp::run()).unwrap();
        }
        Some(Commands::Bench) => {
            let pos = Position::standard();
            let depths = [1u32, 2, 3, 4, 5];
            let expected = [(1, 20u64), (2, 400), (3, 8902), (4, 197282), (5, 4865609)];
            let mut total_nodes = 0u64;
            let mut total_time = std::time::Duration::ZERO;
            for (d, exp) in depths.iter().zip(expected.iter()) {
                let start = std::time::Instant::now();
                let n = perft(&pos, *d);
                let elapsed = start.elapsed();
                total_nodes += n;
                total_time += elapsed;
                let status = if n == exp.1 { "OK" } else { "MISMATCH" };
                println!(
                    "depth {}: {} nodes ({:.2} ns/node) {} (expected {})",
                    d,
                    n,
                    elapsed.as_nanos() as f64 / n as f64,
                    status,
                    exp.1
                );
            }
            let nps = total_nodes as f64 / total_time.as_secs_f64();
            println!(
                "total: {} nodes in {:.2}s = {:.0} nps",
                total_nodes,
                total_time.as_secs_f64(),
                nps
            );
        }
    }
}
