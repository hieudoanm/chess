import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChessKing,
  faChessQueen,
  faChessRook,
  faChessBishop,
  faChessKnight,
  faChessPawn,
} from '@fortawesome/free-solid-svg-icons';
import { Piece, Side } from '../../../constants';

const pieceIcons: Record<Piece, any> = {
  [Piece.KING]: faChessKing,
  [Piece.QUEEN]: faChessQueen,
  [Piece.ROOK_A]: faChessRook,
  [Piece.ROOK_H]: faChessRook,
  [Piece.BISHOP_DARK]: faChessBishop,
  [Piece.BISHOP_LIGHT]: faChessBishop,
  [Piece.KNIGHT_B]: faChessKnight,
  [Piece.KNIGHT_G]: faChessKnight,
  [Piece.PAWN_A]: faChessPawn,
  [Piece.PAWN_B]: faChessPawn,
  [Piece.PAWN_C]: faChessPawn,
  [Piece.PAWN_D]: faChessPawn,
  [Piece.PAWN_E]: faChessPawn,
  [Piece.PAWN_F]: faChessPawn,
  [Piece.PAWN_G]: faChessPawn,
  [Piece.PAWN_H]: faChessPawn,
};

const PieceIcon: React.FC<{ piece: Piece | ''; side: Side | '' }> = ({
  piece,
  side,
}) => {
  if (!piece || !side) {
    return <></>;
  }

  const textColor = side === Side.WHITE ? 'text-white' : 'text-black';
  const pieceIcon = pieceIcons[piece];
  return <FontAwesomeIcon icon={pieceIcon} size="2x" className={textColor} />;
};

PieceIcon.displayName = 'PieceIcon';

export default PieceIcon;
