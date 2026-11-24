import type {
  Tournament,
  Participant,
  Match,
  Group,
  StandingSnapshot,
} from '@/types';

const DB_NAME = 'tourney-db';
const DB_VERSION = 1;

const STORES = {
  tournaments: 'tournaments',
  participants: 'participants',
  matches: 'matches',
  groups: 'groups',
  snapshots: 'snapshots',
} as const;

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.tournaments)) {
        const store = db.createObjectStore(STORES.tournaments, {
          keyPath: 'id',
        });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.participants)) {
        const store = db.createObjectStore(STORES.participants, {
          keyPath: 'id',
        });
        store.createIndex('tournamentId', 'tournamentId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.matches)) {
        const store = db.createObjectStore(STORES.matches, { keyPath: 'id' });
        store.createIndex('tournamentId', 'tournamentId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.groups)) {
        const store = db.createObjectStore(STORES.groups, { keyPath: 'id' });
        store.createIndex('tournamentId', 'tournamentId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.snapshots)) {
        const store = db.createObjectStore(STORES.snapshots, { keyPath: 'id' });
        store.createIndex('tournamentId', 'tournamentId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      dbInstance = db;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

const getAll = <T>(storeName: string): Promise<T[]> =>
  openDB().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      })
  );

const getById = <T>(storeName: string, id: string): Promise<T | undefined> =>
  openDB().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      })
  );

const getAllByIndex = <T>(
  storeName: string,
  indexName: string,
  value: string
): Promise<T[]> =>
  openDB().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      })
  );

const create = <T>(storeName: string, data: T): Promise<T> =>
  openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
      })
  );

const createBatch = <T extends { id: string }>(
  storeName: string,
  items: T[]
): Promise<T[]> =>
  openDB().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        for (const item of items) {
          store.add(item);
        }
        tx.oncomplete = () => resolve(items);
        tx.onerror = () => reject(tx.error);
      })
  );

const update = <T>(storeName: string, data: T): Promise<T> =>
  openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
      })
  );

const remove = (storeName: string, id: string): Promise<void> =>
  openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
  );

const clearStore = (storeName: string): Promise<void> =>
  openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
  );

export const db = {
  getAllTournaments: () => getAll<Tournament>(STORES.tournaments),
  getTournament: (id: string) => getById<Tournament>(STORES.tournaments, id),
  createTournament: (data: Tournament) =>
    create<Tournament>(STORES.tournaments, data),
  updateTournament: (data: Tournament) =>
    update<Tournament>(STORES.tournaments, data),
  deleteTournament: (id: string) => remove(STORES.tournaments, id),

  getParticipants: (tournamentId: string) =>
    getAllByIndex<Participant>(
      STORES.participants,
      'tournamentId',
      tournamentId
    ),
  createParticipant: (data: Participant) =>
    create<Participant>(STORES.participants, data),
  createParticipants: (items: Participant[]) =>
    createBatch<Participant>(STORES.participants, items),
  updateParticipant: (data: Participant) =>
    update<Participant>(STORES.participants, data),
  deleteParticipant: (id: string) => remove(STORES.participants, id),

  getMatches: (tournamentId: string) =>
    getAllByIndex<Match>(STORES.matches, 'tournamentId', tournamentId),
  createMatch: (data: Match) => create<Match>(STORES.matches, data),
  createMatches: (items: Match[]) => createBatch<Match>(STORES.matches, items),
  updateMatch: (data: Match) => update<Match>(STORES.matches, data),
  deleteMatch: (id: string) => remove(STORES.matches, id),

  getGroups: (tournamentId: string) =>
    getAllByIndex<Group>(STORES.groups, 'tournamentId', tournamentId),
  createGroup: (data: Group) => create<Group>(STORES.groups, data),
  updateGroup: (data: Group) => update<Group>(STORES.groups, data),
  deleteGroup: (id: string) => remove(STORES.groups, id),

  getSnapshots: (tournamentId: string) =>
    getAllByIndex<StandingSnapshot>(
      STORES.snapshots,
      'tournamentId',
      tournamentId
    ),
  createSnapshot: (data: StandingSnapshot) =>
    create<StandingSnapshot>(STORES.snapshots, data),
  deleteSnapshot: (id: string) => remove(STORES.snapshots, id),
};

export const clearAll = async (): Promise<void> => {
  await Promise.all(
    Object.values(STORES).map((storeName) => clearStore(storeName))
  );
};

export const exportAll = async (): Promise<{
  tournaments: Tournament[];
  participants: Participant[];
  matches: Match[];
  groups: Group[];
}> => {
  const [tournaments, participants, matches, groups] = await Promise.all([
    db.getAllTournaments(),
    openDB().then((d) => getAll<Participant>(STORES.participants)),
    openDB().then((d) => getAll<Match>(STORES.matches)),
    openDB().then((d) => getAll<Group>(STORES.groups)),
  ]);
  return { tournaments, participants, matches, groups };
};

export const importAll = async (data: {
  tournaments: Tournament[];
  participants: Participant[];
  matches: Match[];
  groups: Group[];
}): Promise<void> => {
  await clearAll();
  await Promise.all([
    ...data.tournaments.map((t) => db.createTournament(t)),
    ...data.participants.map((p) => db.createParticipant(p)),
    ...data.matches.map((m) => db.createMatch(m)),
    ...data.groups.map((g) => db.createGroup(g)),
  ]);
};
