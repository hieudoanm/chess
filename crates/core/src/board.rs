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
        crate::notation::to_fen(&self.position)
    }
}

impl Default for Board {
    fn default() -> Self {
        Board::new()
    }
}
