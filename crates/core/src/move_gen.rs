use crate::color::Color;
use crate::mv::{Move, MoveType};
use crate::piece::{Piece, PieceType};
use crate::Position;
use crate::Square;

pub fn generate_moves(position: &Position) -> Vec<Move> {
    let mut moves = Vec::new();
    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            if let Some(piece) = position.get_piece(sq) {
                if piece.color == position.side_to_move {
                    generate_piece_moves(position, sq, piece, &mut moves);
                }
            }
        }
    }
    moves
}

fn generate_piece_moves(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    match piece.piece_type {
        PieceType::Pawn => generate_pawn_moves(position, from, piece, moves),
        PieceType::Knight => generate_knight_moves(position, from, piece, moves),
        PieceType::Bishop => generate_sliding_moves(
            position,
            from,
            piece,
            &[(1, 1), (1, -1), (-1, 1), (-1, -1)],
            moves,
        ),
        PieceType::Rook => generate_sliding_moves(
            position,
            from,
            piece,
            &[(1, 0), (-1, 0), (0, 1), (0, -1)],
            moves,
        ),
        PieceType::Queen => generate_sliding_moves(
            position,
            from,
            piece,
            &[
                (1, 1),
                (1, -1),
                (-1, 1),
                (-1, -1),
                (1, 0),
                (-1, 0),
                (0, 1),
                (0, -1),
            ],
            moves,
        ),
        PieceType::King => generate_king_moves(position, from, piece, moves),
    }
}

fn add_move(
    position: &Position,
    from: Square,
    to: Square,
    piece: Piece,
    moves: &mut Vec<Move>,
    promotion: bool,
) {
    let mut new_pos = position.clone();
    let captured = new_pos.get_piece(to);
    new_pos.set_piece(to, Some(piece));
    new_pos.set_piece(from, None);
    if !new_pos.is_in_check(piece.color) {
        if promotion {
            for pt in [
                PieceType::Queen,
                PieceType::Rook,
                PieceType::Bishop,
                PieceType::Knight,
            ] {
                let mut m = Move::new(from, to);
                m.promotion = Some(pt);
                m.flags = if captured.is_some() {
                    match pt {
                        PieceType::Queen => MoveType::PawnCapturePromotionQueen,
                        PieceType::Rook => MoveType::PawnCapturePromotionRook,
                        PieceType::Bishop => MoveType::PawnCapturePromotionBishop,
                        PieceType::Knight => MoveType::PawnCapturePromotionKnight,
                        _ => MoveType::PawnCapturePromotionQueen,
                    }
                } else {
                    match pt {
                        PieceType::Queen => MoveType::PawnPromotionQueen,
                        PieceType::Rook => MoveType::PawnPromotionRook,
                        PieceType::Bishop => MoveType::PawnPromotionBishop,
                        PieceType::Knight => MoveType::PawnPromotionKnight,
                        _ => MoveType::PawnPromotionQueen,
                    }
                };
                moves.push(m);
            }
        } else {
            let m = if captured.is_some() {
                Move::capture(from, to)
            } else {
                Move::new(from, to)
            };
            moves.push(m);
        }
    }
}

fn generate_pawn_moves(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    let dir = if piece.color == Color::White { 1 } else { -1 };
    let start_rank = if piece.color == Color::White { 1 } else { 6 };
    let promotion_rank = if piece.color == Color::White { 7 } else { 0 };

    let to_rank = from.rank as i8 + dir;
    if let Some(to) = Square::new(from.file, to_rank as u8) {
        if position.get_piece(to).is_none() {
            if to.rank == promotion_rank {
                add_move(position, from, to, piece, moves, true);
            } else {
                add_move(position, from, to, piece, moves, false);
            }
            if from.rank == start_rank {
                let to2_rank = from.rank as i8 + 2 * dir;
                if let Some(to2) = Square::new(from.file, to2_rank as u8) {
                    if position.get_piece(to2).is_none() {
                        add_move(position, from, to2, piece, moves, false);
                    }
                }
            }
        }
    }

    for df in [-1i8, 1i8] {
        let to_file = from.file as i8 + df;
        let to_rank = from.rank as i8 + dir;
        if let Some(to) = Square::new(to_file as u8, to_rank as u8) {
            if let Some(captured) = position.get_piece(to) {
                if captured.color != piece.color {
                    if to.rank == promotion_rank {
                        add_move(position, from, to, piece, moves, true);
                    } else {
                        add_move(position, from, to, piece, moves, false);
                    }
                }
            }
        }
    }
}

