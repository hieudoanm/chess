import { calculateAnalytics, predictStandings } from '@/lib/analytics';
import type { Tournament, Match, Participant } from '@/types';

const tournament: Tournament = {
  id: 't1',
  name: 'Cup',
  description: '',
  format: 'single-elimination',
  status: 'completed',
  maxParticipants: 8,
  createdAt: 0,
  updatedAt: 0,
};

const participant = (id: string, seed?: number): Participant => ({
  id,
  tournamentId: 't1',
  name: id,
  seed,
});

const match = (
  id: string,
  round: number,
  p1: string,
  p2: string,
  s1: number | null,
  s2: number | null,
  winner: string | null,
  status: Match['status'] = 'completed'
): Match => ({
  id,
  tournamentId: 't1',
  round,
  participant1Id: p1,
  participant2Id: p2,
  participant1Score: s1,
  participant2Score: s2,
  winnerId: winner,
  status,
});

describe('calculateAnalytics', () => {
  it('counts total and completed matches', () => {
    const analytics = calculateAnalytics(
      tournament,
      [
        match('m1', 1, 'a', 'b', 2, 1, 'a'),
        match('m2', 1, 'c', 'd', null, null, null, 'scheduled'),
      ],
      []
    );
    expect(analytics.totalMatches).toBe(2);
    expect(analytics.completedMatches).toBe(1);
    expect(analytics.averageMatchDuration).toBe(30);
  });

  it('ignores matches from other tournaments', () => {
    const other = {
      ...match('m3', 1, 'a', 'b', 2, 1, 'a'),
      tournamentId: 't2',
    };
    const analytics = calculateAnalytics(tournament, [other], []);
    expect(analytics.totalMatches).toBe(0);
  });

  it('counts upsets when a lower seed beats a higher seed', () => {
    const matches = [
      match('m1', 1, 'a', 'b', 2, 1, 'a'),
      match('m2', 1, 'c', 'd', 2, 1, 'd'),
    ];
    const participants = [
      participant('a', 1),
      participant('b', 2),
      participant('c', 1),
      participant('d', 2),
    ];
    const analytics = calculateAnalytics(tournament, matches, participants);
    expect(analytics.upsets).toBe(1);
  });

  it('skips upset counting for null scores, no winner, or missing seeds', () => {
    const matches = [
      match('m1', 1, 'a', 'b', null, null, 'a'),
      match('m2', 1, 'c', 'd', 2, 1, null),
      match('m3', 1, 'e', 'f', 2, 1, 'f'),
    ];
    const participants = [
      participant('a', 2),
      participant('b', 1),
      participant('c', 2),
      participant('d', 1),
      participant('e', 2),
      participant('f', 2),
    ];
    const analytics = calculateAnalytics(tournament, matches, participants);
    expect(analytics.upsets).toBe(0);
  });

  it('finds the five closest matches', () => {
    const matches = [
      match('close1', 1, 'a', 'b', 1, 1, null),
      match('close2', 1, 'c', 'd', 2, 1, 'c'),
      match('blowout', 1, 'e', 'f', 5, 0, 'e'),
      match('close3', 1, 'g', 'h', 3, 2, 'g'),
      match('close4', 1, 'i', 'j', 4, 3, 'i'),
      match('close5', 1, 'k', 'l', 5, 4, 'k'),
      match('close6', 1, 'm', 'n', 6, 5, 'm'),
    ];
    const analytics = calculateAnalytics(tournament, matches, []);
    expect(analytics.closestMatches[0].id).toBe('close1');
    expect(analytics.closestMatches).toHaveLength(5);
    expect(analytics.closestMatches.some((m) => m.id === 'blowout')).toBe(
      false
    );
  });

  it('computes the longest win streak', () => {
    const matches = [
      match('m1', 1, 'a', 'b', 2, 1, 'a'),
      match('m2', 2, 'a', 'c', 2, 1, 'a'),
      match('m3', 3, 'a', 'd', 2, 1, 'd'),
    ];
    const analytics = calculateAnalytics(tournament, matches, []);
    expect(analytics.longestWinStreak).toEqual({
      participantId: 'a',
      streak: 2,
    });
  });

  it('returns an empty streak when no matches have winners', () => {
    const analytics = calculateAnalytics(
      tournament,
      [match('m1', 1, 'a', 'b', null, null, null)],
      []
    );
    expect(analytics.longestWinStreak).toEqual({
      participantId: '',
      streak: 0,
    });
  });

  it('finds the top scorer', () => {
    const matches = [
      match('m1', 1, 'a', 'b', 3, 1, 'a'),
      match('m2', 2, 'a', 'c', 2, 2, null),
    ];
    const analytics = calculateAnalytics(tournament, matches, []);
    expect(analytics.topScorer).toEqual({ participantId: 'a', totalScore: 5 });
  });

  it('returns an empty top scorer when nothing is scored', () => {
    const analytics = calculateAnalytics(tournament, [], []);
    expect(analytics.topScorer).toEqual({ participantId: '', totalScore: 0 });
  });

  it('ignores participants from other tournaments when building the map', () => {
    const analytics = calculateAnalytics(
      tournament,
      [match('m1', 1, 'a', 'b', 2, 1, 'a')],
      [
        { ...participant('a', 2), tournamentId: 't2' },
        { ...participant('b', 1), tournamentId: 't2' },
      ]
    );
    expect(analytics.upsets).toBe(0);
  });

  it('skips upset counting when a participant is missing or has no seed', () => {
    const matches = [
      match('m1', 1, 'a', 'ghost', 2, 1, 'a'),
      match('m2', 1, 'c', 'd', 2, 1, 'd'),
    ];
    const participants = [
      participant('a', 1),
      participant('c', 2),
      participant('d'),
    ];
    const analytics = calculateAnalytics(tournament, matches, participants);
    expect(analytics.upsets).toBe(0);
  });

  it('skips null participant ids when computing streaks', () => {
    const analytics = calculateAnalytics(
      tournament,
      [{ ...match('m1', 1, 'a', 'b', 2, 1, 'a'), participant2Id: null }],
      []
    );
    expect(analytics.longestWinStreak).toEqual({
      participantId: 'a',
      streak: 1,
    });
  });
});

