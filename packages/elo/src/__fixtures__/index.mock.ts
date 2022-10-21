import { Result } from '../index.enums';

export const testCases = [
  ['', 1600, 1600, 1600, 1600],
  [Result.WIN, 1600, 1600, 1616, 1584],
  [Result.DRAW, 1600, 1600, 1600, 1600],
  [Result.LOSE, 1600, 1600, 1584, 1616],
];