fn generate_knight_moves(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    let offsets = [
        (1, 2),
        (1, -2),
        (-1, 2),
        (-1, -2),
        (2, 1),
        (2, -1),
        (-2, 1),
        (-2, -1),
    ];
    for (df, dr) in offsets {
        let to_file = from.file as i8 + df;
        let to_rank = from.rank as i8 + dr;
        if let Some(to) = Square::new(to_file as u8, to_rank as u8) {
            if let Some(target) = position.get_piece(to) {
                if target.color != piece.color {
                    add_move(position, from, to, piece, moves, false);
                }
            } else {
                add_move(position, from, to, piece, moves, false);
            }
        }
    }
}

fn generate_sliding_moves(
    position: &Position,
    from: Square,
    piece: Piece,
    dirs: &[(i8, i8)],
    moves: &mut Vec<Move>,
) {
    for (df, dr) in dirs {
        let mut file = from.file as i8 + df;
        let mut rank = from.rank as i8 + dr;
        while let Some(to) = Square::new(file as u8, rank as u8) {
            match position.get_piece(to) {
                Some(target) => {
                    if target.color != piece.color {
                        add_move(position, from, to, piece, moves, false);
                    }
                    break;
                }
                None => {
                    add_move(position, from, to, piece, moves, false);
                }
            }
            file += df;
            rank += dr;
        }
    }
}

fn generate_king_moves(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    for df in -1..=1 {
        for dr in -1..=1 {
            if df == 0 && dr == 0 {
                continue;
            }
            let to_file = from.file as i8 + df;
            let to_rank = from.rank as i8 + dr;
            if let Some(to) = Square::new(to_file as u8, to_rank as u8) {
                match position.get_piece(to) {
                    Some(target) => {
                        if target.color != piece.color {
                            add_move(position, from, to, piece, moves, false);
                        }
                    }
                    None => {
                        add_move(position, from, to, piece, moves, false);
                    }
                }
            }
        }
    }
}

pub fn generate_captures(position: &Position) -> Vec<Move> {
    let mut moves = Vec::new();
    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            if let Some(piece) = position.get_piece(sq) {
                if piece.color == position.side_to_move {
                    generate_piece_captures(position, sq, piece, &mut moves);
                }
            }
        }
    }
    moves
}

fn generate_piece_captures(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    match piece.piece_type {
        PieceType::Pawn => generate_pawn_captures(position, from, piece, moves),
        PieceType::Knight => {
            for m in generate_knight_captures(position, from, piece) {
                moves.push(m);
            }
        }
        PieceType::Bishop => generate_sliding_captures(
            position,
            from,
            piece,
            &[(1, 1), (1, -1), (-1, 1), (-1, -1)],
            moves,
        ),
        PieceType::Rook => generate_sliding_captures(
            position,
            from,
            piece,
            &[(1, 0), (-1, 0), (0, 1), (0, -1)],
            moves,
        ),
        PieceType::Queen => generate_sliding_captures(
            position,
            from,
            piece,
            &[
                (1, 1),
                (1, -1),
                (-1, 1),
                (-1, -1),
                (1, 0),
                (-1, 0),
                (0, 1),
                (0, -1),
            ],
            moves,
        ),
        PieceType::King => {
            for m in generate_king_captures(position, from, piece) {
                moves.push(m);
            }
        }
    }
}

