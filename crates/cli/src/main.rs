mod arena_cmd;
mod clock;
mod db;
mod elo;
mod game;
mod mate;
mod mcp;
mod opening_train;
mod openings;
mod pair;
mod perft_cmd;
mod puzzle;
mod review;
mod stats;
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
        #[arg(long)]
        fen: Option<String>,
        #[arg(long)]
        variant: Option<String>,
    },
    Fen,
    Moves {
        #[arg(long)]
        fen: Option<String>,
    },
    Board {
        #[arg(long)]
        fen: Option<String>,
    },
    Uci,
    Mcp,
    Bench,
    Review {
        input: Option<String>,
        #[arg(long)]
        fen: Option<String>,
        #[arg(long)]
        moves: Option<String>,
        #[arg(long, default_value = "3")]
        depth: u32,
        #[arg(long)]
        movetime: Option<u64>,
        #[arg(long)]
        export: Option<String>,
    },
    Pair {
        #[arg(long)]
        swiss: bool,
        #[arg(long)]
        players_file: Option<String>,
        #[arg(long)]
        results_file: Option<String>,
        players: Vec<String>,
    },
    Elo {
        #[arg(long)]
        player: f64,
        #[arg(long)]
        opponent: f64,
        #[arg(long, default_value = "draw")]
        score: String,
        #[arg(long, default_value = "30")]
        games: u32,
        #[arg(long, default_value = "30")]
        age: u32,
        #[arg(long, default_value = "classical")]
        time_class: String,
        #[arg(long)]
        rd: Option<f64>,
        #[arg(long, default_value = "0.06")]
        sigma: f64,
        #[arg(long, default_value = "0.5")]
        tau: f64,
    },
    Performance {
        #[arg(long = "game", value_name = "OPP:score", required = true)]
        games: Vec<String>,
    },
    Openings {
        #[arg(long)]
        online: bool,
        #[arg(long)]
        moves: Option<String>,
        moves_args: Vec<String>,
    },
    Stats {
        player: String,
        #[arg(long)]
        history: bool,
        #[arg(long)]
        time_control: bool,
    },
    Perft {
        depth: u32,
        #[arg(long)]
        fen: Option<String>,
        #[arg(long)]
        divide: bool,
    },
    Mate {
        #[arg(long)]
        fen: Option<String>,
        #[arg(long, default_value = "7")]
        max_plies: u32,
    },
    OpeningTrain {
        #[arg(long, default_value = "5")]
        count: usize,
        #[arg(long)]
        eco: Option<String>,
    },
    Arena {
        #[arg(long, default_value = "chess uci")]
        white: String,
        #[arg(long, default_value = "chess uci")]
        black: String,
        #[arg(long, default_value = "2")]
        games: u32,
        #[arg(long, default_value = "4")]
        depth: u32,
        #[arg(long)]
        moves: Option<String>,
    },
    Game {
        id: String,
    },
    Clock {
        #[arg(long, default_value = "180")]
        base: u32,
        #[arg(long, default_value = "2")]
        increment: u32,
        #[arg(long, default_value = "White")]
        wname: String,
        #[arg(long, default_value = "Black")]
        bname: String,
    },
    Puzzle {
        file: String,
        #[arg(long, default_value = "10")]
        limit: usize,
    },
    Db {
        #[arg(long)]
        player: Option<String>,
        #[arg(long)]
        white: Option<String>,
        #[arg(long)]
        black: Option<String>,
        #[arg(long)]
        eco: Option<String>,
        #[arg(long)]
        result: Option<String>,
        #[arg(long)]
        moves: Option<String>,
        #[arg(long)]
        limit: Option<u32>,
        #[arg(long)]
        out: Option<String>,
    },
    Eval {
        #[arg(long)]
        fen: Option<String>,
        #[arg(long, default_value = "4")]
        depth: u32,
    },
    Lichess {
        user: String,
        #[arg(long, default_value = "100")]
        max: u32,
        #[arg(long)]
        out: Option<String>,
    },
    Chess960 {
        index: usize,
    },
    Variant {
        name: String,
    },
}

