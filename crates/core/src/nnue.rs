#![allow(
    clippy::needless_range_loop,
    clippy::new_without_default,
    clippy::unnecessary_cast
)]

use crate::color::Color;
use crate::mv::Move;
use crate::piece::{Piece, PieceType};
use crate::position::Position;
use crate::rules::StateInfo;
use crate::Square;

pub const L1: usize = 256;
pub const L2: usize = 32;
pub const L3: usize = 32;
pub const OUTPUT_SCALE: i32 = 600;

fn king_bucket(ksq: Square) -> usize {
    let mut f = ksq.file;
    if f > 3 {
        f = 7 - f;
    }
    let bucket = match ksq.rank {
        0 => 0,
        1 => 4,
        2 => 8,
        3 => 12,
        4 => 16,
        5 => 20,
        6 => 24,
        7 => 28,
        _ => 0,
    } + f / 2;
    bucket.min(31) as usize
}

fn psq_block(position: &Position, perspective: Color) -> usize {
    let mut enemy_queens = 0;
    let mut own_rooks_queens = 0;
    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            if let Some(piece) = position.get_piece(sq) {
                if piece.color == perspective.opponent() && piece.piece_type == PieceType::Queen {
                    enemy_queens += 1;
                }
                if piece.color == perspective
                    && (piece.piece_type == PieceType::Rook || piece.piece_type == PieceType::Queen)
                {
                    own_rooks_queens += 1;
                }
            }
        }
    }
    if enemy_queens > 0 {
        2
    } else if own_rooks_queens > 0 {
        1
    } else {
        0
    }
}

fn feature_index(perspective: Color, ksq: Square, block: usize, piece: Piece, sq: Square) -> usize {
    let rel = if perspective == Color::White {
        sq
    } else {
        Square::new(7 - sq.file, 7 - sq.rank).unwrap()
    };
    let rel_ksq = if perspective == Color::White {
        ksq
    } else {
        Square::new(7 - ksq.file, 7 - ksq.rank).unwrap()
    };
    let kb = king_bucket(rel_ksq);

    let pt_offset = match piece.piece_type {
        PieceType::Pawn => 0,
        PieceType::Knight => 64,
        PieceType::Bishop => 128,
        PieceType::Rook => 192,
        PieceType::Queen => 256,
        PieceType::King => 320,
    };
    let color_offset = if piece.color == perspective { 0 } else { 384 };

    let raw = color_offset + pt_offset + rel.index() + kb * 768 + block * 24576;
    (raw.wrapping_mul(2654435761) >> 24) % L1
}

pub struct DeterministicWeights {
    w0: [[i8; L2]; L1],
    b0: [i16; L2],
    w1: [[i8; L3]; L2 * 2],
    b1: [i16; L3],
    w2: [i8; L2 * 2 + L3 * 2],
    b2: i16,
}

