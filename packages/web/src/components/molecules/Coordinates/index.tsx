import React, { useState } from 'react';
import {
  Coordinate,
  COORDINATES,
  Piece,
  Side,
  SQUARES,
} from '../../../constants';
import Square from '../../atoms/Square';
import PieceIcon from '../PieceIcon';

type CoordinatesProps = {
  coordinates: Record<string, Coordinate>;
  movePiece: (square: string, piece: Piece | '', side: Side | '') => void;
};

const Coordinates: React.FC<CoordinatesProps> = ({
  coordinates = COORDINATES,
  movePiece = () => {
    return;
  },
}) => {
  return (
    <div className="w-full grid grid-cols-8 border border-black">
      {SQUARES.map((square) => {
        const { piece, side } = coordinates[square];
        return (
          <Square key={`square-${square}`}>
            <button
              className="w-full h-full flex items-center justify-center"
              onClick={() => {
                movePiece(square, piece, side);
              }}
            >
              <PieceIcon piece={piece} side={side} />
            </button>
          </Square>
        );
      })}
    </div>
  );
};

Coordinates.displayName = 'Coordinates';

export default Coordinates;
