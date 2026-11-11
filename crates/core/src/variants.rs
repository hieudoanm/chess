use crate::piece::{Piece, PieceType};
use crate::{CastlingRights, Color, Position, Square};

mod data;
use data::CHESS960;

pub const CHESS960_COUNT: usize = 960;

/// Back-rank layout for a Chess960 start position index (0..960).
pub fn chess960_back_rank(index: usize) -> Option<&'static str> {
    CHESS960.get(index).copied()
}

/// Build the starting Position for a Chess960 index.
pub fn chess960_position(index: usize) -> Option<Position> {
    let rank = chess960_back_rank(index)?;
    let mut board = [[None; 8]; 8];
    for (file, ch) in rank.chars().enumerate() {
        let piece_type = match ch {
            'K' => PieceType::King,
            'Q' => PieceType::Queen,
            'R' => PieceType::Rook,
            'B' => PieceType::Bishop,
            'N' => PieceType::Knight,
            _ => return None,
        };
        board[0][file] = Some(Piece::new(Color::White, piece_type));
        board[7][file] = Some(Piece::new(Color::Black, piece_type));
    }
    for cell in board[1].iter_mut() {
        *cell = Some(Piece::new(Color::White, PieceType::Pawn));
    }
    for cell in board[6].iter_mut() {
        *cell = Some(Piece::new(Color::Black, PieceType::Pawn));
    }

    let mut castling = CastlingRights::none();
    let white_rooks: Vec<u8> = (0..8)
        .filter(|&f| board[0][f as usize].map(|p| p.piece_type) == Some(PieceType::Rook))
        .collect();
    let black_rooks: Vec<u8> = (0..8)
        .filter(|&f| board[7][f as usize].map(|p| p.piece_type) == Some(PieceType::Rook))
        .collect();
    if white_rooks.len() == 2 {
        castling.white_queen_rook_file = white_rooks[0];
        castling.white_king_rook_file = white_rooks[1];
        castling.white_queen_side = true;
        castling.white_king_side = true;
    }
    if black_rooks.len() == 2 {
        castling.black_queen_rook_file = black_rooks[0];
        castling.black_king_rook_file = black_rooks[1];
        castling.black_queen_side = true;
        castling.black_king_side = true;
    }

    Some(Position {
        board,
        side_to_move: Color::White,
        castling,
        en_passant: None,
        halfmove_clock: 0,
        fullmove_number: 1,
        variant: crate::Variant::Standard,
        checks: [0, 0],
        pockets: [[0; 5]; 2],
    })
}

/// Horde: White fields only pawns; Black has the full army.
pub fn horde_position() -> Position {
    Position::from_fen("rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w kq - 0 1")
        .map(|mut p| {
            p.variant = crate::Variant::Horde;
            p
        })
        .unwrap()
}

/// Crazyhouse: standard setup with empty pockets.
pub fn crazyhouse_position() -> Position {
    let mut p = Position::standard();
    p.variant = crate::Variant::Crazyhouse;
    p
}

/// Three-check: standard setup; win by giving check three times.
pub fn three_check_position() -> Position {
    let mut p = Position::standard();
    p.variant = crate::Variant::ThreeCheck;
    p
}

pub fn variant_position(name: &str) -> Option<Position> {
    match crate::Variant::parse(name)? {
        crate::Variant::Standard => Some(Position::standard()),
        crate::Variant::ThreeCheck => Some(three_check_position()),
        crate::Variant::Horde => Some(horde_position()),
        crate::Variant::Crazyhouse => Some(crazyhouse_position()),
    }
}

/// FEN for a Chess960 start position index.
pub fn chess960_fen(index: usize) -> Option<String> {
    let pos = chess960_position(index)?;
    Some(crate::notation::to_fen(&pos))
}

/// Back-rank string from a position's home ranks, if it looks like Chess960.
pub fn back_rank_of(position: &Position, color: Color) -> Option<String> {
    let rank = if color == Color::White { 0 } else { 7 };
    let mut s = String::new();
    for file in 0..8 {
        let piece = position.get_piece(Square::new(file, rank)?)?;
        s.push(piece.symbol());
    }
    Some(s)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::notation::to_fen;
    use crate::{apply_move, find_move_from_uci, game_result, GameResult};

    #[test]
    fn horde_start_position() {
        let pos = horde_position();
        assert_eq!(pos.variant, crate::Variant::Horde);
        assert!(pos.king_square(crate::Color::White).is_none());
        assert!(pos.king_square(crate::Color::Black).is_some());
        let fen = to_fen(&pos);
        let back = crate::Position::from_fen(&fen).unwrap();
        assert_eq!(back.variant, crate::Variant::Standard);
    }

    #[test]
    fn crazyhouse_drop_lifecycle() {
        let mut pos = crazyhouse_position();
        pos.pockets[0][1] = 1; // white knight in pocket
        let mv = find_move_from_uci(&pos, "N@e5").unwrap();
        assert_eq!(mv.drop, Some(crate::PieceType::Knight));
        let state = apply_move(&mut pos, mv);
        assert_eq!(pos.pockets[0][1], 0);
        assert_eq!(
            pos.get_piece(crate::Square::new(4, 4).unwrap())
                .unwrap()
                .piece_type,
            crate::PieceType::Knight
        );
        crate::undo_move(&mut pos, mv, state);
        assert_eq!(pos.pockets[0][1], 1);
        assert!(pos.get_piece(crate::Square::new(4, 4).unwrap()).is_none());
    }

    #[test]
    fn crazyhouse_capture_funds_pocket() {
        let mut pos = crate::Position::from_fen("r3k3/8/8/8/8/8/8/4K2Q w - - 0 1").unwrap();
        pos.variant = crate::Variant::Crazyhouse;
        let mv = find_move_from_uci(&pos, "h1a8").unwrap();
        apply_move(&mut pos, mv);
        assert_eq!(pos.pockets[0][3], 1); // captured rook funds white's pocket
        assert_eq!(game_result(&pos), GameResult::Ongoing);
    }

    #[test]
    fn three_check_counts_checks() {
        let mut pos = three_check_position();
        pos.checks = [2, 0];
        // scholar's mate-ish: just verify counter increments on a checking move
        crate::play_san(&mut pos, "e4").unwrap();
        crate::play_san(&mut pos, "e5").unwrap();
        crate::play_san(&mut pos, "Bc4").unwrap();
        crate::play_san(&mut pos, "Nc6").unwrap();
        crate::play_san(&mut pos, "Qh5").unwrap();
        crate::play_san(&mut pos, "Nf6").unwrap();
        crate::play_san(&mut pos, "Qxf7").unwrap();
        assert_eq!(pos.checks[0], 3);
        assert_eq!(game_result(&pos), GameResult::BlackWins);
    }

    #[test]
    fn crazyhouse_fen_roundtrip() {
        let mut pos = crazyhouse_position();
        pos.pockets[0][3] = 2;
        pos.pockets[1][0] = 1;
        let fen = to_fen(&pos);
        assert!(fen.contains("[RRp]"), "{}", fen);
        let back = crate::Position::from_fen(&fen).unwrap();
        assert_eq!(back.variant, crate::Variant::Crazyhouse);
        assert_eq!(back.pockets, pos.pockets);
    }
}
