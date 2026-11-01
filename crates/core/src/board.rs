use crate::color::Color;
use crate::square::Square;
use crate::Position;

pub struct Board {
    pub position: Position,
}

impl Board {
    pub fn new() -> Self {
        Board {
            position: Position::standard(),
        }
    }

    pub fn standard() -> Self {
        Board::new()
    }

    pub fn get_piece(&self, square: Square) -> Option<crate::Piece> {
        self.position.get_piece(square)
    }

    pub fn side_to_move(&self) -> Color {
        self.position.side_to_move
    }

    pub fn is_in_check(&self, color: Color) -> bool {
        self.position.is_in_check(color)
    }

    pub fn to_fen(&self) -> String {
        let mut fen = String::new();
        for rank in (0..8).rev() {
            let mut empty_count = 0;
            for file in 0..8 {
                let sq = Square::new(file, rank).unwrap();
                match self.position.get_piece(sq) {
                    Some(piece) => {
                        if empty_count > 0 {
                            fen.push_str(&empty_count.to_string());
                            empty_count = 0;
                        }
                        fen.push(piece.symbol());
                    }
                    None => {
                        empty_count += 1;
                    }
                }
            }
            if empty_count > 0 {
                fen.push_str(&empty_count.to_string());
            }
            if rank > 0 {
                fen.push('/');
            }
        }
        fen.push(' ');
        fen.push(match self.position.side_to_move {
            Color::White => 'w',
            Color::Black => 'b',
        });
        fen.push(' ');
        let mut castling = String::new();
        if self.position.castling.white_king_side {
            castling.push('K');
        }
        if self.position.castling.white_queen_side {
            castling.push('Q');
        }
        if self.position.castling.black_king_side {
            castling.push('k');
        }
        if self.position.castling.black_queen_side {
            castling.push('q');
        }
        if castling.is_empty() {
            castling.push('-');
        }
        fen.push_str(&castling);
        fen.push(' ');
        match self.position.en_passant {
            Some(sq) => fen.push_str(&sq.to_san()),
            None => fen.push('-'),
        }
        fen.push(' ');
        fen.push_str(&self.position.halfmove_clock.to_string());
        fen.push(' ');
        fen.push_str(&self.position.fullmove_number.to_string());
        fen
    }
}

impl Default for Board {
    fn default() -> Self {
        Board::new()
    }
}
