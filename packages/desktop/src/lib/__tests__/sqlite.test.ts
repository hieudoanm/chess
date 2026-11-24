import { exportToSQLite } from '@/lib/sqlite';
import type { Tournament, Participant, Match } from '@/types';

const tournament: Tournament = {
  id: 't1',
  name: 'Cup',
  description: 'Knockout',
  format: 'single-elimination',
  status: 'completed',
  maxParticipants: 8,
  createdAt: 0,
  updatedAt: 0,
  startDate: 1,
  endDate: 2,
};

const participant: Participant = {
  id: 'p1',
  tournamentId: 't1',
  name: 'Alice',
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
  scheduledAt: 3,
  venue: 'Arena',
};

const run = jest.fn();
const free = jest.fn();
const DatabaseMock = jest.fn().mockImplementation(() => ({
  run,
  prepare: jest.fn(() => ({ run: jest.fn(), free })),
  export: jest.fn(() => new Uint8Array([1, 2, 3])),
  close: jest.fn(),
}));

jest.mock('sql.js', () => ({
  __esModule: true,
  default: jest.fn(async () => ({ Database: DatabaseMock })),
}));

describe('exportToSQLite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the schema, inserts records, and returns a Blob', async () => {
    const blob = await exportToSQLite([tournament], [participant], [match]);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/x-sqlite3');
    expect(run).toHaveBeenCalledTimes(3);
    expect(run.mock.calls[0][0]).toContain('CREATE TABLE tournaments');
    expect(run.mock.calls[1][0]).toContain('CREATE TABLE participants');
    expect(run.mock.calls[2][0]).toContain('CREATE TABLE matches');
  });

  it('frees prepared statements and closes the database', async () => {
    await exportToSQLite([tournament], [participant], [match]);
    expect(free).toHaveBeenCalledTimes(3);
    expect(DatabaseMock.mock.results[0].value.close).toHaveBeenCalled();
  });

  it('inserts defaults for missing optional fields', async () => {
    const minimal: Tournament = {
      id: 't2',
      name: 'Min',
      description: '',
      format: 'league',
      status: 'draft',
      maxParticipants: 4,
      createdAt: 0,
      updatedAt: 0,
    };
    await exportToSQLite([minimal], [], []);
    expect(DatabaseMock.mock.results[0].value.prepare).toHaveBeenCalled();
  });

  it('uses fallbacks when every optional field is undefined', async () => {
    const bare = {
      id: 't3',
      name: 'Bare',
      format: 'swiss',
      status: 'in-progress',
    } as unknown as Tournament;
    const bareParticipant = {
      id: 'p2',
      tournamentId: 't3',
      name: 'Bob',
    } as unknown as Participant;
    const bareMatch = {
      id: 'm2',
      tournamentId: 't3',
      round: 2,
      status: 'scheduled',
    } as unknown as Match;

    await expect(
      exportToSQLite([bare], [bareParticipant], [bareMatch])
    ).resolves.toBeInstanceOf(Blob);

    const prepared = DatabaseMock.mock.results[0].value.prepare;
    expect(prepared).toHaveBeenCalledTimes(3);
  });
});