impl DeterministicWeights {
    fn new() -> Self {
        let mut seed: u32 = 0x12345678;
        let mut next = move || {
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            ((seed >> 16) & 0x7fff) as i32
        };

        let mut w0 = [[0i8; L2]; L1];

        // Piece-square tables (white perspective, mirrored for black)
        const PST_PAWN: [i32; 64] = [
            0, 0, 0, 0, 0, 0, 0, 0,
            5, 10, 10, -20, -20, 10, 10, 5,
            5, -5, -10, 0, 0, -10, -5, 5,
            0, 0, 0, 20, 20, 0, 0, 0,
            5, 5, 10, 25, 25, 10, 5, 5,
            10, 10, 20, 30, 30, 20, 10, 10,
            50, 50, 50, 50, 50, 50, 50, 50,
            0, 0, 0, 0, 0, 0, 0, 0,
        ];
        const PST_KNIGHT: [i32; 64] = [
            -50, -40, -30, -30, -30, -30, -40, -50,
            -40, -20, 0, 5, 5, 0, -20, -40,
            -30, 5, 10, 15, 15, 10, 5, -30,
            -30, 0, 15, 20, 20, 15, 0, -30,
            -30, 5, 15, 20, 20, 15, 5, -30,
            -30, 0, 10, 15, 15, 10, 0, -30,
            -40, -20, 0, 0, 0, 0, -20, -40,
            -50, -40, -30, -30, -30, -30, -40, -50,
        ];
        const PST_BISHOP: [i32; 64] = [
            -20, -10, -10, -10, -10, -10, -10, -20,
            -10, 5, 0, 0, 0, 0, 5, -10,
            -10, 10, 10, 10, 10, 10, 10, -10,
            -10, 0, 10, 10, 10, 10, 0, -10,
            -10, 5, 5, 10, 10, 5, 5, -10,
            -10, 0, 5, 10, 10, 5, 0, -10,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -20, -10, -10, -10, -10, -10, -10, -20,
        ];
        const PST_ROOK: [i32; 64] = [
            0, 0, 0, 5, 5, 0, 0, 0,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            5, 10, 10, 10, 10, 10, 10, 5,
            0, 0, 0, 0, 0, 0, 0, 0,
        ];
        const PST_QUEEN: [i32; 64] = [
            -20, -10, -10, -5, -5, -10, -10, -20,
            -10, 0, 5, 0, 0, 0, 0, -10,
            -10, 5, 5, 5, 5, 5, 0, -10,
            0, 0, 5, 5, 5, 5, 0, -5,
            -5, 0, 5, 5, 5, 5, 0, -5,
            -10, 0, 5, 5, 5, 5, 0, -10,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -20, -10, -10, -5, -5, -10, -10, -20,
        ];

        let pst_tables = [
            &PST_PAWN as &[i32; 64],
            &PST_KNIGHT,
            &PST_BISHOP,
            &PST_ROOK,
            &PST_QUEEN,
        ];

        // Initialize first output neuron to encode material + PST values
        for perspective in [Color::White, Color::Black] {
            for kb in 0..32usize {
                for block in 0..3usize {
                    for pt_idx in 0..5usize {
                        let pt = match pt_idx {
                            0 => PieceType::Pawn,
                            1 => PieceType::Knight,
                            2 => PieceType::Bishop,
                            3 => PieceType::Rook,
                            _ => PieceType::Queen,
                        };
                        let base_val = match pt {
                            PieceType::Pawn => 100,
                            PieceType::Knight => 320,
                            PieceType::Bishop => 330,
                            PieceType::Rook => 500,
                            PieceType::Queen => 900,
                            _ => 0,
                        };
                        let pst = pst_tables[pt_idx];
                        for sq_idx in 0..64usize {
                            let sq = Square::from_index(sq_idx).unwrap();
                            // Mirror square for black perspective
                            let mirrored_sq = if perspective == Color::White {
                                sq
                            } else {
                                Square::new(7 - sq.file, 7 - sq.rank).unwrap()
                            };
                            let pst_val = pst[mirrored_sq.index()];

                            let rel_ksq = Square::from_index(kb * 2).unwrap_or(Square::new(4, 0).unwrap());
                            let ksq = if perspective == Color::White {
                                rel_ksq
                            } else {
                                Square::new(7 - rel_ksq.file, 7 - rel_ksq.rank).unwrap()
                            };
                            let piece = Piece::new(perspective, pt);
                            let idx = feature_index(perspective, ksq, block, piece, sq);
                            let sign = if perspective == Color::White { 1 } else { -1 };
                            let val = (sign * (base_val + pst_val)) as i8;
                            w0[idx][0] = w0[idx][0].saturating_add(val);
                        }
                    }
                }
            }
        }

        // Fill remaining w0 entries with small random values
        for i in 0..L1 {
            for j in 1..L2 {
                w0[i][j] = ((next() % 9) - 4) as i8;
            }
        }

        let mut b0 = [0i16; L2];
        for j in 0..L2 {
            b0[j] = ((next() % 41) - 20) as i16;
        }

        let mut w1 = [[0i8; L3]; L2 * 2];
        for i in 0..(L2 * 2) {
            for j in 0..L3 {
                w1[i][j] = ((next() % 21) - 10) as i8;
            }
        }

        let mut b1 = [0i16; L3];
        for j in 0..L3 {
            b1[j] = ((next() % 41) - 20) as i16;
        }

        let mut w2 = [0i8; L2 * 2 + L3 * 2];
        // First output weight passes through material+PST
        w2[0] = 6;
        for i in 1..(L2 * 2 + L3 * 2) {
            w2[i] = ((next() % 9) - 4) as i8;
        }

        let b2 = ((next() % 81) - 40) as i16;

        Self {
            w0,
            b0,
            w1,
            b1,
            w2,
            b2,
        }
    }
}

pub struct NnueAccumulator {
    acc: [[i16; L1]; 2],
    computed: [bool; 2],
}

impl Clone for NnueAccumulator {
    fn clone(&self) -> Self {
        NnueAccumulator {
            acc: self.acc,
            computed: self.computed,
        }
    }
}

