jest.mock('@/lib/db', () => ({
  db: {
    getAllTournaments: jest.fn(),
    getParticipants: jest.fn(),
    getMatches: jest.fn(),
    getGroups: jest.fn(),
    createTournament: jest.fn(),
    updateTournament: jest.fn(),
    deleteTournament: jest.fn(),
    createParticipant: jest.fn(),
    createParticipants: jest.fn(),
    updateParticipant: jest.fn(),
    deleteParticipant: jest.fn(),
    createMatch: jest.fn(),
    createMatches: jest.fn(),
    updateMatch: jest.fn(),
    deleteMatch: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    getSnapshots: jest.fn(),
    createSnapshot: jest.fn(),
    deleteSnapshot: jest.fn(),
  },
}));

import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataProvider, useData } from '@/providers/DataProvider';
import { db } from '@/lib/db';
import type { Tournament, Participant, Match, Group } from '@/types';

const wrapper = ({ children }: { children: ReactNode }) => (
  <DataProvider>{children}</DataProvider>
);

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

const emptyDb = (): void => {
  (db.getAllTournaments as jest.Mock).mockResolvedValue([]);
  (db.getParticipants as jest.Mock).mockResolvedValue([]);
  (db.getMatches as jest.Mock).mockResolvedValue([]);
  (db.getGroups as jest.Mock).mockResolvedValue([]);
  (db.getSnapshots as jest.Mock).mockResolvedValue([]);
};

const seededDb = (): void => {
  (db.getAllTournaments as jest.Mock).mockResolvedValue([tournament('t1')]);
  (db.getParticipants as jest.Mock).mockResolvedValue([]);
  (db.getMatches as jest.Mock).mockResolvedValue([]);
  (db.getGroups as jest.Mock).mockResolvedValue([]);
  (db.getSnapshots as jest.Mock).mockResolvedValue([]);
};

beforeEach(() => {
  jest.clearAllMocks();
  emptyDb();
});