fn generate_pawn_captures(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    let dir = if piece.color == Color::White { 1 } else { -1 };
    let promotion_rank = if piece.color == Color::White { 7 } else { 0 };

    for df in [-1i8, 1i8] {
        let to_file = from.file as i8 + df;
        let to_rank = from.rank as i8 + dir;
        if let Some(to) = Square::new(to_file as u8, to_rank as u8) {
            if let Some(captured) = position.get_piece(to) {
                if captured.color != piece.color {
                    if to.rank == promotion_rank {
                        for pt in [
                            PieceType::Queen,
                            PieceType::Rook,
                            PieceType::Bishop,
                            PieceType::Knight,
                        ] {
                            let mut m = Move::capture(from, to);
                            m.promotion = Some(pt);
                            m.flags = match pt {
                                PieceType::Queen => MoveType::PawnCapturePromotionQueen,
                                PieceType::Rook => MoveType::PawnCapturePromotionRook,
                                PieceType::Bishop => MoveType::PawnCapturePromotionBishop,
                                PieceType::Knight => MoveType::PawnCapturePromotionKnight,
                                _ => MoveType::PawnCapturePromotionQueen,
                            };
                            moves.push(m);
                        }
                    } else {
                        moves.push(Move::capture(from, to));
                    }
                }
            }
        }
    }
}

fn generate_knight_captures(position: &Position, from: Square, piece: Piece) -> Vec<Move> {
    let mut moves = Vec::new();
    let offsets = [
        (1, 2),
        (1, -2),
        (-1, 2),
        (-1, -2),
        (2, 1),
        (2, -1),
        (-2, 1),
        (-2, -1),
    ];
    for (df, dr) in offsets {
        let to_file = from.file as i8 + df;
        let to_rank = from.rank as i8 + dr;
        if let Some(to) = Square::new(to_file as u8, to_rank as u8) {
            if let Some(target) = position.get_piece(to) {
                if target.color != piece.color {
                    moves.push(Move::capture(from, to));
                }
            }
        }
    }
    moves
}

fn generate_sliding_captures(
    position: &Position,
    from: Square,
    piece: Piece,
    dirs: &[(i8, i8)],
    moves: &mut Vec<Move>,
) {
    for (df, dr) in dirs {
        let mut file = from.file as i8 + df;
        let mut rank = from.rank as i8 + dr;
        while let Some(to) = Square::new(file as u8, rank as u8) {
            if let Some(target) = position.get_piece(to) {
                if target.color != piece.color {
                    moves.push(Move::capture(from, to));
                }
                break;
            }
            file += df;
            rank += dr;
        }
    }
}

fn generate_king_captures(position: &Position, from: Square, piece: Piece) -> Vec<Move> {
    let mut moves = Vec::new();
    for df in -1..=1 {
        for dr in -1..=1 {
            if df == 0 && dr == 0 {
                continue;
            }
            let to_file = from.file as i8 + df;
            let to_rank = from.rank as i8 + dr;
            if let Some(to) = Square::new(to_file as u8, to_rank as u8) {
                if let Some(target) = position.get_piece(to) {
                    if target.color != piece.color {
                        moves.push(Move::capture(from, to));
                    }
                }
            }
        }
    }
    moves
}

pub fn find_move_from_uci(position: &Position, uci: &str) -> Option<Move> {
    let bytes = uci.as_bytes();
    let from = Square::from_san(&uci[0..2])?;
    let to = Square::from_san(&uci[2..4])?;
    let promotion = if bytes.len() >= 5 {
        match bytes[4] as char {
            'q' => Some(crate::piece::PieceType::Queen),
            'r' => Some(crate::piece::PieceType::Rook),
            'b' => Some(crate::piece::PieceType::Bishop),
            'n' => Some(crate::piece::PieceType::Knight),
            _ => None,
        }
    } else {
        None
    };

    generate_moves(position)
        .into_iter()
        .find(|m| m.from == from && m.to == to && m.promotion == promotion)
}
