import {
  shareTournament,
  generateShareableJSON,
  generateTextSummary,
  copyToClipboard,
} from '@/lib/sharing';
import type { Tournament, Participant, Match } from '@/types';

const tournament: Tournament = {
  id: 't1',
  name: 'Cup',
  description: '',
  format: 'single-elimination',
  status: 'in-progress',
  maxParticipants: 8,
  createdAt: 0,
  updatedAt: 0,
};

const participant: Participant = {
  id: 'p1',
  tournamentId: 't1',
  name: 'Alice',
  seed: 1,
};

const match = (
  id: string,
  p1: string,
  p2: string,
  s1: number | null,
  s2: number | null,
  status: Match['status']
): Match => ({
  id,
  tournamentId: 't1',
  round: 1,
  participant1Id: p1,
  participant2Id: p2,
  participant1Score: s1,
  participant2Score: s2,
  winnerId: null,
  status,
});

describe('shareTournament', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
  });

  it('shares via navigator.share when available', async () => {
    const share = jest.fn(async () => undefined);
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
    });
    await expect(shareTournament('hello')).resolves.toBe(true);
    expect(share).toHaveBeenCalledWith({ title: 'Tournament', text: 'hello' });
  });

  it('returns false when navigator.share rejects', async () => {
    Object.defineProperty(navigator, 'share', {
      value: jest.fn(async () => {
        throw new Error('aborted');
      }),
      configurable: true,
    });
    await expect(shareTournament('hello')).resolves.toBe(false);
  });

  it('falls back to the clipboard when navigator.share is missing', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn(async () => undefined) },
      configurable: true,
    });
    await expect(shareTournament('hello')).resolves.toBe(true);
  });
});

describe('generateShareableJSON', () => {
  it('includes the payload and a sharedAt timestamp', () => {
    const json = JSON.parse(
      generateShareableJSON([tournament], [participant], [])
    );
    expect(json.tournaments).toHaveLength(1);
    expect(json.participants).toHaveLength(1);
    expect(json.sharedAt).toEqual(expect.any(Number));
  });
});

describe('generateTextSummary', () => {
  it('summarizes the tournament', () => {
    const summary = generateTextSummary(
      tournament,
      [participant],
      [
        match('m1', 'p1', 'p2', 3, 1, 'completed'),
        match('m2', 'p1', 'p2', null, null, 'scheduled'),
      ]
    );
    expect(summary).toContain('Cup');
    expect(summary).toContain('single-elimination | in-progress');
    expect(summary).toContain('Matches: 1/2 completed');
    expect(summary).toContain('Alice: 3 pts');
  });

  it('ranks the top five scorers and omits the section when empty', () => {
    const withScorers = generateTextSummary(
      tournament,
      [participant],
      [match('m1', 'p1', 'p2', 3, 1, 'completed')]
    );
    expect(withScorers.indexOf('Top Scorers:')).toBeLessThan(
      withScorers.indexOf('Alice: 3 pts')
    );

    const empty = generateTextSummary(tournament, [participant], []);
    expect(empty).not.toContain('Top Scorers:');
  });

  it('uses Unknown for missing participant names', () => {
    const summary = generateTextSummary(
      tournament,
      [],
      [match('m1', 'nope', 'p2', 3, 1, 'completed')]
    );
    expect(summary).toContain('Unknown: 3 pts');
  });

  it('ignores participants from other tournaments', () => {
    const foreign: Participant = { ...participant, tournamentId: 't2' };
    const summary = generateTextSummary(
      tournament,
      [foreign],
      [match('m1', 'p1', 'p2', 3, 1, 'completed')]
    );
    expect(summary).toContain('Unknown: 3 pts');
  });

  it('skips scoring completed matches with missing ids or scores', () => {
    const summary = generateTextSummary(
      tournament,
      [participant],
      [
        match('m1', '', 'p2', 3, 1, 'completed'),
        match('m2', 'p1', 'p2', 2, null, 'completed'),
      ]
    );
    expect(summary).toContain('Matches: 2/2 completed');
    expect(summary).toContain('Alice: 2 pts');
    expect(summary).toContain('Unknown: 1 pts');
  });
});

describe('copyToClipboard', () => {
  it('returns true on success', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn(async () => undefined) },
      configurable: true,
    });
    await expect(copyToClipboard('text')).resolves.toBe(true);
  });

  it('returns false when writeText rejects', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(async () => {
          throw new Error('denied');
        }),
      },
      configurable: true,
    });
    await expect(copyToClipboard('text')).resolves.toBe(false);
  });
});