describe('useData', () => {
  it('throws when used outside DataProvider', () => {
    expect(() => renderHook(() => useData())).toThrow(
      'useData must be used within DataProvider'
    );
  });

  it('seeds sample data when the database is empty', async () => {
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tournaments).toHaveLength(6);
    expect(result.current.participants.length).toBeGreaterThan(0);
    expect(result.current.matches.length).toBeGreaterThan(0);
    expect(result.current.groups.length).toBeGreaterThan(0);
    expect(db.createTournament).toHaveBeenCalled();
  });

  it('loads persisted data from the database', async () => {
    (db.getAllTournaments as jest.Mock).mockResolvedValue([tournament('t1')]);
    (db.getParticipants as jest.Mock).mockResolvedValue([
      participant('p1', 't1'),
    ]);
    (db.getMatches as jest.Mock).mockResolvedValue([match('m1', 't1')]);
    (db.getGroups as jest.Mock).mockResolvedValue([group('g1', 't1')]);
    (db.getSnapshots as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tournaments.map((t) => t.id)).toEqual(['t1']);
    expect(result.current.participants.map((p) => p.id)).toEqual(['p1']);
    expect(result.current.matches.map((m) => m.id)).toEqual(['m1']);
    expect(result.current.groups.map((g) => g.id)).toEqual(['g1']);
    expect(db.createTournament).not.toHaveBeenCalled();
  });

  it('creates a tournament and appends it', async () => {
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: Tournament | undefined;
    await act(async () => {
      created = await result.current.createTournament({
        name: 'New Cup',
        description: '',
        format: 'round-robin',
        status: 'draft',
        maxParticipants: 4,
      });
    });

    expect(created?.id).toBeTruthy();
    expect(result.current.tournaments).toHaveLength(7);
    expect(db.createTournament).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Cup' })
    );
  });

  it('updates a tournament in place', async () => {
    (db.getAllTournaments as jest.Mock).mockResolvedValue([tournament('t1')]);
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTournament({
        ...tournament('t1'),
        name: 'Renamed',
      });
    });

    expect(result.current.tournaments[0].name).toBe('Renamed');
  });

  it('deletes a tournament and its children', async () => {
    (db.getAllTournaments as jest.Mock).mockResolvedValue([tournament('t1')]);
    (db.getParticipants as jest.Mock).mockResolvedValue([
      participant('p1', 't1'),
    ]);
    (db.getMatches as jest.Mock).mockResolvedValue([match('m1', 't1')]);
    (db.getGroups as jest.Mock).mockResolvedValue([group('g1', 't1')]);

    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTournament('t1');
    });

    expect(result.current.tournaments).toHaveLength(0);
    expect(result.current.participants).toHaveLength(0);
    expect(result.current.matches).toHaveLength(0);
    expect(result.current.groups).toHaveLength(0);
    expect(db.deleteTournament).toHaveBeenCalledWith('t1');
  });

  it('creates, updates, and deletes participants', async () => {
    seededDb();
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: Participant | undefined;
    await act(async () => {
      created = await result.current.createParticipant({
        tournamentId: 't1',
        name: 'Alice',
        seed: 1,
      });
    });
    expect(created?.id).toBeTruthy();
    expect(result.current.participants).toHaveLength(1);

    await act(async () => {
      await result.current.createParticipants([
        { tournamentId: 't1', name: 'Bob', seed: 2 },
        { tournamentId: 't1', name: 'Cara', seed: 3 },
      ]);
    });
    expect(result.current.participants).toHaveLength(3);

    await act(async () => {
      await result.current.updateParticipant({
        ...(created as Participant),
        name: 'Alicia',
      });
    });
    expect(result.current.participants[0].name).toBe('Alicia');

    await act(async () => {
      await result.current.deleteParticipant((created as Participant).id);
    });
    expect(result.current.participants).toHaveLength(2);
  });

  it('creates, updates, and deletes matches', async () => {
    seededDb();
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: Match | undefined;
    await act(async () => {
      created = await result.current.createMatch({
        tournamentId: 't1',
        round: 1,
        participant1Id: 'p1',
        participant2Id: 'p2',
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      });
    });
    expect(result.current.matches).toHaveLength(1);

    await act(async () => {
      await result.current.createMatches([
        { ...match('', 't1'), participant1Id: 'p3', participant2Id: 'p4' },
        { ...match('', 't1'), participant1Id: 'p5', participant2Id: 'p6' },
      ]);
    });
    expect(result.current.matches).toHaveLength(3);

    await act(async () => {
      await result.current.updateMatch({
        ...(created as Match),
        status: 'completed',
      });
    });
    expect(result.current.matches[0].status).toBe('completed');

    await act(async () => {
      await result.current.deleteMatch((created as Match).id);
    });
    expect(result.current.matches).toHaveLength(2);
  });

  it('creates, updates, and deletes groups', async () => {
    seededDb();
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: Group | undefined;
    await act(async () => {
      created = await result.current.createGroup({
        tournamentId: 't1',
        name: 'Group B',
        participantIds: [],
      });
    });
    expect(result.current.groups).toHaveLength(1);

    await act(async () => {
      await result.current.updateGroup({
        ...(created as Group),
        name: 'Group C',
      });
    });
    expect(result.current.groups[0].name).toBe('Group C');

    await act(async () => {
      await result.current.deleteGroup((created as Group).id);
    });
    expect(result.current.groups).toHaveLength(0);
  });

  it('creates and deletes standings snapshots', async () => {
    seededDb();
    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let snapshotId = '';
    await act(async () => {
      const snapshot = await result.current.createSnapshot(
        't1',
        'After round 1',
        [
          {
            participantId: 'p1',
            tournamentId: 't1',
            played: 1,
            won: 1,
            drawn: 0,
            lost: 0,
            points: 3,
            position: 1,
          },
        ]
      );
      snapshotId = snapshot.id;
    });

    expect(result.current.snapshots).toHaveLength(1);
    expect(result.current.snapshots[0].label).toBe('After round 1');
    expect(db.createSnapshot).toHaveBeenCalled();

    await act(async () => {
      await result.current.deleteSnapshot(snapshotId);
    });
    expect(result.current.snapshots).toHaveLength(0);
  });

  it('clones a tournament with its participants', async () => {
    (db.getAllTournaments as jest.Mock).mockResolvedValue([tournament('t1')]);
    (db.getParticipants as jest.Mock).mockResolvedValue([
      participant('p1', 't1'),
      participant('p2', 't1'),
    ]);
    (db.getMatches as jest.Mock).mockResolvedValue([]);
    (db.getGroups as jest.Mock).mockResolvedValue([]);
    (db.getSnapshots as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useData(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const cloned = await act(async () => result.current.cloneTournament('t1'));

    expect(cloned).not.toBeNull();
    expect(cloned?.id).not.toBe('t1');
    expect(cloned?.name).toBe('Tournament t1 (Copy)');
    expect(cloned?.status).toBe('draft');
    expect(result.current.tournaments).toHaveLength(2);
    expect(result.current.participants).toHaveLength(4);
    expect(db.createTournament).toHaveBeenCalled();
    expect(db.createParticipants).toHaveBeenCalled();
  });
});