impl NnueAccumulator {
    pub fn new() -> Self {
        NnueAccumulator {
            acc: [[0; L1]; 2],
            computed: [false; 2],
        }
    }

    pub fn clear(&mut self) {
        self.acc = [[0; L1]; 2];
        self.computed = [false; 2];
    }

    pub fn add_feature(&mut self, perspective: Color, idx: usize) {
        self.acc[perspective.index()][idx] = self.acc[perspective.index()][idx].wrapping_add(1);
    }

    pub fn sub_feature(&mut self, perspective: Color, idx: usize) {
        self.acc[perspective.index()][idx] = self.acc[perspective.index()][idx].wrapping_sub(1);
    }

    pub fn set_computed(&mut self, perspective: Color) {
        self.computed[perspective.index()] = true;
    }

    pub fn clear_computed(&mut self, perspective: Color) {
        self.computed[perspective.index()] = false;
    }

    pub fn is_computed(&self, perspective: Color) -> bool {
        self.computed[perspective.index()]
    }

    pub fn evaluate(&self, perspective: Color, weights: &DeterministicWeights) -> i32 {
        let idx = perspective.index();
        if !self.computed[idx] {
            return 0;
        }

        let mut hidden0 = [0i32; L2];
        for i in 0..L1 {
            if self.acc[idx][i] != 0 {
                for j in 0..L2 {
                    hidden0[j] += self.acc[idx][i] as i32 * weights.w0[i][j] as i32;
                }
            }
        }

        let mut relu0 = [0i32; L2 * 2];
        for j in 0..L2 {
            let val = hidden0[j] + weights.b0[j] as i32;
            let sqr = val * val / 1024;
            let relu = if val > 0 { val } else { 0 };
            relu0[j] = relu;
            relu0[L2 + j] = sqr;
        }

        let mut hidden1 = [0i32; L3];
        for i in 0..(L2 * 2) {
            if relu0[i] != 0 {
                for j in 0..L3 {
                    hidden1[j] += relu0[i] as i32 * weights.w1[i][j] as i32;
                }
            }
        }

        let mut relu1 = [0i32; L3 * 2];
        for j in 0..L3 {
            let val = hidden1[j] + weights.b1[j] as i32;
            let sqr = val * val / 1024;
            let relu = if val > 0 { val } else { 0 };
            relu1[j] = relu;
            relu1[L3 + j] = sqr;
        }

        let mut output = weights.b2 as i32;
        for i in 0..(L2 * 2) {
            output += relu0[i] as i32 * weights.w2[i] as i32;
        }
        for i in 0..(L3 * 2) {
            output += relu1[i] as i32 * weights.w2[L2 * 2 + i] as i32;
        }

        output * OUTPUT_SCALE / 1024
    }
}

pub fn compute_features(position: &Position, perspective: Color, accumulator: &mut [i16; L1]) {
    for v in accumulator.iter_mut() {
        *v = 0;
    }

    let Some(ksq) = position.king_square(perspective) else {
        return;
    };
    let block = psq_block(position, perspective);

    for rank in 0..8 {
        for file in 0..8 {
            let sq = Square::new(file, rank).unwrap();
            if let Some(piece) = position.get_piece(sq) {
                if piece.piece_type != PieceType::King {
                    let idx = feature_index(perspective, ksq, block, piece, sq);
                    accumulator[idx] = accumulator[idx].wrapping_add(1);
                }
            }
        }
    }
}

pub fn refresh_accumulator(position: &Position, accumulator: &mut NnueAccumulator) {
    accumulator.clear();
    compute_features(
        position,
        Color::White,
        &mut accumulator.acc[Color::White.index()],
    );
    compute_features(
        position,
        Color::Black,
        &mut accumulator.acc[Color::Black.index()],
    );
    accumulator.set_computed(Color::White);
    accumulator.set_computed(Color::Black);
}

pub fn apply_move_nnue(position: &Position, m: Move, accumulator: &mut NnueAccumulator) {
    let perspective = position.side_to_move;
    let ksq = match position.king_square(perspective) {
        Some(sq) => sq,
        None => return,
    };
    let block = psq_block(position, perspective);

    let moved = position.get_piece(m.from).unwrap();

    if moved.piece_type != PieceType::King {
        let idx = feature_index(perspective, ksq, block, moved, m.from);
        accumulator.sub_feature(perspective, idx);
    }

    if let Some(captured) = position.get_piece(m.to) {
        if captured.piece_type != PieceType::King {
            let opp = perspective.opponent();
            if let Some(ok_sq) = position.king_square(opp) {
                let oblock = psq_block(position, opp);
                let idx = feature_index(opp, ok_sq, oblock, captured, m.to);
                accumulator.sub_feature(opp, idx);
            }
        }
    }

    accumulator.clear_computed(perspective);
    accumulator.clear_computed(perspective.opponent());
}

