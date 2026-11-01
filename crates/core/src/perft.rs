use crate::move_gen::generate_moves;
use crate::rules::apply_move;
use crate::Position;

pub fn perft(position: &Position, depth: u32) -> u64 {
    if depth == 0 {
        return 1;
    }
    let mut nodes = 0u64;
    for m in generate_moves(position) {
        let mut new_pos = position.clone();
        apply_move(&mut new_pos, m);
        nodes += perft(&new_pos, depth - 1);
    }
    nodes
}

pub fn perft_divide(position: &Position, depth: u32) -> Vec<(String, u64)> {
    let mut results = Vec::new();
    for m in generate_moves(position) {
        let mut new_pos = position.clone();
        apply_move(&mut new_pos, m);
        let n = perft(&new_pos, depth - 1);
        results.push((m.to_uci(), n));
    }
    results
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::color::Color;

    #[test]
    fn perft_startpos() {
        let pos = Position::standard();
        let expected = [(1, 20u64), (2, 400), (3, 8902)];
        for (d, exp) in expected {
            assert_eq!(perft(&pos, d), exp, "perft depth {}", d);
        }
    }

    #[test]
    fn perft_divide_startpos_depth1() {
        let pos = Position::standard();
        let divides = perft_divide(&pos, 1);
        let total: u64 = divides.iter().map(|(_, n)| n).sum();
        assert_eq!(total, 20);
        assert_eq!(divides.len(), 20);
    }

    #[test]
    fn test_check_filtering() {
        // Startpos should have legal moves
        let pos = Position::standard();
        let moves = generate_moves(&pos);
        assert!(!moves.is_empty(), "startpos should have legal moves");
        assert!(
            moves.iter().any(|m| m.to_uci() == "e2e4"),
            "e2e4 should be legal from startpos"
        );

        // White Ke1 in check from black rook on e5 along the e-file
        // White king can move to d2, f2, d1, f1 (not e2 - attacked by rook along e-file)
        let fen = "4k3/8/8/4r3/8/8/8/4K3 w - - 0 1";
        let pos = Position::from_fen(fen).unwrap();
        assert_eq!(pos.side_to_move, Color::White);
        assert!(
            pos.is_in_check(Color::White),
            "white should be in check from Re5"
        );
        let legal = generate_moves(&pos);
        println!(
            "Legal moves in check: {:?}",
            legal.iter().map(|m| m.to_uci()).collect::<Vec<_>>()
        );
        assert!(!legal.is_empty(), "should have legal moves when in check");
        assert!(
            legal.iter().any(|m| m.to_uci() == "e1d1"),
            "Kd1 should be legal"
        );
        assert!(
            legal.iter().any(|m| m.to_uci() == "e1f1"),
            "Kf1 should be legal"
        );
        assert!(
            !legal.iter().any(|m| m.to_uci() == "e1e2"),
            "Ke2 should not be legal (attacked by rook)"
        );
    }
}
