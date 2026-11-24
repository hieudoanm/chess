import {
  exportToCSV,
  exportTournamentToCSV,
  downloadFile,
  exportToJSON,
  importFromJSON,
} from '@/lib/export';
import type { Tournament, Participant, Match, Standing } from '@/types';

const tournament: Tournament = {
  id: 't1',
  name: 'Cup',
  description: 'A, "special" cup',
  format: 'single-elimination',
  status: 'completed',
  maxParticipants: 8,
  createdAt: 0,
  updatedAt: 0,
};

const participant: Participant = {
  id: 'p1',
  tournamentId: 't1',
  name: 'Doe, John',
  seed: 1,
  rating: 1500,
};

const match: Match = {
  id: 'm1',
  tournamentId: 't1',
  round: 1,
  participant1Id: 'p1',
  participant2Id: 'p2',
  participant1Score: 2,
  participant2Score: 1,
  winnerId: 'p1',
  status: 'completed',
};

const standing: Standing = {
  participantId: 'p1',
  tournamentId: 't1',
  played: 1,
  won: 1,
  drawn: 0,
  lost: 0,
  points: 3,
  position: 1,
};

describe('exportToCSV', () => {
  it('builds sections for every entity type', () => {
    const csv = exportToCSV({
      tournaments: [tournament],
      participants: [participant],
      matches: [match],
      standings: [standing],
    });

    expect(csv).toContain('# Tournaments');
    expect(csv).toContain('# Participants');
    expect(csv).toContain('# Matches');
    expect(csv).toContain('# Standings');
    expect(csv).toContain(tournament.id);
    expect(csv).toContain('"Doe, John"');
    expect(csv).toContain('"A, ""special"" cup"');
  });

  it('escapes commas, quotes, and newlines', () => {
    const csv = exportToCSV({
      tournaments: [{ ...tournament, description: 'line1\nline2' }],
      participants: [],
      matches: [],
      standings: [],
    });
    expect(csv).toContain('"line1\nline2"');
  });
});

describe('exportTournamentToCSV', () => {
  it('filters participants, matches, and standings to the tournament', () => {
    const otherParticipant: Participant = {
      ...participant,
      id: 'x',
      tournamentId: 't2',
    };
    const otherMatch: Match = { ...match, id: 'mx', tournamentId: 't2' };
    const otherStanding: Standing = {
      ...standing,
      participantId: 'x',
      tournamentId: 't2',
    };

    const csv = exportTournamentToCSV(
      tournament,
      [participant, otherParticipant],
      [match, otherMatch],
      [standing, otherStanding]
    );

    expect(csv).toContain('# Tournament');
    expect(csv).toContain('p1');
    expect(csv).not.toContain('mx');
    expect(csv).not.toContain('\nx,');
  });
});

describe('downloadFile', () => {
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    (URL.createObjectURL as jest.Mock).mockReturnValue('blob:fake');
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('creates a blob URL and clicks a download anchor', () => {
    downloadFile('csv-content', 'export.csv', 'text/csv');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('accepts an existing Blob', () => {
    downloadFile(
      new Blob(['x'], { type: 'application/json' }),
      'data.json',
      'application/json'
    );
    expect(clickSpy).toHaveBeenCalled();
  });
});

describe('exportToJSON', () => {
  it('includes the payload, exportedAt, and version', () => {
    const json = JSON.parse(
      exportToJSON({
        tournaments: [tournament],
        participants: [],
        matches: [],
        groups: [],
      })
    );
    expect(json.tournaments).toHaveLength(1);
    expect(json.version).toBe(1);
    expect(json.exportedAt).toEqual(expect.any(Number));
  });
});

describe('importFromJSON', () => {
  it('parses valid backup data', () => {
    const data = { tournaments: [tournament], participants: [], matches: [] };
    expect(importFromJSON(JSON.stringify(data))).toEqual(data);
  });

  it('returns null when required keys are missing', () => {
    expect(importFromJSON(JSON.stringify({ tournaments: [] }))).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(importFromJSON('not json')).toBeNull();
  });
});
