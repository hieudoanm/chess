use crate::color::Color;
use crate::mv::{Move, MoveType};
use crate::piece::{Piece, PieceType};
use crate::Position;
use crate::Square;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameResult {
    WhiteWins,
    BlackWins,
    Draw,
    Ongoing,
}

const PAWN_PST: [[i32; 8]; 8] = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST: [[i32; 8]; 8] = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST: [[i32; 8]; 8] = [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST: [[i32; 8]; 8] = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST: [[i32; 8]; 8] = [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -10],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_PST: [[i32; 8]; 8] = [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
];

const KING_ENDGAME_PST: [[i32; 8]; 8] = [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
];

const MATERIAL: [i32; 6] = [100, 320, 330, 500, 900, 0];

fn pst_for(piece_type: PieceType) -> &'static [[i32; 8]; 8] {
    match piece_type {
        PieceType::Pawn => &PAWN_PST,
        PieceType::Knight => &KNIGHT_PST,
        PieceType::Bishop => &BISHOP_PST,
        PieceType::Rook => &ROOK_PST,
        PieceType::Queen => &QUEEN_PST,
        PieceType::King => &KING_PST,
    }
}

fn king_phase(position: &Position) -> i32 {
    let mut phase = 0;
    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            if let Some(piece) = position.get_piece(sq) {
                match piece.piece_type {
                    PieceType::Queen => phase += 4,
                    PieceType::Rook => phase += 2,
                    PieceType::Bishop => phase += 1,
                    PieceType::Knight => phase += 1,
                    _ => {}
                }
            }
        }
    }
    phase
}

fn king_safety(position: &Position, color: Color) -> i32 {
    let king_sq = match position.king_square(color) {
        Some(sq) => sq,
        None => return 0,
    };

    let mut score = 0;

    // Penalty for king in center
    if king_sq.file >= 3 && king_sq.file <= 4 && king_sq.rank <= 2 {
        score -= 30;
    }

    // Pawn shield: bonus for pawns in front of king
    let dir = if color == Color::White { 1 } else { -1 };
    for df in [-1i8, 0, 1] {
        let pf = king_sq.file as i8 + df;
        let pr = king_sq.rank as i8 + dir;
        if (0..8).contains(&pf) && (0..8).contains(&pr) {
            let psq = Square::new(pf as u8, pr as u8).unwrap();
            if let Some(p) = position.get_piece(psq) {
                if p.color == color && p.piece_type == PieceType::Pawn {
                    score += 15;
                }
            }
        }
    }

    score
}

fn pawn_structure(position: &Position, color: Color) -> i32 {
    let mut score = 0;

    for file in 0..8 {
        for rank in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            let Some(piece) = position.get_piece(sq) else {
                continue;
            };
            if piece.color != color || piece.piece_type != PieceType::Pawn {
                continue;
            }

            // Doubled pawns: check if another pawn of same color is on same file
            let mut doubled = false;
            for r in 0..8 {
                if r == rank {
                    continue;
                }
                let csq = Square::new(file, r).unwrap();
                if let Some(cp) = position.get_piece(csq) {
                    if cp.color == color && cp.piece_type == PieceType::Pawn {
                        doubled = true;
                        break;
                    }
                }
            }
            if doubled {
                score -= 20;
            }

            // Isolated pawns: no friendly pawns on adjacent files
            let mut isolated = true;
            for adj_file in [file as i8 - 1, file as i8 + 1] {
                if !(0..=7).contains(&adj_file) {
                    continue;
                }
                for r in 0..8 {
                    let asq = Square::new(adj_file as u8, r).unwrap();
                    if let Some(ap) = position.get_piece(asq) {
                        if ap.color == color && ap.piece_type == PieceType::Pawn {
                            isolated = false;
                            break;
                        }
                    }
                }
                if !isolated {
                    break;
                }
            }
            if isolated {
                score -= 15;
            }

            // Passed pawn: no enemy pawns ahead on same or adjacent files
            let mut passed = true;
            let r_range: Box<dyn Iterator<Item = i32>> = if color == Color::White {
                Box::new((rank as i32 + 1)..8)
            } else {
                Box::new((0..rank as i32).rev())
            };
            for r in r_range {
                for af in [file as i8 - 1, file as i8, file as i8 + 1] {
                    if !(0..=7).contains(&af) {
                        continue;
                    }
                    let psq = Square::new(af as u8, r as u8).unwrap();
                    if let Some(pp) = position.get_piece(psq) {
                        if pp.color != color && pp.piece_type == PieceType::Pawn {
                            passed = false;
                            break;
                        }
                    }
                }
                if !passed {
                    break;
                }
            }
            if passed {
                // Bonus increases as pawn advances
                let progress = if color == Color::White {
                    rank as i32
                } else {
                    7 - rank as i32
                };
                score += 10 + progress * progress * 2;
            }
        }
    }
    score
}

fn rook_file_bonus(position: &Position, color: Color) -> i32 {
    let mut score = 0;
    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            let Some(piece) = position.get_piece(sq) else {
                continue;
            };
            if piece.color != color || piece.piece_type != PieceType::Rook {
                continue;
            }

            // Check if file is open (no pawns of either color)
            let mut open = true;
            let mut semi_open = true;
            for r in 0..8 {
                let csq = Square::new(file, r).unwrap();
                if let Some(cp) = position.get_piece(csq) {
                    if cp.piece_type == PieceType::Pawn {
                        open = false;
                        if cp.color == color {
                            semi_open = false;
                        }
                    }
                }
            }
            if open {
                score += 20;
            } else if semi_open {
                score += 10;
            }
        }
    }
    score
}

