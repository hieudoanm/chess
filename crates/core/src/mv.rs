use crate::piece::PieceType;
use crate::square::Square;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum MoveType {
    Quiet,
    Capture,
    EnPassant,
    CastleKingSide,
    CastleQueenSide,
    PawnDoublePush,
    PawnPromotionKnight,
    PawnPromotionBishop,
    PawnPromotionRook,
    PawnPromotionQueen,
    PawnCapturePromotionKnight,
    PawnCapturePromotionBishop,
    PawnCapturePromotionRook,
    PawnCapturePromotionQueen,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Move {
    pub from: Square,
    pub to: Square,
    pub promotion: Option<PieceType>,
    pub flags: MoveType,
}

impl Move {
    pub fn new(from: Square, to: Square) -> Self {
        Move {
            from,
            to,
            promotion: None,
            flags: MoveType::Quiet,
        }
    }

    pub fn capture(from: Square, to: Square) -> Self {
        Move {
            from,
            to,
            promotion: None,
            flags: MoveType::Capture,
        }
    }

    pub fn to_san(self) -> String {
        format!("{}{}", self.from.to_san(), self.to.to_san())
    }

    pub fn to_uci(self) -> String {
        let promo = match self.promotion {
            Some(p) => match p {
                crate::piece::PieceType::Queen => "q",
                crate::piece::PieceType::Rook => "r",
                crate::piece::PieceType::Bishop => "b",
                crate::piece::PieceType::Knight => "n",
                _ => "",
            },
            None => "",
        };
        format!("{}{}{}", self.from.to_san(), self.to.to_san(), promo)
    }
}

impl std::fmt::Display for Move {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.to_san())
    }
}
