import React, { ReactNode } from 'react';

export enum Color {
  DARK = 'dark',
  LIGHT = 'light',
  TRANSPARENT = 'transparent',
}

const bgColors: Record<Color, string> = {
  [Color.DARK]: 'bg-gray-600',
  [Color.LIGHT]: 'bg-gray-400',
  [Color.TRANSPARENT]: 'bg-transparent',
};

export type SquareProps = { color?: Color; children?: ReactNode };

const Square: React.FC<SquareProps> = ({
  color = Color.TRANSPARENT,
  children = '',
}) => {
  const bgColor: string = bgColors[color];
  return <div className={`w-full aspect-square ${bgColor}`}>{children}</div>;
};

Square.displayName = 'Square';

export default Square;