fn parse_position(fen: Option<&str>) -> Position {
    fen.and_then(Position::from_fen)
        .unwrap_or_else(Position::standard)
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Play {
            depth,
            fen,
            variant,
        }) => {
            let mut engine = Engine::new();
            engine.position = match (fen.as_deref(), variant.as_deref()) {
                (Some(f), _) => parse_position(Some(f)),
                (None, Some(v)) => {
                    chess_core::variant_position(v).unwrap_or_else(Position::standard)
                }
                (None, None) => Position::standard(),
            };
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
        Some(Commands::Moves { fen }) => {
            let engine = Engine::new();
            let pos = parse_position(fen.as_deref());
            for m in generate_moves(&pos) {
                println!("{}", m);
            }
            let _ = engine;
        }
        Some(Commands::Board { fen }) => {
            let board = Board {
                position: parse_position(fen.as_deref()),
            };
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
            let expected = [(1, 20u64), (2, 400), (3, 8902), (4, 197281), (5, 4865609)];
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
        Some(Commands::Review {
            input,
            fen,
            moves,
            depth,
            movetime,
            export,
        }) => {
            if let Err(e) = review::run(
                input.as_deref(),
                fen.as_deref(),
                moves.as_deref(),
                depth,
                movetime,
                export.as_deref(),
            ) {
                eprintln!("review failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Pair {
            swiss,
            players_file,
            results_file,
            players,
        }) => {
            if let Err(e) = pair::run(
                &players,
                swiss,
                players_file.as_deref(),
                results_file.as_deref(),
            ) {
                eprintln!("pair failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Elo {
            player,
            opponent,
            score,
            games,
            age,
            time_class,
            rd,
            sigma,
            tau,
        }) => {
            let score = chess_core::Score::parse(&score).unwrap_or(chess_core::Score::Draw);
            let tc = match time_class.as_str() {
                "rapid" => chess_core::TimeClass::Rapid,
                "blitz" => chess_core::TimeClass::Blitz,
                _ => chess_core::TimeClass::Classical,
            };
            if let Err(e) = elo::run(player, opponent, score, games, age, tc, rd, sigma, tau) {
                eprintln!("elo failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Performance { games }) => {
            let mut parsed = Vec::new();
            for g in &games {
                let Some((opp, score)) = g.split_once(':') else {
                    eprintln!("invalid --game '{}', expected OPP:score", g);
                    std::process::exit(1);
                };
                let Ok(opp) = opp.parse::<f64>() else {
                    eprintln!("invalid opponent rating in '{}'", g);
                    std::process::exit(1);
                };
                let Some(score) = chess_core::Score::parse(score) else {
                    eprintln!("invalid score in '{}'", g);
                    std::process::exit(1);
                };
                parsed.push(chess_core::RatingGame {
                    opponent: opp,
                    score,
                });
            }
            if let Err(e) = elo::performance(&parsed) {
                eprintln!("performance failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Openings {
            online,
            moves,
            moves_args,
        }) => {
            let mut tokens = moves_args;
            if let Some(m) = moves {
                tokens = m.split_whitespace().map(|s| s.to_string()).collect();
            }
            if let Err(e) = openings::run(&tokens, online) {
                eprintln!("openings failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Stats {
            player,
            history,
            time_control,
        }) => {
            if let Err(e) = stats::run(&player, history, time_control) {
                eprintln!("stats failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Perft { depth, fen, divide }) => {
            if let Err(e) = perft_cmd::run(depth, fen.as_deref(), divide) {
                eprintln!("perft failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Mate { fen, max_plies }) => {
            if let Err(e) = mate::run(fen.as_deref(), max_plies) {
                eprintln!("mate failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::OpeningTrain { count, eco }) => {
            if let Err(e) = opening_train::run(count, eco.as_deref()) {
                eprintln!("opening-train failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Arena {
            white,
            black,
            games,
            depth,
            moves,
        }) => {
            if let Err(e) = arena_cmd::run(&white, &black, games, depth, moves.as_deref()) {
                eprintln!("arena failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Game { id }) => {
            if let Err(e) = game::run(&id) {
                eprintln!("game failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Clock {
            base,
            increment,
            wname,
            bname,
        }) => {
            if let Err(e) = clock::run(base, increment, &wname, &bname) {
                eprintln!("clock failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Puzzle { file, limit }) => {
            if let Err(e) = puzzle::run(&file, limit) {
                eprintln!("puzzle failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Db {
            player,
            white,
            black,
            eco,
            result,
            moves,
            limit,
            out,
        }) => {
            let filter = games::db::GameFilter {
                player,
                white,
                black,
                eco,
                result,
                moves_prefix: moves.as_deref().and_then(|m| {
                    let tokens: Vec<String> = m.split_whitespace().map(|s| s.to_string()).collect();
                    openings::moves_to_prefix(&tokens)
                        .ok()
                        .map(|(_, sans)| sans.join(" "))
                }),
                limit,
            };
            if let Err(e) = db::run(filter, out.as_deref()) {
                eprintln!("db failed: {}", e);
                std::process::exit(1);
            }
        }
        Some(Commands::Eval { fen, depth }) => {
            let pos = parse_position(fen.as_deref());
            let static_eval = chess_core::evaluate(&pos);
            let mut engine = Engine::new();
            engine.position = pos.clone();
            let nnue_eval = engine.static_eval();
            let search = engine.search(depth);
            println!("material eval: {}", static_eval);
            println!("engine eval: {}", nnue_eval);
            println!(
                "search d{}: score {} best {:?}",
                depth, search.score, search.best_move
            );
        }
        Some(Commands::Lichess { user, max, out }) => {
            let rt = tokio::runtime::Runtime::new().unwrap();
            match rt.block_on(games::lichess::fetch_user_games_pgn(&user, max)) {
                Ok(pgn) => {
                    if let Some(path) = out {
                        if let Err(e) = std::fs::write(&path, &pgn) {
                            eprintln!("write {} failed: {}", path, e);
                            std::process::exit(1);
                        }
                        eprintln!("wrote {} bytes to {}", pgn.len(), path);
                    } else {
                        print!("{}", pgn);
                    }
                }
                Err(e) => {
                    eprintln!("lichess fetch failed: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Some(Commands::Chess960 { index }) => match chess_core::chess960_fen(index) {
            Some(fen) => println!("{}", fen),
            None => {
                eprintln!("index out of range (0-959)");
                std::process::exit(1);
            }
        },
        Some(Commands::Variant { name }) => match chess_core::variant_position(&name) {
            Some(pos) => println!("{}", chess_core::to_fen(&pos)),
            None => {
                eprintln!("unknown variant: {}", name);
                std::process::exit(1);
            }
        },
    }
}
