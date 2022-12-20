#include <math.h>
#include <stdio.h>

// lol magic http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
const float MAGIC = 400;

// http://en.wikipedia.org/wiki/Elo_rating_system#Most_accurate_K-factor
// USCF k-factors
const int DEFAULT_KFACTOR = 32;

const float WON_SCORE = 1;
const float DRAWN_SCORE = 0.5;
const float LOST_SCORE = 0;

const char WON = 'W';
const char DRAWN = 'D';
const char LOST = 'L';

int getKFactor(int rating) {
  if (rating <= 2100) {
		return DEFAULT_KFACTOR;
	} else if (2100 < rating && rating <= 2400) {
		return 24;
	} else {
		return 16;
	}
}

float calculateOdds(int rating, int opponentRating) {
	int difference = opponentRating - rating;
	return 1 / (1 + pow(10, difference / MAGIC));
}

float processRating(
	float odds,
	float actualScore,
	float previousRating
) {
	float difference = actualScore - odds;
	int previousKFactor = getKFactor(previousRating);
	return round(previousRating + previousKFactor * difference);
}

float ifWins(float rating, float opponentRating) {
	float odds = calculateOdds(rating, opponentRating);
	return processRating(odds, WON_SCORE, rating);
}

float ifDraws(float rating, float opponentRating) {
	float odds = calculateOdds(rating, opponentRating);
	return processRating(odds, DRAWN_SCORE, rating);
}

float ifLoses(float rating, float opponentRating) {
	float odds = calculateOdds(rating, opponentRating);
	return processRating(odds, LOST_SCORE, rating);
}

typedef struct {
    int playerRating;
    int opponentRating;
    char result;
} eloOptions;

typedef struct {
    int newPlayerRating;
    int newOpponentRating;
} eloResult;

eloResult calculate(eloOptions options) {
	eloResult result;
  result.newPlayerRating = options.playerRating;
  result.newOpponentRating = options.opponentRating;

	if (options.result == WON) {
		result.newPlayerRating = ifWins(options.playerRating, options.opponentRating);
		result.newOpponentRating = ifLoses(options.opponentRating, options.playerRating);
	} else if (options.result == DRAWN) {
		result.newPlayerRating = ifDraws(options.playerRating, options.opponentRating);
		result.newOpponentRating = ifDraws(options.opponentRating, options.playerRating);
	} else if (options.result == LOST) {
		result.newPlayerRating = ifLoses(options.playerRating, options.opponentRating);
		result.newOpponentRating = ifWins(options.opponentRating, options.playerRating);
	}
	return result;
}

int main() {
  // Won
  eloOptions wonOptions;
  wonOptions.opponentRating = 1600;
  wonOptions.playerRating = 1600;
  wonOptions.result = WON;
  eloResult wonResult = calculate(wonOptions);
  printf("%s %d\n", "WON", wonResult.newPlayerRating);
  printf("%s %d\n", "WON", wonResult.newOpponentRating);
  // Drawn
  eloOptions drawnOptions;
  drawnOptions.opponentRating = 1600;
  drawnOptions.playerRating = 1600;
  drawnOptions.result = DRAWN;
  eloResult drawnResult = calculate(drawnOptions);
  printf("%s %d\n", "DRAWN", drawnResult.newPlayerRating);
  printf("%s %d\n", "DRAWN", drawnResult.newOpponentRating);
  // Lost
  eloOptions lostOptions;
  lostOptions.opponentRating = 1600;
  lostOptions.playerRating = 1600;
  lostOptions.result = LOST;
  eloResult lostResult = calculate(lostOptions);
  printf("%s %d\n", "LOST", lostResult.newPlayerRating);
  printf("%s %d\n", "LOST", lostResult.newOpponentRating);
  return 0;
}