pub fn apply_move_nnue_post(position: &Position, m: Move, accumulator: &mut NnueAccumulator) {
    let perspective = position.side_to_move.opponent();
    let Some(ksq) = position.king_square(perspective) else {
        return;
    };
    let block = psq_block(position, perspective);

    let moved = position.get_piece(m.to).unwrap();

    if moved.piece_type != PieceType::King {
        let idx = feature_index(perspective, ksq, block, moved, m.to);
        accumulator.add_feature(perspective, idx);
    }

    accumulator.set_computed(perspective);
    accumulator.set_computed(perspective.opponent());
}

pub fn undo_move_nnue_pre(position: &Position, m: Move, accumulator: &mut NnueAccumulator) {
    let perspective = position.side_to_move.opponent();
    let Some(ksq) = position.king_square(perspective) else {
        return;
    };
    let block = psq_block(position, perspective);

    let Some(moved) = position.get_piece(m.to) else {
        return;
    };

    if moved.piece_type != PieceType::King {
        let idx = feature_index(perspective, ksq, block, moved, m.to);
        accumulator.sub_feature(perspective, idx);
    }

    accumulator.clear_computed(perspective);
    accumulator.clear_computed(perspective.opponent());
}

pub fn undo_move_nnue_post(
    position: &Position,
    m: Move,
    state: &StateInfo,
    accumulator: &mut NnueAccumulator,
) {
    let perspective = position.side_to_move;
    let Some(ksq) = position.king_square(perspective) else {
        return;
    };
    let block = psq_block(position, perspective);

    let moved = state
        .captured
        .unwrap_or_else(|| position.get_piece(m.from).unwrap());

    if moved.piece_type != PieceType::King {
        let idx = feature_index(perspective, ksq, block, moved, m.from);
        accumulator.add_feature(perspective, idx);
    }

    if let Some(captured) = state.captured {
        if captured.piece_type != PieceType::King {
            let opp = perspective.opponent();
            if let Some(ok_sq) = position.king_square(opp) {
                let oblock = psq_block(position, opp);
                let idx = feature_index(opp, ok_sq, oblock, captured, m.to);
                accumulator.add_feature(opp, idx);
            }
        }
    }

    accumulator.set_computed(perspective);
    accumulator.set_computed(perspective.opponent());
}

pub struct NnueEval {
    weights: DeterministicWeights,
}

impl NnueEval {
    pub fn new() -> Self {
        NnueEval {
            weights: DeterministicWeights::new(),
        }
    }

    pub fn evaluate(&self, accumulator: &NnueAccumulator, perspective: Color) -> i32 {
        accumulator.evaluate(perspective, &self.weights)
    }

    pub fn evaluate_relative(&self, accumulator: &NnueAccumulator, side_to_move: Color) -> i32 {
        let white_score = accumulator.evaluate(Color::White, &self.weights);
        let black_score = accumulator.evaluate(Color::Black, &self.weights);
        if side_to_move == Color::White {
            white_score - black_score
        } else {
            black_score - white_score
        }
    }
}

impl Default for NnueEval {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_king_bucket_range() {
        for rank in 0..8 {
            for file in 0..8 {
                let sq = Square::new(file, rank).unwrap();
                let b = king_bucket(sq);
                assert!(b < 32, "king bucket {} out of range for {:?}", b, sq);
            }
        }
    }

    #[test]
    fn test_feature_index_range() {
        let pos = Position::standard();
        let ksq = pos.king_square(Color::White).unwrap();
        let block = psq_block(&pos, Color::White);
        let piece = Piece::new(Color::White, PieceType::Pawn);
        let sq = Square::new(0, 1).unwrap();
        let idx = feature_index(Color::White, ksq, block, piece, sq);
        assert!(idx < L1, "feature index {} out of range", idx);
    }

    #[test]
    fn test_accumulator_add_sub() {
        let mut acc = NnueAccumulator::new();
        acc.add_feature(Color::White, 5);
        assert_eq!(acc.acc[0][5], 1);
        acc.sub_feature(Color::White, 5);
        assert_eq!(acc.acc[0][5], 0);
    }
}
