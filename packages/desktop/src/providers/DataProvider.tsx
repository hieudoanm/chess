'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { db } from '@/lib/db';
import { generateId } from '@/data/models';
import {
  sampleTournaments,
  sampleParticipants,
  sampleMatches,
  sampleGroups,
} from '@/lib/sample-data';
import type {
  Tournament,
  Participant,
  Match,
  Group,
  Standing,
  StandingSnapshot,
} from '@/types';

interface DataContextValue {
  tournaments: Tournament[];
  participants: Participant[];
  matches: Match[];
  groups: Group[];
  snapshots: StandingSnapshot[];
  loading: boolean;

  createTournament: (
    data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Tournament>;
  updateTournament: (data: Tournament) => Promise<Tournament>;
  deleteTournament: (id: string) => Promise<void>;

  createParticipant: (data: Omit<Participant, 'id'>) => Promise<Participant>;
  createParticipants: (
    items: Omit<Participant, 'id'>[]
  ) => Promise<Participant[]>;
  updateParticipant: (data: Participant) => Promise<Participant>;
  deleteParticipant: (id: string) => Promise<void>;

  createMatch: (data: Omit<Match, 'id'>) => Promise<Match>;
  createMatches: (items: Omit<Match, 'id'>[]) => Promise<Match[]>;
  updateMatch: (data: Match) => Promise<Match>;
  deleteMatch: (id: string) => Promise<void>;

  createGroup: (data: Omit<Group, 'id'>) => Promise<Group>;
  updateGroup: (data: Group) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;

  createSnapshot: (
    tournamentId: string,
    label: string,
    standings: Standing[]
  ) => Promise<StandingSnapshot>;
  deleteSnapshot: (id: string) => Promise<void>;

  cloneTournament: (id: string) => Promise<Tournament | null>;

  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [snapshots, setSnapshots] = useState<StandingSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    let [t, p, m, g] = await Promise.all([
      db.getAllTournaments(),
      db.getAllTournaments().then(async (ts) => {
        const all: Participant[] = [];
        for (const tournament of ts) {
          all.push(...(await db.getParticipants(tournament.id)));
        }
        return all;
      }),
      db.getAllTournaments().then(async (ts) => {
        const all: Match[] = [];
        for (const tournament of ts) {
          all.push(...(await db.getMatches(tournament.id)));
        }
        return all;
      }),
      db.getAllTournaments().then(async (ts) => {
        const all: Group[] = [];
        for (const tournament of ts) {
          all.push(...(await db.getGroups(tournament.id)));
        }
        return all;
      }),
    ]);
    const s = await db.getAllTournaments().then(async (ts) => {
      const all: StandingSnapshot[] = [];
      for (const tournament of ts) {
        all.push(...(await db.getSnapshots(tournament.id)));
      }
      return all;
    });

    if (t.length === 0) {
      for (const tournament of sampleTournaments) {
        await db.createTournament(tournament);
      }
      await db.createParticipants(sampleParticipants);
      await db.createMatches(sampleMatches);
      for (const group of sampleGroups) {
        await db.createGroup(group);
      }
      t = sampleTournaments;
      p = sampleParticipants;
      m = sampleMatches;
      g = sampleGroups;
    }

    setTournaments(t);
    setParticipants(p);
    setMatches(m);
    setGroups(g);
    setSnapshots(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTournament = useCallback(
    async (
      data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Tournament> => {
      const now = Date.now();
      const tournament: Tournament = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      await db.createTournament(tournament);
      setTournaments((prev) => [...prev, tournament]);
      return tournament;
    },
    []
  );

  const updateTournament = useCallback(
    async (data: Tournament): Promise<Tournament> => {
      const updated = { ...data, updatedAt: Date.now() };
      await db.updateTournament(updated);
      setTournaments((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      return updated;
    },
    []
  );

  const deleteTournament = useCallback(async (id: string): Promise<void> => {
    await db.deleteTournament(id);
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    setParticipants((prev) => prev.filter((p) => p.tournamentId !== id));
    setMatches((prev) => prev.filter((m) => m.tournamentId !== id));
    setGroups((prev) => prev.filter((g) => g.tournamentId !== id));
  }, []);

  const createParticipant = useCallback(
    async (data: Omit<Participant, 'id'>): Promise<Participant> => {
      const participant: Participant = { ...data, id: generateId() };
      await db.createParticipant(participant);
      setParticipants((prev) => [...prev, participant]);
      return participant;
    },
    []
  );

  const createParticipants = useCallback(
    async (items: Omit<Participant, 'id'>[]): Promise<Participant[]> => {
      const participants: Participant[] = items.map((item) => ({
        ...item,
        id: generateId(),
      }));
      await db.createParticipants(participants);
      setParticipants((prev) => [...prev, ...participants]);
      return participants;
    },
    []
  );

  const updateParticipant = useCallback(
    async (data: Participant): Promise<Participant> => {
      await db.updateParticipant(data);
      setParticipants((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      return data;
    },
    []
  );

  const deleteParticipant = useCallback(async (id: string): Promise<void> => {
    await db.deleteParticipant(id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const createMatch = useCallback(
    async (data: Omit<Match, 'id'>): Promise<Match> => {
      const match: Match = { ...data, id: generateId() };
      await db.createMatch(match);
      setMatches((prev) => [...prev, match]);
      return match;
    },
    []
  );

  const createMatches = useCallback(
    async (items: Omit<Match, 'id'>[]): Promise<Match[]> => {
      const matches: Match[] = items.map((item) => ({
        ...item,
        id: generateId(),
      }));
      await db.createMatches(matches);
      setMatches((prev) => [...prev, ...matches]);
      return matches;
    },
    []
  );

  const updateMatch = useCallback(async (data: Match): Promise<Match> => {
    await db.updateMatch(data);
    setMatches((prev) => prev.map((m) => (m.id === data.id ? data : m)));
    return data;
  }, []);

  const deleteMatch = useCallback(async (id: string): Promise<void> => {
    await db.deleteMatch(id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const createGroup = useCallback(
    async (data: Omit<Group, 'id'>): Promise<Group> => {
      const group: Group = { ...data, id: generateId() };
      await db.createGroup(group);
      setGroups((prev) => [...prev, group]);
      return group;
    },
    []
  );

  const updateGroup = useCallback(async (data: Group): Promise<Group> => {
    await db.updateGroup(data);
    setGroups((prev) => prev.map((g) => (g.id === data.id ? data : g)));
    return data;
  }, []);

  const deleteGroup = useCallback(async (id: string): Promise<void> => {
    await db.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const createSnapshot = useCallback(
    async (
      tournamentId: string,
      label: string,
      standings: Standing[]
    ): Promise<StandingSnapshot> => {
      const snapshot: StandingSnapshot = {
        id: generateId(),
        tournamentId,
        label,
        createdAt: Date.now(),
        standings,
      };
      await db.createSnapshot(snapshot);
      setSnapshots((prev) => [...prev, snapshot]);
      return snapshot;
    },
    []
  );

  const deleteSnapshot = useCallback(async (id: string): Promise<void> => {
    await db.deleteSnapshot(id);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const cloneTournament = useCallback(
    async (id: string): Promise<Tournament | null> => {
      const source = tournaments.find((t) => t.id === id);
      if (!source) return null;
      const now = Date.now();
      const cloned: Tournament = {
        ...source,
        id: generateId(),
        name: `${source.name} (Copy)`,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        startDate: undefined,
        endDate: undefined,
      };
      await db.createTournament(cloned);
      setTournaments((prev) => [...prev, cloned]);

      const sourceParticipants = participants.filter(
        (p) => p.tournamentId === id
      );
      if (sourceParticipants.length > 0) {
        const clonedParticipants: Participant[] = sourceParticipants.map(
          (p) => ({
            ...p,
            id: generateId(),
            tournamentId: cloned.id,
            groupId: undefined,
          })
        );
        await db.createParticipants(clonedParticipants);
        setParticipants((prev) => [...prev, ...clonedParticipants]);
      }
      return cloned;
    },
    [tournaments, participants]
  );

  return (
    <DataContext.Provider
      value={{
        tournaments,
        participants,
        matches,
        groups,
        snapshots,
        loading,
        createTournament,
        updateTournament,
        deleteTournament,
        createParticipant,
        createParticipants,
        updateParticipant,
        deleteParticipant,
        createMatch,
        createMatches,
        updateMatch,
        deleteMatch,
        createGroup,
        updateGroup,
        deleteGroup,
        createSnapshot,
        deleteSnapshot,
        cloneTournament,
        refresh,
      }}>
      {children}
    </DataContext.Provider>
  );
};

DataProvider.displayName = 'DataProvider';
