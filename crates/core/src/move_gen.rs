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
    if position.variant == crate::Variant::Crazyhouse {
        generate_drops(position, &mut moves);
    }
    moves
}

fn generate_drops(position: &Position, moves: &mut Vec<Move>) {
    let color = position.side_to_move.index();
    for (slot, pt) in [
        PieceType::Pawn,
        PieceType::Knight,
        PieceType::Bishop,
        PieceType::Rook,
        PieceType::Queen,
    ]
    .iter()
    .enumerate()
    {
        if position.pockets[color][slot] == 0 {
            continue;
        }
        for rank in 0..8 {
            for file in 0..8 {
                if *pt == PieceType::Pawn && (rank == 0 || rank == 7) {
                    continue;
                }
                let sq = Square::new(file, rank).unwrap();
                if position.get_piece(sq).is_none() {
                    moves.push(Move::drop(sq, *pt));
                }
            }
        }
    }
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
    generate_en_passant(position, from, piece, moves);
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
    generate_castling(position, from, piece, moves);
}

#[allow(clippy::collapsible_if)]
fn generate_castling(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    if position.is_in_check(piece.color) {
        return;
    }
    let color = piece.color;
    let home_rank = if color == Color::White { 0 } else { 7 };
    if from.rank != home_rank {
        return;
    }
    let enemy = color.opponent();
    let rights = [
        (
            position.castling.white_king_side,
            position.castling.white_king_rook_file,
            true,
        ),
        (
            position.castling.white_queen_side,
            position.castling.white_queen_rook_file,
            false,
        ),
        (
            position.castling.black_king_side,
            position.castling.black_king_rook_file,
            true,
        ),
        (
            position.castling.black_queen_side,
            position.castling.black_queen_rook_file,
            false,
        ),
    ];
    let color_idx = if color == Color::White { 0 } else { 2 };

    for side_idx in 0..2 {
        let (right, rook_file, kingside) = rights[color_idx + side_idx];
        if !right || rook_file > 7 {
            continue;
        }
        let rook_sq = match Square::new(rook_file, home_rank) {
            Some(s) => s,
            None => continue,
        };
        if position.get_piece(rook_sq) != Some(Piece::new(color, PieceType::Rook)) {
            continue;
        }
        // Kingside: king lands on g-file (6), rook on f-file (5).
        // Queenside: king on c-file (2), rook on d-file (3).
        let king_to_file: u8 = if kingside { 6 } else { 2 };
        let rook_to_file: u8 = if kingside { 5 } else { 3 };
        let king_to = match Square::new(king_to_file, home_rank) {
            Some(s) => s,
            None => continue,
        };
        let rook_to = match Square::new(rook_to_file, home_rank) {
            Some(s) => s,
            None => continue,
        };

        // Squares strictly between king and rook must be empty.
        let (lo, hi) = if from.file < rook_file {
            (from.file, rook_file)
        } else {
            (rook_file, from.file)
        };
        let mut blocked = false;
        for f in (lo + 1)..hi {
            if position
                .get_piece(Square::new(f, home_rank).unwrap())
                .is_some()
            {
                blocked = true;
                break;
            }
        }
        // Rook destination must be empty, the king's origin, or the rook's own square.
        if rook_to_file != rook_file
            && rook_to_file != from.file
            && position.get_piece(rook_to).is_some()
        {
            blocked = true;
        }
        if blocked {
            continue;
        }

        // King path: squares strictly between origin and destination plus the
        // destination. Each must be empty or the rook's origin square, and must
        // not be attacked.
        let mut king_path_attacked = false;
        if king_to_file != from.file {
            let step: i8 = if king_to_file > from.file { 1 } else { -1 };
            let mut f = from.file as i8 + step;
            loop {
                let sf = f as u8;
                let sq = Square::new(sf, home_rank).unwrap();
                let occupied = position.get_piece(sq).is_some() && sf != rook_file;
                if occupied {
                    king_path_attacked = true;
                    break;
                }
                for r in 0..8 {
                    for ff in 0..8 {
                        let esq = Square::new(ff, r).unwrap();
                        if let Some(p) = position.get_piece(esq) {
                            if p.color == enemy && position.square_attacks(esq, sq) {
                                king_path_attacked = true;
                            }
                        }
                    }
                }
                if king_path_attacked || sf == king_to_file {
                    break;
                }
                f += step;
            }
        }
        if king_path_attacked {
            continue;
        }

        moves.push(Move {
            from,
            to: king_to,
            promotion: None,
            flags: if kingside {
                MoveType::CastleKingSide
            } else {
                MoveType::CastleQueenSide
            },
            drop: None,
        });
    }
}

fn generate_en_passant(position: &Position, from: Square, piece: Piece, moves: &mut Vec<Move>) {
    let Some(ep) = position.en_passant else {
        return;
    };
    let dir = if piece.color == Color::White { 1 } else { -1 };
    let from_rank = if piece.color == Color::White { 4 } else { 3 };
    if from.rank != from_rank {
        return;
    }
    for df in [-1i8, 1i8] {
        let to_file = from.file as i8 + df;
        if let Some(to) = Square::new(to_file as u8, ep.rank) {
            if to.file == ep.file {
                let mut new_pos = position.clone();
                let captured_sq = Square::new(ep.file, (ep.rank as i8 - dir) as u8).unwrap();
                new_pos.set_piece(to, Some(piece));
                new_pos.set_piece(from, None);
                new_pos.set_piece(captured_sq, None);
                if !new_pos.is_in_check(piece.color) {
                    moves.push(Move {
                        from,
                        to,
                        promotion: None,
                        flags: MoveType::EnPassant,
                        drop: None,
                    });
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
    if let Some((letter, sq)) = uci.split_once('@') {
        let piece = match letter.to_ascii_uppercase().as_str() {
            "P" => PieceType::Pawn,
            "N" => PieceType::Knight,
            "B" => PieceType::Bishop,
            "R" => PieceType::Rook,
            "Q" => PieceType::Queen,
            _ => return None,
        };
        let to = Square::from_san(sq)?;
        return generate_moves(position)
            .into_iter()
            .find(|m| m.drop == Some(piece) && m.to == to);
    }
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
