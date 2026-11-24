import { autoSchedule, detectConflicts, reschedule } from '@/lib/scheduling';
import type { Match } from '@/types';

const match = (id: string, round: number): Match => ({
  id,
  tournamentId: 't1',
  round,
  participant1Id: 'a',
  participant2Id: 'b',
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
});

describe('autoSchedule', () => {
  it('schedules matches round by round across venues', () => {
    const matches = [
      match('m1', 1),
      match('m2', 1),
      match('m3', 2),
      match('m4', 2),
    ];
    const slots = autoSchedule(matches, ['A', 'B'], 30, 1000);
    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({
      matchId: 'm1',
      start: 1000,
      end: 1000 + 30 * 60000,
      venue: 'A',
    });
    expect(slots[1].venue).toBe('B');
    expect(slots[2].start).toBe(1000 + 30 * 60000);
    expect(slots[3].start).toBe(1000 + 30 * 60000);
  });

  it('sorts matches by round then id', () => {
    const matches = [match('z', 2), match('a', 1), match('b', 1)];
    const slots = autoSchedule(matches, [], 30, 0);
    expect(slots.map((s) => s.matchId)).toEqual(['a', 'b', 'z']);
  });

  it('groups matches with a missing round under round zero', () => {
    const noRound = {
      ...match('m1', 1),
      round: undefined as unknown as number,
    };
    const slots = autoSchedule([noRound, match('m2', 1)], [], 30, 0);
    expect(slots).toHaveLength(2);
  });

  it('orders same-round matches by ascending id', () => {
    const matches = [match('z', 1), match('a', 1)];
    const slots = autoSchedule(matches, [], 30, 0);
    expect(slots.map((s) => s.matchId)).toEqual(['a', 'z']);
  });

  it('sequentially schedules when no venues exist', () => {
    const matches = [match('m1', 1), match('m2', 1)];
    const slots = autoSchedule(matches, [], 30, 0);
    expect(slots).toHaveLength(2);
    expect(slots.every((s) => s.venue === undefined)).toBe(true);
    expect(slots[1].start).toBe(30 * 60000);
  });
});

describe('detectConflicts', () => {
  it('detects overlapping slots at the same venue', () => {
    const slots = [
      { matchId: 'm1', start: 0, end: 100, venue: 'A' },
      { matchId: 'm2', start: 50, end: 150, venue: 'A' },
    ];
    expect(detectConflicts(slots)).toHaveLength(1);
  });

  it('ignores overlapping slots at different venues', () => {
    const slots = [
      { matchId: 'm1', start: 0, end: 100, venue: 'A' },
      { matchId: 'm2', start: 50, end: 150, venue: 'B' },
    ];
    expect(detectConflicts(slots)).toHaveLength(0);
  });

  it('ignores slots with no venue and non-overlapping slots', () => {
    const slots = [
      { matchId: 'm1', start: 0, end: 10 },
      { matchId: 'm2', start: 20, end: 30 },
      { matchId: 'm3', start: 40, end: 100, venue: 'A' },
    ];
    expect(detectConflicts(slots)).toHaveLength(0);
  });

  it('returns all conflict pairs', () => {
    const slots = [
      { matchId: 'm1', start: 0, end: 100, venue: 'A' },
      { matchId: 'm2', start: 50, end: 150, venue: 'A' },
      { matchId: 'm3', start: 60, end: 120, venue: 'A' },
    ];
    expect(detectConflicts(slots)).toHaveLength(3);
  });
});

describe('reschedule', () => {
  it('returns slots unchanged when the match is missing', () => {
    const slots = [{ matchId: 'm1', start: 0, end: 100, venue: 'A' }];
    expect(reschedule(slots, 'nope', 500)).toBe(slots);
  });

  it('moves the target slot and shifts overlapping same-venue slots', () => {
    const slots = [
      { matchId: 'm1', start: 0, end: 100, venue: 'A' },
      { matchId: 'm2', start: 50, end: 150, venue: 'A' },
      { matchId: 'm3', start: 200, end: 300, venue: 'A' },
      { matchId: 'm4', start: 0, end: 100 },
    ];
    const result = reschedule(slots, 'm1', 100);
    expect(result.find((s) => s.matchId === 'm1')).toEqual({
      matchId: 'm1',
      start: 100,
      end: 200,
      venue: 'A',
    });
    expect(result.find((s) => s.matchId === 'm2')).toMatchObject({
      start: 150,
      end: 250,
    });
    expect(result.find((s) => s.matchId === 'm3')).toMatchObject({
      start: 200,
      end: 300,
    });
    expect(result.find((s) => s.matchId === 'm4')).toMatchObject({
      start: 0,
      end: 100,
    });
  });
});
