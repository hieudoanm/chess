import { db, clearAll, exportAll, importAll } from '@/lib/db';
import type { Tournament, Participant, Match, Group } from '@/types';

const tournament = (id: string): Tournament => ({
  id,
  name: `Tournament ${id}`,
  description: '',
  format: 'single-elimination',
  status: 'draft',
  maxParticipants: 8,
  createdAt: 1,
  updatedAt: 1,
});

const participant = (id: string, tournamentId: string): Participant => ({
  id,
  tournamentId,
  name: `Player ${id}`,
  seed: 1,
});

const match = (id: string, tournamentId: string): Match => ({
  id,
  tournamentId,
  round: 1,
  participant1Id: 'p1',
  participant2Id: 'p2',
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
});

const group = (id: string, tournamentId: string): Group => ({
  id,
  tournamentId,
  name: 'Group A',
  participantIds: [],
});

const fakeIdb = (): {
  failOpen: boolean;
  failOps: boolean;
  preExistingStores: string[];
} => (globalThis as unknown as { indexedDB: unknown }).indexedDB as never;

describe('db', () => {
  beforeEach(async () => {
    await clearAll();
  });

  afterEach(() => {
    fakeIdb().failOpen = false;
    fakeIdb().failOps = false;
    fakeIdb().preExistingStores = [];
  });

  it('starts with no tournaments', async () => {
    await expect(db.getAllTournaments()).resolves.toEqual([]);
  });

  it('creates and reads a tournament', async () => {
    await db.createTournament(tournament('t1'));
    const tournaments = await db.getAllTournaments();
    expect(tournaments).toHaveLength(1);
    expect(tournaments[0].id).toBe('t1');
    await expect(db.getTournament('t1')).resolves.toMatchObject({ id: 't1' });
    await expect(db.getTournament('missing')).resolves.toBeUndefined();
  });

  it('updates and deletes a tournament', async () => {
    await db.createTournament(tournament('t1'));
    await db.updateTournament({ ...tournament('t1'), name: 'Renamed' });
    await expect(db.getTournament('t1')).resolves.toMatchObject({
      name: 'Renamed',
    });

    await db.deleteTournament('t1');
    await expect(db.getAllTournaments()).resolves.toEqual([]);
  });

  it('creates participants and reads them by tournament', async () => {
    await db.createTournament(tournament('t1'));
    await db.createTournament(tournament('t2'));
    await db.createParticipant(participant('p1', 't1'));
    await db.createParticipant(participant('p2', 't2'));

    await expect(db.getParticipants('t1')).resolves.toHaveLength(1);
    await expect(db.getParticipants('t2')).resolves.toHaveLength(1);
  });

  it('creates participants in a batch', async () => {
    await db.createTournament(tournament('t1'));
    await db.createParticipants([
      participant('p1', 't1'),
      participant('p2', 't1'),
    ]);
    await expect(db.getParticipants('t1')).resolves.toHaveLength(2);
  });

  it('updates and deletes a participant', async () => {
    await db.createTournament(tournament('t1'));
    await db.createParticipant(participant('p1', 't1'));
    await db.updateParticipant({ ...participant('p1', 't1'), name: 'Updated' });
    await expect(db.getParticipants('t1')).resolves.toMatchObject([
      { name: 'Updated' },
    ]);

    await db.deleteParticipant('p1');
    await expect(db.getParticipants('t1')).resolves.toEqual([]);
  });

  it('manages matches and groups by tournament', async () => {
    await db.createTournament(tournament('t1'));
    await db.createMatch(match('m1', 't1'));
    await db.createMatches([match('m2', 't1'), match('m3', 't1')]);
    await expect(db.getMatches('t1')).resolves.toHaveLength(3);

    await db.updateMatch({ ...match('m1', 't1'), status: 'completed' });
    await expect(db.getMatches('t1')).resolves.toEqual([
      { ...match('m1', 't1'), status: 'completed' },
      match('m2', 't1'),
      match('m3', 't1'),
    ]);

    await db.deleteMatch('m1');
    await expect(db.getMatches('t1')).resolves.toHaveLength(2);

    await db.createGroup(group('g1', 't1'));
    await db.updateGroup({ ...group('g1', 't1'), name: 'Group B' });
    await expect(db.getGroups('t1')).resolves.toMatchObject([
      { name: 'Group B' },
    ]);

    await db.deleteGroup('g1');
    await expect(db.getGroups('t1')).resolves.toEqual([]);
  });

  it('clears every store', async () => {
    await db.createTournament(tournament('t1'));
    await clearAll();
    await expect(db.getAllTournaments()).resolves.toEqual([]);
  });

  it('exports all data', async () => {
    await db.createTournament(tournament('t1'));
    await db.createParticipant(participant('p1', 't1'));
    await db.createMatch(match('m1', 't1'));
    await db.createGroup(group('g1', 't1'));

    const all = await exportAll();
    expect(all.tournaments).toHaveLength(1);
    expect(all.participants).toHaveLength(1);
    expect(all.matches).toHaveLength(1);
    expect(all.groups).toHaveLength(1);
  });

  it('imports all data after clearing', async () => {
    await db.createTournament(tournament('old'));
    await importAll({
      tournaments: [tournament('t1')],
      participants: [participant('p1', 't1')],
      matches: [match('m1', 't1')],
      groups: [group('g1', 't1')],
    });

    const all = await exportAll();
    expect(all.tournaments).toHaveLength(1);
    expect(all.tournaments[0].id).toBe('t1');
    expect(all.participants).toHaveLength(1);
    expect(all.matches).toHaveLength(1);
    expect(all.groups).toHaveLength(1);
  });

  it('rejects when opening the database fails', async () => {
    let fresh: typeof import('@/lib/db');
    jest.isolateModules(() => {
      fresh = require('@/lib/db') as typeof import('@/lib/db');
    });
    fakeIdb().failOpen = true;
    await expect(fresh!.db.getAllTournaments()).rejects.toBeTruthy();
    fakeIdb().failOpen = false;
  });

  it('keeps existing stores when opening a pre-existing database', async () => {
    fakeIdb().preExistingStores = [
      'tournaments',
      'participants',
      'matches',
      'groups',
    ];
    let fresh: typeof import('@/lib/db');
    jest.isolateModules(() => {
      fresh = require('@/lib/db') as typeof import('@/lib/db');
    });
    await fresh!.db.createTournament(tournament('t1'));
    await expect(fresh!.db.getAllTournaments()).resolves.toHaveLength(1);
    await fresh!.db.createParticipants([
      participant('p1', 't1'),
      participant('p2', 't1'),
    ]);
    await expect(fresh!.db.getParticipants('t1')).resolves.toHaveLength(2);
    fakeIdb().preExistingStores = [];
  });

  it('rejects when a read operation fails', async () => {
    fakeIdb().failOps = true;
    await expect(db.getAllTournaments()).rejects.toBeTruthy();
    fakeIdb().failOps = false;
  });

  it('rejects when a write operation fails', async () => {
    fakeIdb().failOps = true;
    await expect(db.createTournament(tournament('t1'))).rejects.toBeTruthy();
    fakeIdb().failOps = false;
  });

  it('rejects when a batch write fails', async () => {
    await db.createTournament(tournament('t1'));
    fakeIdb().failOps = true;
    await expect(
      db.createParticipants([participant('p1', 't1')])
    ).rejects.toBeTruthy();
    fakeIdb().failOps = false;
  });
});
