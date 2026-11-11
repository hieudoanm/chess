use anyhow::Result;
use chess_core::{apply_move, game_result, generate_moves, Color, GameResult, Move, Position};

fn winner_of(result: GameResult) -> Option<Color> {
    match result {
        GameResult::WhiteWins => Some(Color::White),
        GameResult::BlackWins => Some(Color::Black),
        _ => None,
    }
}

fn mate_line(position: &Position, plies: u32) -> Option<Vec<Move>> {
    if plies == 0 {
        return None;
    }
    let stm = position.side_to_move;
    let mut moves = generate_moves(position);
    moves.sort_by_key(|m| m.to_san());
    for m in moves {
        let mut pos = position.clone();
        apply_move(&mut pos, m);
        match game_result(&pos) {
            r if winner_of(r) == Some(stm) => return Some(vec![m]),
            GameResult::Ongoing => {}
            _ => continue,
        }
        if let Some(mut rest) = mate_line(&pos, plies - 1) {
            let mut line = vec![m];
            line.append(&mut rest);
            return Some(line);
        }
    }
    None
}

pub fn run(fen: Option<&str>, max_plies: u32) -> Result<()> {
    let pos = fen
        .and_then(Position::from_fen)
        .unwrap_or_else(Position::standard);
    for plies in (1..=max_plies).step_by(2) {
        if let Some(line) = mate_line(&pos, plies) {
            let n = plies.div_ceil(2);
            println!(
                "Mate in {} ({:?}): {}",
                n,
                pos.side_to_move,
                line.iter()
                    .map(|m| m.to_uci())
                    .collect::<Vec<_>>()
                    .join(" ")
            );
            return Ok(());
        }
    }
    println!("No mate found within {} plies.", max_plies);
    Ok(())
}
