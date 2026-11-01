#![allow(
    clippy::needless_range_loop,
    clippy::new_without_default,
    clippy::unnecessary_cast,
    clippy::manual_pattern_char_comparison,
    clippy::unnecessary_map_or
)]

use anyhow::{Context, Result};
use chess_core::{
    apply_move, generate_moves, Color, GameResult, Move, MoveType, Piece, PieceType, Position,
    Square,
};
use std::collections::HashMap;
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::Path;

const L1: usize = 256;
const L2: usize = 32;
const L3: usize = 32;

#[derive(Clone, Copy, Debug)]
pub struct Weights {
    pub w0: [[i8; L2]; L1],
    pub b0: [i16; L2],
    pub w1: [[i8; L3]; L2 * 2],
    pub b1: [i16; L3],
    pub w2: [i8; L2 * 2 + L3 * 2],
    pub b2: i16,
}

impl Weights {
    pub fn new() -> Self {
        let mut seed: u32 = 0x12345678;
        let mut next = move || {
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            ((seed >> 16) & 0x7fff) as i32
        };

let mut w0 = [[0i8; L2]; L1];

        // Fill w0 with small random values (no PST seeding to avoid saturated initial outputs)
        for i in 0..L1 {
            for j in 0..L2 {
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
        for i in 0..(L2 * 2 + L3 * 2) {
            w2[i] = ((next() % 9) - 4) as i8;
        }

        let b2 = 0i16;

        Self { w0, b0, w1, b1, w2, b2 }
    }

    pub fn load(path: &Path) -> Result<Self> {
        let data = fs::read(path).with_context(|| format!("read weights from {:?}", path))?;
        let mut off: usize = 0;
        let mut w0 = [[0i8; L2]; L1];
        let mut b0 = [0i16; L2];
        let mut w1 = [[0i8; L3]; L2 * 2];
        let mut b1 = [0i16; L3];
        let mut w2 = [0i8; L2 * 2 + L3 * 2];

        for i in 0..L1 {
            for j in 0..L2 {
                w0[i][j] = data[off] as i8;
                off += 1;
            }
        }
        for j in 0..L2 {
            b0[j] = i16::from_le_bytes([data[off], data[off + 1]]);
            off += 2;
        }
        for i in 0..(L2 * 2) {
            for j in 0..L3 {
                w1[i][j] = data[off] as i8;
                off += 1;
            }
        }
        for j in 0..L3 {
            b1[j] = i16::from_le_bytes([data[off], data[off + 1]]);
            off += 2;
        }
        for i in 0..(L2 * 2 + L3 * 2) {
            w2[i] = data[off] as i8;
            off += 1;
        }
        let b2 = i16::from_le_bytes([data[off], data[off + 1]]);

        Ok(Weights { w0, b0, w1, b1, w2, b2 })
    }

    pub fn save(&self, path: &Path) -> Result<()> {
        let mut buf = Vec::new();
        for i in 0..L1 {
            for j in 0..L2 {
                buf.push(self.w0[i][j] as u8);
            }
        }
        for j in 0..L2 {
            buf.extend_from_slice(&self.b0[j].to_le_bytes());
        }
        for i in 0..(L2 * 2) {
            for j in 0..L3 {
                buf.push(self.w1[i][j] as u8);
            }
        }
        for j in 0..L3 {
            buf.extend_from_slice(&self.b1[j].to_le_bytes());
        }
        for i in 0..(L2 * 2 + L3 * 2) {
            buf.push(self.w2[i] as u8);
        }
        buf.extend_from_slice(&self.b2.to_le_bytes());
        fs::write(path, &buf).with_context(|| format!("write weights to {:?}", path))?;
        Ok(())
    }
}

#[allow(dead_code)]
#[derive(Clone, Debug)]
pub struct ForwardCache {
    pub acc: [i16; L1],
    pub hidden0: [i32; L2],
    pub relu0: [i32; L2 * 2],
    pub hidden1: [i32; L3],
    pub relu1: [i32; L3 * 2],
    pub output: i32,
}

#[allow(dead_code)]
pub fn evaluate(acc: &[i16; L1], weights: &Weights) -> ForwardCache {
    let mut hidden0 = [0i32; L2];
    for i in 0..L1 {
        if acc[i] != 0 {
            for j in 0..L2 {
                hidden0[j] += acc[i] as i32 * weights.w0[i][j] as i32;
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

    ForwardCache {
        acc: *acc,
        hidden0,
        relu0,
        hidden1,
        relu1,
        output,
    }
}

#[allow(dead_code)]
pub fn output_score(cache: &ForwardCache) -> i32 {
    cache.output * 600 / 1024
}

pub fn tanh_output(raw_score: f32, scale: f32) -> f32 {
    (raw_score / scale).tanh()
}

// ---------------------------------------------------------------------------
// Feature computation
// ---------------------------------------------------------------------------

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

fn feature_index(
    perspective: Color,
    ksq: Square,
    block: usize,
    piece: Piece,
    sq: Square,
) -> usize {
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

pub fn compute_features(position: &Position, perspective: Color, acc: &mut [i16; L1]) {
    for v in acc.iter_mut() {
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
                    acc[idx] = acc[idx].wrapping_add(1);
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// F32 weights for training
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
pub struct F32Weights {
    pub w0: [[f32; L2]; L1],
    pub b0: [f32; L2],
    pub w1: [[f32; L3]; L2 * 2],
    pub b1: [f32; L3],
    pub w2: [f32; L2 * 2 + L3 * 2],
    pub b2: f32,
}

impl F32Weights {
    pub fn from_i8(weights: &Weights) -> Self {
        Self {
            w0: weights.w0.map(|row| row.map(|v| v as f32)),
            b0: weights.b0.map(|v| v as f32),
            w1: weights.w1.map(|row| row.map(|v| v as f32)),
            b1: weights.b1.map(|v| v as f32),
            w2: weights.w2.map(|v| v as f32),
            b2: weights.b2 as f32,
        }
    }

    pub fn to_i8(&self) -> Weights {
        Weights {
            w0: self.w0.map(|row| row.map(|v| v.round() as i8)),
            b0: self.b0.map(|v| v.round() as i16),
            w1: self.w1.map(|row| row.map(|v| v.round() as i8)),
            b1: self.b1.map(|v| v.round() as i16),
            w2: self.w2.map(|v| v.round() as i8),
            b2: self.b2.round() as i16,
        }
    }
}

#[derive(Clone, Debug)]
pub struct F32ForwardCache {
    pub acc: [i16; L1],
    pub hidden0: [f32; L2],
    pub relu0: [f32; L2 * 2],
    pub hidden1: [f32; L3],
    pub relu1: [f32; L3 * 2],
    pub output: f32,
}

pub fn evaluate_f32(acc: &[i16; L1], weights: &F32Weights) -> F32ForwardCache {
    let mut hidden0 = [0f32; L2];
    for i in 0..L1 {
        if acc[i] != 0 {
            for j in 0..L2 {
                hidden0[j] += acc[i] as f32 * weights.w0[i][j];
            }
        }
    }

    let mut relu0 = [0f32; L2 * 2];
    for j in 0..L2 {
        let val = hidden0[j] + weights.b0[j];
        let sqr = val * val / 1024.0;
        let relu = if val > 0.0 { val } else { 0.0 };
        relu0[j] = relu;
        relu0[L2 + j] = sqr;
    }

    let mut hidden1 = [0f32; L3];
    for i in 0..(L2 * 2) {
        if relu0[i] != 0.0 {
            for j in 0..L3 {
                hidden1[j] += relu0[i] * weights.w1[i][j];
            }
        }
    }

    let mut relu1 = [0f32; L3 * 2];
    for j in 0..L3 {
        let val = hidden1[j] + weights.b1[j];
        let sqr = val * val / 1024.0;
        let relu = if val > 0.0 { val } else { 0.0 };
        relu1[j] = relu;
        relu1[L3 + j] = sqr;
    }

    let mut output = weights.b2;
    for i in 0..(L2 * 2) {
        output += relu0[i] * weights.w2[i];
    }
    for i in 0..(L3 * 2) {
        output += relu1[i] * weights.w2[L2 * 2 + i];
    }

    F32ForwardCache {
        acc: *acc,
        hidden0,
        relu0,
        hidden1,
        relu1,
        output,
    }
}

pub fn backward_f32(
    cache: &F32ForwardCache,
    weights: &F32Weights,
    d_output: f32,
) -> F32WeightGrads {
    let mut gw0 = [[0f32; L2]; L1];
    let mut gb0 = [0f32; L2];
    let mut gw1 = [[0f32; L3]; L2 * 2];
    let mut gb1 = [0f32; L3];
    let mut gw2 = [0f32; L2 * 2 + L3 * 2];
    let mut gb2 = 0f32;

    for i in 0..(L2 * 2) {
        gw2[i] += d_output * cache.relu0[i];
    }
    for i in 0..(L3 * 2) {
        gw2[L2 * 2 + i] += d_output * cache.relu1[i];
    }
    gb2 += d_output;

    let mut d_relu0 = [0f32; L2 * 2];
    for i in 0..(L2 * 2) {
        d_relu0[i] = d_output * weights.w2[i];
    }
    let mut d_relu1 = [0f32; L3 * 2];
    for i in 0..(L3 * 2) {
        d_relu1[i] = d_output * weights.w2[L2 * 2 + i];
    }

    let mut d_hidden0 = [0f32; L2];
    for j in 0..L2 {
        let val0 = cache.hidden0[j] + weights.b0[j];
        let d_relu = if val0 > 0.0 { d_relu0[j] } else { 0.0 };
        let d_sqr = d_relu0[L2 + j] * (2.0 * val0 / 1024.0);
        d_hidden0[j] = d_relu + d_sqr;
        gb0[j] += d_relu + d_sqr;
    }

    for i in 0..L1 {
        if cache.acc[i] != 0 {
            for j in 0..L2 {
                gw0[i][j] += d_hidden0[j] * cache.acc[i] as f32;
            }
        }
    }

    let mut d_hidden1 = [0f32; L3];
    for j in 0..L3 {
        let val1 = cache.hidden1[j] + weights.b1[j];
        let d_relu = if val1 > 0.0 { d_relu1[j] } else { 0.0 };
        let d_sqr = d_relu1[L3 + j] * (2.0 * val1 / 1024.0);
        d_hidden1[j] = d_relu + d_sqr;
        gb1[j] += d_relu + d_sqr;
    }

    for i in 0..(L2 * 2) {
        if cache.relu0[i] != 0.0 {
            for j in 0..L3 {
                gw1[i][j] += d_hidden1[j] * cache.relu0[i];
            }
        }
    }

    F32WeightGrads {
        gw0,
        gb0,
        gw1,
        gb1,
        gw2,
        gb2,
    }
}

#[derive(Clone, Debug)]
pub struct F32WeightGrads {
    pub gw0: [[f32; L2]; L1],
    pub gb0: [f32; L2],
    pub gw1: [[f32; L3]; L2 * 2],
    pub gb1: [f32; L3],
    pub gw2: [f32; L2 * 2 + L3 * 2],
    pub gb2: f32,
}

impl F32WeightGrads {
    pub fn new() -> Self {
        Self {
            gw0: [[0.0; L2]; L1],
            gb0: [0.0; L2],
            gw1: [[0.0; L3]; L2 * 2],
            gb1: [0.0; L3],
            gw2: [0.0; L2 * 2 + L3 * 2],
            gb2: 0.0,
        }
    }

    pub fn accumulate(&mut self, other: &F32WeightGrads) {
        for i in 0..L1 {
            for j in 0..L2 {
                self.gw0[i][j] += other.gw0[i][j];
            }
        }
        for j in 0..L2 {
            self.gb0[j] += other.gb0[j];
        }
        for i in 0..(L2 * 2) {
            for j in 0..L3 {
                self.gw1[i][j] += other.gw1[i][j];
            }
        }
        for j in 0..L3 {
            self.gb1[j] += other.gb1[j];
        }
        for i in 0..(L2 * 2 + L3 * 2) {
            self.gw2[i] += other.gw2[i];
        }
        self.gb2 += other.gb2;
    }

    pub fn apply(&self, weights: &mut F32Weights, lr: f32) {
        for i in 0..L1 {
            for j in 0..L2 {
                weights.w0[i][j] -= self.gw0[i][j] * lr;
            }
        }
        for j in 0..L2 {
            weights.b0[j] -= self.gb0[j] * lr;
        }
        for i in 0..(L2 * 2) {
            for j in 0..L3 {
                weights.w1[i][j] -= self.gw1[i][j] * lr;
            }
        }
        for j in 0..L3 {
            weights.b1[j] -= self.gb1[j] * lr;
        }
        for i in 0..(L2 * 2 + L3 * 2) {
            weights.w2[i] -= self.gw2[i] * lr;
        }
        weights.b2 -= self.gb2 * lr;
    }

    pub fn clear(&mut self) {
        *self = F32WeightGrads::new();
    }
}

// ---------------------------------------------------------------------------
// PGN parsing
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct PgnGame {
    pub headers: HashMap<String, String>,
    pub moves: Vec<String>,
    pub result: GameResult,
}

fn strip_annotations(s: &str) -> String {
    let mut out = String::new();
    let mut in_comment = false;
    for c in s.chars() {
        if in_comment {
            if c == '}' {
                in_comment = false;
            }
            continue;
        }
        match c {
            '{' => in_comment = true,
            '!' | '?' | '+' | '#' => continue,
            _ => out.push(c),
        }
    }
    out
}

fn parse_pgn_moves(move_text: &str) -> Vec<String> {
    let cleaned = strip_annotations(move_text);
    let cleaned = cleaned.replace("...", " ");
    let tokens: Vec<&str> = cleaned.split_whitespace().collect();
    let mut moves = Vec::new();
    for token in tokens {
        if token.is_empty() {
            continue;
        }
        if token.chars().all(|c| c.is_ascii_digit() || c == '.') {
            continue;
        }
        if token == "1-0" || token == "0-1" || token == "1/2-1/2" {
            continue;
        }
        moves.push(token.to_string());
    }
    moves
}

fn parse_result(s: &str) -> GameResult {
    match s {
        "1-0" => GameResult::WhiteWins,
        "0-1" => GameResult::BlackWins,
        "1/2-1/2" => GameResult::Draw,
        _ => GameResult::Ongoing,
    }
}

pub fn parse_pgn_file(path: &Path) -> Result<Vec<PgnGame>> {
    let file = fs::File::open(path).with_context(|| format!("open {:?}", path))?;
    let reader = BufReader::new(file);
    let mut games = Vec::new();
    let mut headers: HashMap<String, String> = HashMap::new();
    let mut move_text = String::new();
    let mut in_headers = true;

    for line in reader.lines() {
        let line = line.with_context(|| format!("read line from {:?}", path))?;
        let trimmed = line.trim();

        if in_headers {
            if trimmed.is_empty() {
                if !headers.is_empty() {
                    in_headers = false;
                }
                continue;
            }
            if let Some(rest) = trimmed.strip_prefix('[') {
                let rest = rest.trim_end_matches(']').trim();
                if let Some(eq_pos) = rest.find('"') {
                    let key = rest[..eq_pos].trim();
                    let val_start = eq_pos + 1;
                    let val_end = rest[val_start..].rfind('"').unwrap_or(0) + val_start;
                    let val = &rest[val_start..val_end];
                    headers.insert(key.to_string(), val.to_string());
                }
            }
        } else {
            if !trimmed.is_empty() {
                if !move_text.is_empty() {
                    move_text.push(' ');
                }
                move_text.push_str(trimmed);
            }
            if trimmed.ends_with("1-0")
                || trimmed.ends_with("0-1")
                || trimmed.ends_with("1/2-1/2")
            {
                let san_moves = parse_pgn_moves(&move_text);
                let result_token = trimmed
                    .split_whitespace()
                    .last()
                    .unwrap_or("")
                    .trim_end_matches(|c: char| c == '!' || c == '?' || c == '+' || c == '#');
                let result = parse_result(result_token);
                games.push(PgnGame {
                    headers: headers.clone(),
                    moves: san_moves,
                    result,
                });
                headers.clear();
                move_text.clear();
                in_headers = true;
            }
        }
    }

    Ok(games)
}

// ---------------------------------------------------------------------------
// SAN matching
// ---------------------------------------------------------------------------

pub fn san_to_move(position: &Position, san: &str) -> Option<Move> {
    let san = san.trim();
    if san.is_empty() {
        return None;
    }

    if san == "O-O" || san == "0-0" {
        return find_castling(position, true);
    }
    if san == "O-O-O" || san == "0-0-0" {
        return find_castling(position, false);
    }

    let moves = generate_moves(position);
    if moves.is_empty() {
        return None;
    }

    let side = position.side_to_move;
    let is_pawn_san = !san.starts_with(|c: char| matches!(c, 'K' | 'Q' | 'R' | 'B' | 'N'));

    let (piece_type, file_hint, rank_hint, is_capture, dest_sq, promotion) =
        if is_pawn_san {
            let bytes = san.as_bytes();
            let file_char = bytes[0] as char;
            let file = (file_char as u8 - b'a') as usize;
            let mut idx = 1;
            let mut is_capture = false;
            let mut dest_file = file;
            if idx < bytes.len() && bytes[idx] as char == 'x' {
                is_capture = true;
                idx += 1;
                if idx < bytes.len() {
                    dest_file = (bytes[idx] as u8 - b'a') as usize;
                    idx += 1;
                }
            }
            let mut dest_rank = None;
            if idx < bytes.len() && bytes[idx].is_ascii_digit() {
                dest_rank = Some((bytes[idx] as u8 - b'1') as usize);
                idx += 1;
            }
            let mut promotion = None;
            if idx < bytes.len() {
                let c = bytes[idx] as char;
                if matches!(c, 'q' | 'r' | 'b' | 'n' | 'Q' | 'R' | 'B' | 'N') {
                    promotion = match c {
                        'q' | 'Q' => Some(PieceType::Queen),
                        'r' | 'R' => Some(PieceType::Rook),
                        'b' | 'B' => Some(PieceType::Bishop),
                        'n' | 'N' => Some(PieceType::Knight),
                        _ => None,
                    };
                }
            }
            let dest_rank = dest_rank.map(|r| r as u8);
            let dest = Square::new(dest_file as u8, dest_rank?)?;
            (
                PieceType::Pawn,
                Some(file),
                None,
                is_capture,
                dest,
                promotion,
            )
        } else {
            let bytes = san.as_bytes();
            let pt = match bytes[0] as char {
                'K' => PieceType::King,
                'Q' => PieceType::Queen,
                'R' => PieceType::Rook,
                'B' => PieceType::Bishop,
                'N' => PieceType::Knight,
                _ => return None,
            };

            // Find end of meaningful SAN (strip trailing +, #, ++)
            let mut end = bytes.len();
            while end > 0 {
                let c = bytes[end - 1] as char;
                if c == '+' || c == '#' {
                    end -= 1;
                } else {
                    break;
                }
            }

            // Destination is always the last 2 characters before suffix
            let mut idx = 1;
            if end < idx + 2 {
                return None;
            }
            let dest_file = (bytes[end - 2] as u8 - b'a') as usize;
            let dest_rank = (bytes[end - 1] as u8 - b'1') as usize;
            let dest = Square::new(dest_file as u8, dest_rank as u8)?;

            // Everything between piece (idx=1) and destination (end-2) is disambiguation
            let mut file_hint = None;
            let mut rank_hint = None;
            let mut is_capture = false;
            while idx < end - 2 {
                let c = bytes[idx] as char;
                if c == 'x' {
                    is_capture = true;
                    idx += 1;
                } else if c.is_ascii_alphabetic() && c != 'x' {
                    file_hint = Some((c as u8 - b'a') as usize);
                    idx += 1;
                } else if c.is_ascii_digit() {
                    rank_hint = Some((c as u8 - b'1') as usize);
                    idx += 1;
                } else {
                    idx += 1;
                }
            }

            let mut promotion = None;
            if end < bytes.len() && bytes[end] as char == '=' {
                let pc_idx = end + 1;
                if pc_idx < bytes.len() {
                    let pc = bytes[pc_idx] as char;
                    promotion = match pc {
                        'Q' => Some(PieceType::Queen),
                        'R' => Some(PieceType::Rook),
                        'B' => Some(PieceType::Bishop),
                        'N' => Some(PieceType::Knight),
                        _ => None,
                    };
                }
            }
            (pt, file_hint, rank_hint, is_capture, dest, promotion)
        };

    for m in &moves {
        let piece = match position.get_piece(m.from) {
            Some(p) => p,
            None => continue,
        };
        if piece.color != side || piece.piece_type != piece_type {
            continue;
        }
        if m.to != dest_sq {
            continue;
        }
        let actual_capture = position.get_piece(m.to).is_some()
            || matches!(m.flags, MoveType::EnPassant);
        if is_capture != actual_capture {
            continue;
        }
        if let Some(fh) = file_hint {
            if m.from.file as usize != fh {
                continue;
            }
        }
        if let Some(rh) = rank_hint {
            if m.from.rank as usize != rh {
                continue;
            }
        }
        if let Some(promo) = promotion {
            if m.promotion != Some(promo) {
                continue;
            }
        }
        return Some(*m);
    }

    None
}

fn find_castling(position: &Position, king_side: bool) -> Option<Move> {
    let moves = generate_moves(position);
    let side = position.side_to_move;
    let rank = if side == Color::White { 0 } else { 7 };
    let from = Square::new(4, rank).unwrap();
    let to = if king_side {
        Square::new(6, rank).unwrap()
    } else {
        Square::new(2, rank).unwrap()
    };
    for m in &moves {
        if m.from == from && m.to == to {
            if king_side && matches!(m.flags, MoveType::CastleKingSide) {
                return Some(*m);
            }
            if !king_side && matches!(m.flags, MoveType::CastleQueenSide) {
                return Some(*m);
            }
        }
    }
    None
}

// ---------------------------------------------------------------------------
// Training examples
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
pub struct TrainingExample {
    pub acc_white: [i16; L1],
    pub acc_black: [i16; L1],
    pub side_to_move: Color,
    pub target: f32,
}

pub fn replay_game(game: &PgnGame) -> Result<Vec<TrainingExample>> {
    // Skip Chess960 variants (CastlingRights doesn't support file-based castling)
    if game.headers.get("Variant").map_or(false, |v| v.contains("Chess960")) {
        return Ok(Vec::new());
    }
    let mut pos = if game.headers.get("SetUp") == Some(&"1".to_string()) {
        if let Some(fen) = game.headers.get("FEN") {
            Position::from_fen(fen).with_context(|| format!("invalid FEN: {fen}"))?
        } else {
            Position::standard()
        }
    } else {
        Position::standard()
    };
    let mut examples = Vec::new();

    for san in &game.moves {
        let mut acc = [[0i16; L1]; 2];
        compute_features(&pos, Color::White, &mut acc[0]);
        compute_features(&pos, Color::Black, &mut acc[1]);

        let m = san_to_move(&pos, san).with_context(|| {
            format!(
                "cannot parse SAN '{}' side={:?} fullmove={} (game headers: {:?})",
                san, pos.side_to_move, pos.fullmove_number, game.headers
            )
        })?;

        apply_move(&mut pos, m);

        let side_idx = match pos.side_to_move.opponent() {
            Color::White => 0,
            Color::Black => 1,
        };
        let target = match game.result {
            GameResult::WhiteWins => {
                if side_idx == 0 { 1.0 } else { 0.0 }
            }
            GameResult::BlackWins => {
                if side_idx == 1 { 1.0 } else { 0.0 }
            }
            GameResult::Draw => 0.5,
            GameResult::Ongoing => 0.5,
        };

        examples.push(TrainingExample {
            acc_white: acc[0],
            acc_black: acc[1],
            side_to_move: pos.side_to_move.opponent(),
            target,
        });
    }

    Ok(examples)
}

fn read_pgn_files_recursive(dir: &Path) -> Result<Vec<std::path::PathBuf>> {
    let mut paths = Vec::new();
    if dir.is_dir() {
        for entry in fs::read_dir(dir).with_context(|| format!("read_dir {:?}", dir))? {
            let entry = entry.with_context(|| format!("read_dir entry {:?}", dir))?;
            let path = entry.path();
            if path.is_dir() {
                paths.extend(read_pgn_files_recursive(&path)?);
            } else if path.extension().is_some_and(|e| e == "pgn") {
                paths.push(path);
            }
        }
    }
    Ok(paths)
}

pub fn collect_examples(pgn_dir: &Path, max_games: Option<usize>) -> Result<Vec<TrainingExample>> {
    let mut all_examples = Vec::new();
    let mut game_count = 0;
    let paths = read_pgn_files_recursive(pgn_dir)?;

    for path in paths {
        let games = parse_pgn_file(&path)?;
        for game in &games {
            match replay_game(game) {
                Ok(exs) => {
                    all_examples.extend(exs);
                    game_count += 1;
                    if game_count % 1000 == 0 {
                        println!("  Collected {} examples from {} games...", all_examples.len(), game_count);
                    }
                }
                Err(e) => {
                    eprintln!("Skipping game due to error: {}", e);
                }
            }
            if let Some(max) = max_games {
                if game_count >= max {
                    return Ok(all_examples);
                }
            }
        }
    }

    Ok(all_examples)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_san_from_startpos() {
        let pos = Position::standard();
        let m = san_to_move(&pos, "e4").unwrap_or_else(|| panic!("e4 should parse"));
        assert_eq!(m.from.to_san(), "e2");
        assert_eq!(m.to.to_san(), "e4");

        let m = san_to_move(&pos, "d4").unwrap_or_else(|| panic!("d4 should parse"));
        assert_eq!(m.from.to_san(), "d2");
        assert_eq!(m.to.to_san(), "d4");

        let m = san_to_move(&pos, "Nf3").unwrap_or_else(|| panic!("Nf3 should parse"));
        assert_eq!(m.from.to_san(), "g1");
        assert_eq!(m.to.to_san(), "f3");
    }

    #[test]
    fn test_san_castling() {
        let mut pos = Position::standard();
        for san in ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6"] {
            let m = san_to_move(&pos, san).unwrap_or_else(|| panic!("{} should parse", san));
            apply_move(&mut pos, m);
        }
        let moves = generate_moves(&pos);
        let castle_moves: Vec<_> = moves
            .iter()
            .filter(|m| matches!(m.flags, MoveType::CastleKingSide | MoveType::CastleQueenSide))
            .collect();
        assert!(!castle_moves.is_empty(), "No castling moves generated");
        let m = san_to_move(&pos, "O-O").unwrap_or_else(|| panic!("O-O should parse"));
        assert!(matches!(m.flags, MoveType::CastleKingSide));
    }
}
