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
    Drop,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Move {
    pub from: Square,
    pub to: Square,
    pub promotion: Option<PieceType>,
    pub flags: MoveType,
    pub drop: Option<PieceType>,
}

impl Move {
    pub fn new(from: Square, to: Square) -> Self {
        Move {
            from,
            to,
            promotion: None,
            flags: MoveType::Quiet,
            drop: None,
        }
    }

    pub fn capture(from: Square, to: Square) -> Self {
        Move {
            from,
            to,
            promotion: None,
            flags: MoveType::Capture,
            drop: None,
        }
    }

    pub fn drop(to: Square, piece: PieceType) -> Self {
        Move {
            from: to,
            to,
            promotion: None,
            flags: MoveType::Drop,
            drop: Some(piece),
        }
    }

    pub fn drop_letter(piece: PieceType) -> char {
        match piece {
            PieceType::Pawn => 'P',
            PieceType::Knight => 'N',
            PieceType::Bishop => 'B',
            PieceType::Rook => 'R',
            PieceType::Queen => 'Q',
            PieceType::King => 'K',
        }
    }

    pub fn to_san(self) -> String {
        if let Some(piece) = self.drop {
            format!("{}@{}", Self::drop_letter(piece), self.to.to_san())
        } else {
            format!("{}{}", self.from.to_san(), self.to.to_san())
        }
    }

    pub fn to_uci(self) -> String {
        if let Some(piece) = self.drop {
            return format!("{}@{}", Self::drop_letter(piece), self.to.to_san());
        }
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
