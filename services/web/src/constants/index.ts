export const FILES: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS: string[] = ['8', '7', '6', '5', '4', '3', '2', '1'];

export enum Piece {
  KING = 'king',
  QUEEN = 'queen',
  ROOK_A = 'rook-a',
  ROOK_H = 'rook-b',
  BISHOP_DARK = 'bishop-dark',
  BISHOP_LIGHT = 'bishop-light',
  KNIGHT_B = 'knight-b',
  KNIGHT_G = 'knight-g',
  PAWN_A = 'pawn-a',
  PAWN_B = 'pawn-b',
  PAWN_C = 'pawn-c',
  PAWN_D = 'pawn-d',
  PAWN_E = 'pawn-e',
  PAWN_F = 'pawn-f',
  PAWN_G = 'pawn-g',
  PAWN_H = 'pawn-h',
}

export enum Side {
  WHITE = 'white',
  BLACK = 'black',
}

export type Coordinate = {
  piece: Piece | '';
  side: Side | '';
};

export const SQUARES = [
  'a8',
  'b8',
  'c8',
  'd8',
  'e8',
  'f8',
  'g8',
  'h8',
  'a7',
  'b7',
  'c7',
  'd7',
  'e7',
  'f7',
  'g7',
  'h7',
  'a6',
  'b6',
  'c6',
  'd6',
  'e6',
  'f6',
  'g6',
  'h6',
  'a5',
  'b5',
  'c5',
  'd5',
  'e5',
  'f5',
  'g5',
  'h5',
  'a4',
  'b4',
  'c4',
  'd4',
  'e4',
  'f4',
  'g4',
  'h4',
  'a3',
  'b3',
  'c3',
  'd3',
  'e3',
  'f3',
  'g3',
  'h3',
  'a2',
  'b2',
  'c2',
  'd2',
  'e2',
  'f2',
  'g2',
  'h2',
  'a1',
  'b1',
  'c1',
  'd1',
  'e1',
  'f1',
  'g1',
  'h1',
];

export const COORDINATES: Record<string, Coordinate> = {
  a8: { piece: Piece.ROOK_A, side: Side.BLACK },
  b8: { piece: Piece.KNIGHT_B, side: Side.BLACK },
  c8: { piece: Piece.BISHOP_LIGHT, side: Side.BLACK },
  d8: { piece: Piece.QUEEN, side: Side.BLACK },
  e8: { piece: Piece.KING, side: Side.BLACK },
  f8: { piece: Piece.BISHOP_DARK, side: Side.BLACK },
  g8: { piece: Piece.KNIGHT_G, side: Side.BLACK },
  h8: { piece: Piece.ROOK_H, side: Side.BLACK },
  a7: { piece: Piece.PAWN_A, side: Side.BLACK },
  b7: { piece: Piece.PAWN_B, side: Side.BLACK },
  c7: { piece: Piece.PAWN_C, side: Side.BLACK },
  d7: { piece: Piece.PAWN_D, side: Side.BLACK },
  e7: { piece: Piece.PAWN_E, side: Side.BLACK },
  f7: { piece: Piece.PAWN_F, side: Side.BLACK },
  g7: { piece: Piece.PAWN_G, side: Side.BLACK },
  h7: { piece: Piece.PAWN_H, side: Side.BLACK },
  a6: { piece: '', side: '' },
  b6: { piece: '', side: '' },
  c6: { piece: '', side: '' },
  d6: { piece: '', side: '' },
  e6: { piece: '', side: '' },
  f6: { piece: '', side: '' },
  g6: { piece: '', side: '' },
  h6: { piece: '', side: '' },
  a5: { piece: '', side: '' },
  b5: { piece: '', side: '' },
  c5: { piece: '', side: '' },
  d5: { piece: '', side: '' },
  e5: { piece: '', side: '' },
  f5: { piece: '', side: '' },
  g5: { piece: '', side: '' },
  h5: { piece: '', side: '' },
  a4: { piece: '', side: '' },
  b4: { piece: '', side: '' },
  c4: { piece: '', side: '' },
  d4: { piece: '', side: '' },
  e4: { piece: '', side: '' },
  f4: { piece: '', side: '' },
  g4: { piece: '', side: '' },
  h4: { piece: '', side: '' },
  a3: { piece: '', side: '' },
  b3: { piece: '', side: '' },
  c3: { piece: '', side: '' },
  d3: { piece: '', side: '' },
  e3: { piece: '', side: '' },
  f3: { piece: '', side: '' },
  g3: { piece: '', side: '' },
  h3: { piece: '', side: '' },
  a2: { piece: Piece.PAWN_A, side: Side.WHITE },
  b2: { piece: Piece.PAWN_B, side: Side.WHITE },
  c2: { piece: Piece.PAWN_C, side: Side.WHITE },
  d2: { piece: Piece.PAWN_D, side: Side.WHITE },
  e2: { piece: Piece.PAWN_E, side: Side.WHITE },
  f2: { piece: Piece.PAWN_F, side: Side.WHITE },
  g2: { piece: Piece.PAWN_G, side: Side.WHITE },
  h2: { piece: Piece.PAWN_H, side: Side.WHITE },
  a1: { piece: Piece.ROOK_A, side: Side.WHITE },
  b1: { piece: Piece.KNIGHT_B, side: Side.WHITE },
  c1: { piece: Piece.BISHOP_DARK, side: Side.WHITE },
  d1: { piece: Piece.QUEEN, side: Side.WHITE },
  e1: { piece: Piece.KING, side: Side.WHITE },
  f1: { piece: Piece.BISHOP_LIGHT, side: Side.WHITE },
  g1: { piece: Piece.KNIGHT_G, side: Side.WHITE },
  h1: { piece: Piece.ROOK_H, side: Side.WHITE },
};