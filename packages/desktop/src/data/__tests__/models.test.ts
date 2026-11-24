import {
  generateId,
  createTournament,
  createParticipant,
  createMatch,
  calculateStandings,
} from '@/data/models';
import type { Match } from '@/types';

describe('generateId', () => {
  it('returns a timestamp-prefixed id', () => {
    expect(generateId()).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('createTournament', () => {
  it('adds id, createdAt, and updatedAt', () => {
    const tournament = createTournament({
      name: 'Cup',
      description: '',
      format: 'round-robin',
      status: 'draft',
      maxParticipants: 8,
    });
    expect(tournament).toMatchObject({
      name: 'Cup',
      format: 'round-robin',
      status: 'draft',
      maxParticipants: 8,
    });
    expect(tournament.id).toMatch(/^\d+-[a-z0-9]+$/);
    expect(tournament.createdAt).toEqual(expect.any(Number));
    expect(tournament.updatedAt).toEqual(expect.any(Number));
  });
});

describe('createParticipant', () => {
  it('adds an id', () => {
    const participant = createParticipant({
      tournamentId: 't1',
      name: 'Alice',
      seed: 1,
    });
    expect(participant).toMatchObject({
      tournamentId: 't1',
      name: 'Alice',
      seed: 1,
    });
    expect(participant.id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('createMatch', () => {
  it('adds an id', () => {
    const match = createMatch({
      tournamentId: 't1',
      round: 1,
      participant1Id: 'a',
      participant2Id: 'b',
      participant1Score: null,
      participant2Score: null,
      winnerId: null,
      status: 'scheduled',
    });
    expect(match.tournamentId).toBe('t1');
    expect(match.id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('calculateStandings', () => {
  const completed = (
    id: string,
    p1: string,
    p2: string,
    s1: number,
    s2: number,
    winner: string | null
  ): Match => ({
    id,
    tournamentId: 't1',
    round: 1,
    participant1Id: p1,
    participant2Id: p2,
    participant1Score: s1,
    participant2Score: s2,
    winnerId: winner,
    status: 'completed',
  });

  it('initializes zeroed standings for every participant', () => {
    const standings = calculateStandings([], ['a', 'b']);
    expect(standings).toHaveLength(2);
    expect(standings[0]).toMatchObject({
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
    });
  });

  it('awards three points for a win', () => {
    const standings = calculateStandings(
      [completed('m1', 'a', 'b', 2, 1, 'a')],
      ['a', 'b']
    );
    expect(standings.find((s) => s.participantId === 'a')).toMatchObject({
      played: 1,
      won: 1,
      lost: 0,
      points: 3,
    });
    expect(standings.find((s) => s.participantId === 'b')).toMatchObject({
      played: 1,
      lost: 1,
      points: 0,
    });
  });

  it('counts a draw when scores are equal', () => {
    const standings = calculateStandings(
      [completed('m1', 'a', 'b', 1, 1, 'a')],
      ['a', 'b']
    );
    expect(standings.find((s) => s.participantId === 'a')).toMatchObject({
      drawn: 1,
      points: 1,
    });
    expect(standings.find((s) => s.participantId === 'b')).toMatchObject({
      drawn: 1,
      points: 1,
    });
  });

  it('ignores non-completed and winnerless matches', () => {
    const matches = [
      { ...completed('m1', 'a', 'b', 2, 1, 'a'), status: 'scheduled' as const },
      completed('m2', 'a', 'b', 1, 1, null),
    ];
    const standings = calculateStandings(matches, ['a', 'b']);
    expect(standings.every((s) => s.played === 0)).toBe(true);
  });

  it('ignores matches involving participants outside the standings', () => {
    const standings = calculateStandings(
      [completed('m1', 'x', 'b', 2, 1, 'x')],
      ['a', 'b']
    );
    expect(standings.find((s) => s.participantId === 'b')!.played).toBe(0);
  });

  it('awards three points when the second participant wins', () => {
    const standings = calculateStandings(
      [completed('m1', 'a', 'b', 1, 2, 'b')],
      ['a', 'b']
    );
    expect(standings.find((s) => s.participantId === 'b')).toMatchObject({
      played: 1,
      won: 1,
      points: 3,
    });
    expect(standings.find((s) => s.participantId === 'a')).toMatchObject({
      lost: 1,
    });
  });

  it('sorts by points then wins and assigns positions', () => {
    const matches = [
      completed('m1', 'a', 'b', 2, 0, 'a'),
      completed('m2', 'c', 'd', 1, 0, 'c'),
    ];
    const standings = calculateStandings(matches, ['a', 'b', 'c', 'd']);
    expect(standings.map((s) => s.participantId)).toEqual(['a', 'c', 'b', 'd']);
    expect(standings.map((s) => s.position)).toEqual([1, 2, 3, 4]);
  });
});
