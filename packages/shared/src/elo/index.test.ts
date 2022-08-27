import { calculate } from '.';
import { Result } from './index.enums';
import { testCases } from './__fixtures__/index.mock';

describe('elo', () => {
  test.each(testCases)(
    'when a %d plays against %d',
    (
      result,
      playerRating,
      opponentRating,
      expectedNewPlayerRating,
      expectedNewOpponentRating
    ) => {
      const { newPlayerRating, newOpponentRating } = calculate({
        result: result as Result,
        playerRating: playerRating as number,
        opponentRating: opponentRating as number,
      });

      expect({ newPlayerRating, newOpponentRating }).toEqual({
        newPlayerRating: expectedNewPlayerRating,
        newOpponentRating: expectedNewOpponentRating,
      });
    }
  );
});
