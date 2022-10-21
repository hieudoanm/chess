import useEffectOnce from '@hieudoanm/use-effect-once';
import React, { useState } from 'react';
import { Coordinate, COORDINATES, Piece, Side } from '../../../constants';
import { useSocket } from '../../../contexts/SocketContext';
import Background from '../../molecules/Background';
import Game from '../../molecules/Coordinates';
import File from '../../molecules/File';
import Rank from '../../molecules/Rank';

type BoardProps = { id: string };

const Board: React.FC<BoardProps> = ({ id }) => {
  const socket = useSocket();

  const [boardState, setBoardState] = useState<{
    coordinates: Record<string, Coordinate>;
    currentSide: Side;
    fromCoordinate: {
      square?: string | '';
      piece?: Piece | '';
      side?: Side | '';
    };
  }>({ coordinates: COORDINATES, currentSide: Side.WHITE, fromCoordinate: {} });

  useEffectOnce(() => {
    if (socket && socket.connected) {
      socket.on('move', (socketId: string, boardState) => {
        if (socketId !== socket.id) setBoardState(boardState);
      });
    }
  });

  const movePiece = (square: string, piece: Piece | '', side: Side | '') => {
    const { coordinates, currentSide, fromCoordinate } = boardState;
    if (piece && side === currentSide) {
      setBoardState({ ...boardState, fromCoordinate: { square, piece, side } });
    }

    const isEmptySquare = !piece;
    const oppositePiece = piece && side !== currentSide;
    if (
      (isEmptySquare || oppositePiece) &&
      Object.keys(fromCoordinate).length > 0
    ) {
      const {
        square: fromSquare = '',
        piece: fromPiece,
        side: fromSide,
      } = fromCoordinate;
      const updatedCoordinates = {
        ...coordinates,
        [square]: { piece: fromPiece, side: fromSide } as Coordinate,
        [fromSquare]: { piece: '', side: '' } as Coordinate,
      };

      const updatedSide = currentSide === Side.WHITE ? Side.BLACK : Side.WHITE;

      socket.emit('move', id, {
        coordinates: updatedCoordinates,
        currentSide: updatedSide,
        fromCoordinate: {},
      });

      setBoardState({
        coordinates: updatedCoordinates,
        currentSide: updatedSide,
        fromCoordinate: {},
      });
    }
  };

  return (
    <div>
      <div className="w-96 h-16 flex items-center justify-between">
        <div className="w-16 h-8 bg-black text-white text-center leading-8">
          Black
        </div>
        <div className="w-24 h-8 bg-black text-white text-center leading-8">
          00:00:00
        </div>
      </div>
      <div className="relative w-96 h-96 mx-auto">
        <div className="absolute top-0 left-0 w-96 h-96 z-10">
          <Game coordinates={boardState.coordinates} movePiece={movePiece} />
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 z-0">
          <Background />
        </div>
        <div className="absolute top-0 left-0 z-0">
          <Rank />
        </div>
        <div className="absolute left-0 bottom-0 z-0">
          <File />
        </div>
      </div>
      <div className="w-96 h-16 flex items-center justify-between">
        <div className="w-16 h-8 bg-black text-black bg-white border border-black text-center leading-8">
          White
        </div>
        <div className="w-24 h-8 bg-black text-black bg-white border border-black text-center leading-8">
          00:00:00
        </div>
      </div>
    </div>
  );
};

Board.displayName = 'Board';

export default Board;
