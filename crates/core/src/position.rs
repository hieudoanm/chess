use crate::color::Color;
use crate::piece::{Piece, PieceType};
use crate::Square;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct CastlingRights {
    pub white_king_side: bool,
    pub white_queen_side: bool,
    pub black_king_side: bool,
    pub black_queen_side: bool,
}

impl CastlingRights {
    pub const fn none() -> Self {
        CastlingRights {
            white_king_side: false,
            white_queen_side: false,
            black_king_side: false,
            black_queen_side: false,
        }
    }

    pub const fn all() -> Self {
        CastlingRights {
            white_king_side: true,
            white_queen_side: true,
            black_king_side: true,
            black_queen_side: true,
        }
    }
}

impl Default for CastlingRights {
    fn default() -> Self {
        CastlingRights::all()
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Position {
    pub board: [[Option<Piece>; 8]; 8],
    pub side_to_move: Color,
    pub castling: CastlingRights,
    pub en_passant: Option<Square>,
    pub halfmove_clock: u32,
    pub fullmove_number: u32,
}

impl Position {
    pub fn new() -> Self {
        Position::standard()
    }

    pub fn standard() -> Self {
        let mut board = [[None; 8]; 8];

        board[7][0] = Some(Piece::new(Color::Black, PieceType::Rook));
        board[7][1] = Some(Piece::new(Color::Black, PieceType::Knight));
        board[7][2] = Some(Piece::new(Color::Black, PieceType::Bishop));
        board[7][3] = Some(Piece::new(Color::Black, PieceType::Queen));
        board[7][4] = Some(Piece::new(Color::Black, PieceType::King));
        board[7][5] = Some(Piece::new(Color::Black, PieceType::Bishop));
        board[7][6] = Some(Piece::new(Color::Black, PieceType::Knight));
        board[7][7] = Some(Piece::new(Color::Black, PieceType::Rook));
        for cell in &mut board[6] {
            *cell = Some(Piece::new(Color::Black, PieceType::Pawn));
        }
        board[0][0] = Some(Piece::new(Color::White, PieceType::Rook));
        board[0][1] = Some(Piece::new(Color::White, PieceType::Knight));
        board[0][2] = Some(Piece::new(Color::White, PieceType::Bishop));
        board[0][3] = Some(Piece::new(Color::White, PieceType::Queen));
        board[0][4] = Some(Piece::new(Color::White, PieceType::King));
        board[0][5] = Some(Piece::new(Color::White, PieceType::Bishop));
        board[0][6] = Some(Piece::new(Color::White, PieceType::Knight));
        board[0][7] = Some(Piece::new(Color::White, PieceType::Rook));
        for cell in &mut board[1] {
            *cell = Some(Piece::new(Color::White, PieceType::Pawn));
        }

        Position {
            board,
            side_to_move: Color::White,
            castling: CastlingRights::all(),
            en_passant: None,
            halfmove_clock: 0,
            fullmove_number: 1,
        }
    }

    pub fn from_fen(fen: &str) -> Option<Self> {
        let parts: Vec<&str> = fen.split_whitespace().collect();
        if parts.is_empty() {
            return None;
        }

        let mut board = [[None; 8]; 8];

        // Parse piece placement
        let rows: Vec<&str> = parts[0].split('/').collect();
        if rows.len() != 8 {
            return None;
        }
        for (rank_idx, row) in rows.iter().enumerate() {
            let rank = 7 - rank_idx;
            let mut file = 0;
            for ch in row.chars() {
                if ch.is_ascii_digit() {
                    file += ch.to_digit(10)? as u8;
                } else {
                    let color = if ch.is_ascii_uppercase() {
                        Color::White
                    } else {
                        Color::Black
                    };
                    let piece_type = match ch.to_ascii_lowercase() {
                        'p' => PieceType::Pawn,
                        'n' => PieceType::Knight,
                        'b' => PieceType::Bishop,
                        'r' => PieceType::Rook,
                        'q' => PieceType::Queen,
                        'k' => PieceType::King,
                        _ => return None,
                    };
                    let _ = Square::new(file, rank as u8)?;
                    board[rank][file as usize] = Some(Piece::new(color, piece_type));
                    file += 1;
                }
            }
        }

        let mut side_to_move = Color::White;
        let mut castling = CastlingRights::none();
        let mut en_passant = None;
        let mut halfmove_clock = 0u32;
        let mut fullmove_number = 1u32;

        if parts.len() > 1 {
            side_to_move = match parts[1] {
                "w" => Color::White,
                "b" => Color::Black,
                _ => return None,
            };
        }
        if parts.len() > 2 {
            for ch in parts[2].chars() {
                match ch {
                    'K' => castling.white_king_side = true,
                    'Q' => castling.white_queen_side = true,
                    'k' => castling.black_king_side = true,
                    'q' => castling.black_queen_side = true,
                    '-' => {}
                    _ => return None,
                }
            }
        }
        if parts.len() > 3 && parts[3] != "-" {
            en_passant = Square::from_san(parts[3]);
        }
        if parts.len() > 4 {
            halfmove_clock = parts[4].parse().ok()?;
        }
        if parts.len() > 5 {
            fullmove_number = parts[5].parse().ok()?;
        }

        Some(Position {
            board,
            side_to_move,
            castling,
            en_passant,
            halfmove_clock,
            fullmove_number,
        })
    }

    pub fn get_piece(&self, square: Square) -> Option<Piece> {
        self.board[square.rank as usize][square.file as usize]
    }

    pub fn set_piece(&mut self, square: Square, piece: Option<Piece>) {
        self.board[square.rank as usize][square.file as usize] = piece;
    }

    pub fn king_square(&self, color: Color) -> Option<Square> {
        for rank in 0..8 {
            for file in 0..8 {
                let sq = Square::new(file, rank).unwrap();
                if let Some(piece) = self.get_piece(sq) {
                    if piece.color == color && piece.piece_type == PieceType::King {
                        return Some(sq);
                    }
                }
            }
        }
        None
    }

    pub fn is_in_check(&self, color: Color) -> bool {
        let king_sq = match self.king_square(color) {
            Some(sq) => sq,
            None => return false,
        };
        let opponent = color.opponent();
        for rank in 0..8 {
            for file in 0..8 {
                let sq = Square::new(file, rank).unwrap();
                if let Some(piece) = self.get_piece(sq) {
                    if piece.color == opponent && self.square_attacks(sq, king_sq) {
                        return true;
                    }
                }
            }
        }
        false
    }

    pub fn square_attacks(&self, from: Square, to: Square) -> bool {
        let piece = match self.get_piece(from) {
            Some(p) => p,
            None => return false,
        };
        let dx = to.file as i8 - from.file as i8;
        let dy = to.rank as i8 - from.rank as i8;
        let abs_dx = dx.abs();
        let abs_dy = dy.abs();

        match piece.piece_type {
            PieceType::Pawn => {
                let dir = if piece.color == Color::White { 1 } else { -1 };
                abs_dx == 1 && dy == dir
            }
            PieceType::Knight => (abs_dx == 1 && abs_dy == 2) || (abs_dx == 2 && abs_dy == 1),
            PieceType::King => abs_dx <= 1 && abs_dy <= 1,
            PieceType::Bishop => abs_dx == abs_dy && abs_dx > 0 && self.path_clear(from, to),
            PieceType::Rook => {
                (abs_dx == 0 || abs_dy == 0) && abs_dx + abs_dy > 0 && self.path_clear(from, to)
            }
            PieceType::Queen => {
                (abs_dx == abs_dy || abs_dx == 0 || abs_dy == 0)
                    && abs_dx + abs_dy > 0
                    && self.path_clear(from, to)
            }
        }
    }

    fn path_clear(&self, from: Square, to: Square) -> bool {
        let dx = (to.file as i8 - from.file as i8).signum();
        let dy = (to.rank as i8 - from.rank as i8).signum();
        let mut file = from.file as i8 + dx;
        let mut rank = from.rank as i8 + dy;
        while file != to.file as i8 || rank != to.rank as i8 {
            if let Some(sq) = Square::new(file as u8, rank as u8) {
                if self.get_piece(sq).is_some() {
                    return false;
                }
            } else {
                return false;
            }
            file += dx;
            rank += dy;
        }
        true
    }
}

impl Default for Position {
    fn default() -> Self {
        Position::new()
    }
}

// Zobrist hashing for transposition table
struct ZobristKeys {
    piece: [[[u64; 64]; 6]; 2],
    side: u64,
    castling: [u64; 4],
    ep: [u64; 8],
}

static ZOBRIST: std::sync::OnceLock<ZobristKeys> = std::sync::OnceLock::new();

#[allow(clippy::needless_range_loop)]
fn get_zobrist() -> &'static ZobristKeys {
    ZOBRIST.get_or_init(|| {
        let mut state: u64 = 0x1234567890abcdef;
        let mut next = || -> u64 {
            state ^= state << 13;
            state ^= state >> 7;
            state ^= state << 17;
            state
        };

        let mut piece = [[[0u64; 64]; 6]; 2];
        for c in 0..2 {
            for pt in 0..6 {
                for sq in 0..64 {
                    piece[c][pt][sq] = next();
                }
            }
        }

        let side = next();
        let castling = [next(), next(), next(), next()];
        let ep = [
            next(),
            next(),
            next(),
            next(),
            next(),
            next(),
            next(),
            next(),
        ];

        ZobristKeys {
            piece,
            side,
            castling,
            ep,
        }
    })
}

impl Position {
    pub fn zobrist_hash(&self) -> u64 {
        let z = get_zobrist();
        let mut h: u64 = 0;

        for rank in 0..8 {
            for file in 0..8 {
                if let Some(piece) = self.board[rank][file] {
                    let c = piece.color.index();
                    let pt = piece.piece_type as usize;
                    h ^= z.piece[c][pt][rank * 8 + file];
                }
            }
        }

        if self.side_to_move == Color::Black {
            h ^= z.side;
        }

        if self.castling.white_king_side {
            h ^= z.castling[0];
        }
        if self.castling.white_queen_side {
            h ^= z.castling[1];
        }
        if self.castling.black_king_side {
            h ^= z.castling[2];
        }
        if self.castling.black_queen_side {
            h ^= z.castling[3];
        }

        if let Some(ep) = self.en_passant {
            h ^= z.ep[ep.file as usize];
        }

        h
    }
}
