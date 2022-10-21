import { Result } from './index.enums';
import { EloResponse } from './types';

const CHANCES = Object.freeze({
  lost: 0,
  tied: 0.5,
  won: 1,
});

// lol magic http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
const MAGIC = 400;

// http://en.wikipedia.org/wiki/Elo_rating_system#Most_accurate_K-factor
// USCF k-factors
const DEFAULT_KFACTOR = 32;

const getKFactor = (rating: number): number => {
  if (rating <= 2100) {
    return DEFAULT_KFACTOR;
  } else if (2100 < rating && rating <= 2400) {
    return 24;
  } else {
    return 16;
  }
};

const calculateOdds = (rating: number, opponentRating: number) => {
  const difference: number = opponentRating - rating;
  return 1 / (1 + Math.pow(10, difference / MAGIC));
};

const processRating = (
  odds: number,
  actualScore: number,
  previousRating: number
) => {
  const difference = actualScore - odds;
  const previousKFactor = getKFactor(previousRating);
  return Math.round(previousRating + previousKFactor * difference);
};

export const ifWins = (rating: number, opponentRating: number) => {
  const odds = calculateOdds(rating, opponentRating);
  return processRating(odds, CHANCES.won, rating);
};

export const ifDraws = (rating: number, opponentRating: number) => {
  const odds = calculateOdds(rating, opponentRating);
  return processRating(odds, CHANCES.tied, rating);
};

export const ifLoses = (rating: number, opponentRating: number) => {
  const odds = calculateOdds(rating, opponentRating);
  return processRating(odds, CHANCES.lost, rating);
};

export const calculate = ({
  result,
  playerRating,
  opponentRating,
}: {
  result: Result;
  playerRating: number;
  opponentRating: number;
}): EloResponse => {
  if (result === Result.WIN) {
    const newPlayerRating = ifWins(playerRating, opponentRating);
    const newOpponentRating = ifLoses(opponentRating, playerRating);
    return { newPlayerRating, newOpponentRating };
  }
  if (result === Result.DRAW) {
    const newPlayerRating = ifDraws(playerRating, opponentRating);
    const newOpponentRating = ifDraws(opponentRating, playerRating);
    return { newPlayerRating, newOpponentRating };
  }
  if (result === Result.LOSE) {
    const newPlayerRating = ifLoses(playerRating, opponentRating);
    const newOpponentRating = ifWins(opponentRating, playerRating);
    return { newPlayerRating, newOpponentRating };
  }
  return { newPlayerRating: playerRating, newOpponentRating: opponentRating };
};
