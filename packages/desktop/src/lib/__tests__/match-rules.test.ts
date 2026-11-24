import {
  neededSetWins,
  countSetWins,
  getAggregateScores,
  resolveMatchResult,
  getMatchPoints,
  formatMatchScore,
} from '@/lib/match-rules';
import type { Match } from '@/types';

const baseMatch = (overrides: Partial<Match> = {}): Match => ({
  id: 'm1',
  tournamentId: 't1',
  round: 1,
  participant1Id: 'a',
  participant2Id: 'b',
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
  ...overrides,
});

describe('neededSetWins', () => {
  it.each([
    [1, 1],
    [3, 2],
    [5, 3],
  ])('returns %i for a best-of-%i', (bestOf, expected) => {
    expect(neededSetWins(bestOf as 1 | 3 | 5)).toBe(expected);
  });
});

describe('countSetWins', () => {
  it('counts each participant set wins', () => {
    expect(
      countSetWins([
        { p1Score: 11, p2Score: 7 },
        { p1Score: 9, p2Score: 11 },
        { p1Score: 11, p2Score: 5 },
      ])
    ).toEqual({ p1Wins: 2, p2Wins: 1 });
  });

  it('ignores tied sets', () => {
    expect(countSetWins([{ p1Score: 11, p2Score: 11 }])).toEqual({
      p1Wins: 0,
      p2Wins: 0,
    });
  });
});

describe('getAggregateScores', () => {
  it('prefers set wins over direct scores', () => {
    const match = baseMatch({
      sets: [
        { p1Score: 11, p2Score: 7 },
        { p1Score: 7, p2Score: 11 },
        { p1Score: 11, p2Score: 4 },
      ],
      participant1Score: 3,
      participant2Score: 1,
    });
    expect(getAggregateScores(match)).toEqual({ p1Score: 2, p2Score: 1 });
  });

  it('falls back to direct scores when no sets exist', () => {
    const match = baseMatch({ participant1Score: 4, participant2Score: 2 });
    expect(getAggregateScores(match)).toEqual({ p1Score: 4, p2Score: 2 });
  });
});

describe('resolveMatchResult', () => {
  it('derives the winner from set wins', () => {
    const match = baseMatch({
      sets: [
        { p1Score: 11, p2Score: 7 },
        { p1Score: 11, p2Score: 5 },
      ],
    });
    expect(resolveMatchResult(match)).toEqual({
      winnerId: 'a',
      decidedBy: 'sets',
    });
  });

  it('derives the winner from direct scores', () => {
    expect(
      resolveMatchResult(
        baseMatch({ participant1Score: 1, participant2Score: 3 })
      )
    ).toEqual({ winnerId: 'b', decidedBy: 'score' });
  });

  it('returns no winner for a draw without penalties', () => {
    expect(
      resolveMatchResult(
        baseMatch({ participant1Score: 2, participant2Score: 2 })
      )
    ).toEqual({ winnerId: null, decidedBy: null });
  });

  it('decides a draw via penalty shootout', () => {
    const match = baseMatch({
      participant1Score: 1,
      participant2Score: 1,
      penaltyScore1: 4,
      penaltyScore2: 5,
    });
    expect(
      resolveMatchResult(match, { scoringRule: 'penalty-shootout' })
    ).toEqual({ winnerId: 'b', decidedBy: 'penalties' });
  });

  it('does not decide penalties for non-penalty scoring rules', () => {
    const match = baseMatch({
      participant1Score: 1,
      participant2Score: 1,
      penaltyScore1: 4,
      penaltyScore2: 5,
    });
    expect(resolveMatchResult(match, { scoringRule: 'standard' })).toEqual({
      winnerId: null,
      decidedBy: null,
    });
  });

  it('returns no winner when scores are missing', () => {
    expect(resolveMatchResult(baseMatch())).toEqual({
      winnerId: null,
      decidedBy: null,
    });
  });
});

describe('getMatchPoints', () => {
  it('awards three for a clean set win and zero to the loser', () => {
    const match = baseMatch({
      status: 'completed',
      sets: [
        { p1Score: 11, p2Score: 5 },
        { p1Score: 11, p2Score: 9 },
      ],
    });
    expect(getMatchPoints(match, 'a', { scoringRule: 'sets' })).toBe(3);
    expect(getMatchPoints(match, 'b', { scoringRule: 'sets' })).toBe(0);
  });

  it('awards two for a three-set win and one to the loser', () => {
    const match = baseMatch({
      status: 'completed',
      sets: [
        { p1Score: 11, p2Score: 9 },
        { p1Score: 7, p2Score: 11 },
        { p1Score: 11, p2Score: 8 },
      ],
    });
    expect(getMatchPoints(match, 'a', { scoringRule: 'sets' })).toBe(2);
    expect(getMatchPoints(match, 'b', { scoringRule: 'sets' })).toBe(1);
  });

  it('awards three for a standard win and one for a draw', () => {
    const match = baseMatch({
      status: 'completed',
      participant1Score: 2,
      participant2Score: 1,
    });
    expect(getMatchPoints(match, 'a')).toBe(3);
    expect(getMatchPoints(match, 'b')).toBe(0);

    const draw = baseMatch({
      status: 'completed',
      participant1Score: 1,
      participant2Score: 1,
    });
    expect(getMatchPoints(draw, 'a')).toBe(1);
    expect(getMatchPoints(draw, 'b')).toBe(1);
  });

  it('awards full points to the penalty shootout winner', () => {
    const match = baseMatch({
      status: 'completed',
      participant1Score: 1,
      participant2Score: 1,
      penaltyScore1: 3,
      penaltyScore2: 4,
      winnerId: 'b',
    });
    expect(
      getMatchPoints(match, 'b', { scoringRule: 'penalty-shootout' })
    ).toBe(3);
    expect(
      getMatchPoints(match, 'a', { scoringRule: 'penalty-shootout' })
    ).toBe(0);
  });

  it('awards points for a walkover winner and none to the forfeiting player', () => {
    const match = baseMatch({
      status: 'walkover',
      winnerId: 'a',
    });
    expect(getMatchPoints(match, 'a')).toBe(3);
    expect(getMatchPoints(match, 'b')).toBe(0);
  });
});

describe('formatMatchScore', () => {
  it('shows W/O for walkovers', () => {
    expect(
      formatMatchScore(baseMatch({ status: 'walkover', winnerId: 'a' }))
    ).toEqual({ main: 'W/O' });
  });

  it('shows a dash when there is no result', () => {
    expect(formatMatchScore(baseMatch())).toEqual({ main: '-' });
  });

  it('shows aggregate and per-set detail', () => {
    const match = baseMatch({
      sets: [
        { p1Score: 11, p2Score: 7 },
        { p1Score: 7, p2Score: 11 },
        { p1Score: 11, p2Score: 5 },
      ],
    });
    expect(formatMatchScore(match)).toEqual({
      main: '2 : 1',
      detail: '11-7, 7-11, 11-5',
    });
  });

  it('shows penalty detail', () => {
    const match = baseMatch({
      participant1Score: 1,
      participant2Score: 1,
      penaltyScore1: 4,
      penaltyScore2: 5,
    });
    expect(formatMatchScore(match)).toEqual({
      main: '1 : 1',
      detail: 'P 4-5',
    });
  });
});