describe('predictStandings', () => {
  it('computes points from completed matches and max possible points', () => {
    const matches = [
      match('m1', 1, 'a', 'b', 2, 1, 'a'),
      match('m2', 2, 'a', 'c', 1, 1, null),
      match('m3', 3, 'a', 'd', null, null, null, 'scheduled'),
    ];
    const predictions = predictStandings(matches, ['a', 'b', 'c', 'd'], 't1');
    const a = predictions.find((p) => p.participantId === 'a')!;
    expect(a.currentPoints).toBe(4);
    expect(a.maxPossiblePoints).toBe(7);
    expect(a.scenarios).toEqual({ wins: 1, draws: 0, losses: 0 });
  });

  it('ignores matches from other tournaments', () => {
    const other = {
      ...match('m1', 1, 'a', 'b', 2, 1, 'a'),
      tournamentId: 't2',
    };
    const predictions = predictStandings([other], ['a', 'b'], 't1');
    expect(predictions.every((p) => p.currentPoints === 0)).toBe(true);
  });

  it('assigns likely positions by max possible points', () => {
    const matches = [match('m1', 1, 'a', 'b', 2, 1, 'a')];
    const predictions = predictStandings(matches, ['a', 'b'], 't1');
    expect(predictions[0].participantId).toBe('a');
    expect(predictions.map((p) => p.likelyPosition)).toEqual([1, 2]);
  });

  it('awards points when the second participant wins', () => {
    const matches = [match('m1', 1, 'a', 'b', 1, 2, 'b')];
    const predictions = predictStandings(matches, ['a', 'b'], 't1');
    const b = predictions.find((p) => p.participantId === 'b')!;
    expect(b.currentPoints).toBe(3);
    expect(b.maxPossiblePoints).toBe(3);
  });
});