fn bishop_pair(position: &Position, color: Color) -> i32 {
    let mut count = 0;
    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            if let Some(piece) = position.get_piece(sq) {
                if piece.color == color && piece.piece_type == PieceType::Bishop {
                    count += 1;
                }
            }
        }
    }
    if count >= 2 {
        30
    } else {
        0
    }
}

pub fn evaluate(position: &Position) -> i32 {
    let phase = king_phase(position);
    let mut score = 0;

    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            if let Some(piece) = position.get_piece(sq) {
                let pst = pst_for(piece.piece_type);
                let pst_bonus = if piece.color == Color::White {
                    pst[rank as usize][file as usize]
                } else {
                    pst[(7 - rank) as usize][file as usize]
                };

                let material = MATERIAL[piece.piece_type as usize];

                let val = material + pst_bonus;
                if piece.color == Color::White {
                    score += val;
                } else {
                    score -= val;
                }
            }
        }
    }

    // King safety
    score += king_safety(position, Color::White) / 4;
    score -= king_safety(position, Color::Black) / 4;

    // King PST interpolation: opening vs endgame
    if let Some(ksq) = position.king_square(Color::White) {
        let mg = KING_PST[ksq.rank as usize][ksq.file as usize];
        let eg = KING_ENDGAME_PST[ksq.rank as usize][ksq.file as usize];
        let interpolated = (mg * phase + eg * (24 - phase)) / 24;
        score += interpolated;
    }
    if let Some(ksq) = position.king_square(Color::Black) {
        let mg = KING_PST[(7 - ksq.rank) as usize][ksq.file as usize];
        let eg = KING_ENDGAME_PST[(7 - ksq.rank) as usize][ksq.file as usize];
        let interpolated = (mg * phase + eg * (24 - phase)) / 24;
        score -= interpolated;
    }

    // Pawn structure
    score += pawn_structure(position, Color::White);
    score -= pawn_structure(position, Color::Black);

    // Rook file bonus
    score += rook_file_bonus(position, Color::White);
    score -= rook_file_bonus(position, Color::Black);

    // Bishop pair
    score += bishop_pair(position, Color::White);
    score -= bishop_pair(position, Color::Black);

    // Tempo bonus
    if position.side_to_move == Color::White {
        score += 10;
    } else {
        score -= 10;
    }

    score
}

pub fn game_result(position: &Position) -> GameResult {
    let moves = crate::move_gen::generate_moves(position);
    if moves.is_empty() {
        if position.is_in_check(position.side_to_move) {
            match position.side_to_move {
                Color::White => GameResult::BlackWins,
                Color::Black => GameResult::WhiteWins,
            }
        } else {
            GameResult::Draw
        }
    } else {
        GameResult::Ongoing
    }
}

pub fn apply_move(position: &mut Position, m: Move) {
    let piece = position.get_piece(m.from).unwrap();

    position.set_piece(m.to, Some(piece));
    position.set_piece(m.from, None);

    match m.flags {
        MoveType::PawnPromotionQueen | MoveType::PawnCapturePromotionQueen => {
            position.set_piece(m.to, Some(Piece::new(piece.color, PieceType::Queen)));
        }
        MoveType::PawnPromotionRook | MoveType::PawnCapturePromotionRook => {
            position.set_piece(m.to, Some(Piece::new(piece.color, PieceType::Rook)));
        }
        MoveType::PawnPromotionBishop | MoveType::PawnCapturePromotionBishop => {
            position.set_piece(m.to, Some(Piece::new(piece.color, PieceType::Bishop)));
        }
        MoveType::PawnPromotionKnight | MoveType::PawnCapturePromotionKnight => {
            position.set_piece(m.to, Some(Piece::new(piece.color, PieceType::Knight)));
        }
        MoveType::CastleKingSide => {
            if piece.color == Color::White {
                position.set_piece(
                    Square::new(5, 0).unwrap(),
                    Some(Piece::new(Color::White, PieceType::Rook)),
                );
                position.set_piece(Square::new(7, 0).unwrap(), None);
            } else {
                position.set_piece(
                    Square::new(5, 7).unwrap(),
                    Some(Piece::new(Color::Black, PieceType::Rook)),
                );
                position.set_piece(Square::new(7, 7).unwrap(), None);
            }
        }
        MoveType::CastleQueenSide => {
            if piece.color == Color::White {
                position.set_piece(
                    Square::new(3, 0).unwrap(),
                    Some(Piece::new(Color::White, PieceType::Rook)),
                );
                position.set_piece(Square::new(0, 0).unwrap(), None);
            } else {
                position.set_piece(
                    Square::new(3, 7).unwrap(),
                    Some(Piece::new(Color::Black, PieceType::Rook)),
                );
                position.set_piece(Square::new(0, 7).unwrap(), None);
            }
        }
        _ => {}
    }

    position.side_to_move = position.side_to_move.opponent();
    if position.side_to_move == Color::White {
        position.fullmove_number += 1;
    }
}
