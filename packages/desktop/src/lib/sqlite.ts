import type { Tournament, Participant, Match } from '@/types';

export const exportToSQLite = async (
  tournaments: Tournament[],
  participants: Participant[],
  matches: Match[]
): Promise<Blob> => {
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      format TEXT NOT NULL,
      status TEXT NOT NULL,
      maxParticipants INTEGER,
      createdAt TEXT,
      startDate TEXT,
      endDate TEXT
    )
  `);

  db.run(`
    CREATE TABLE participants (
      id TEXT PRIMARY KEY,
      tournamentId TEXT NOT NULL,
      name TEXT NOT NULL,
      seed INTEGER,
      rating REAL,
      groupId TEXT,
      FOREIGN KEY (tournamentId) REFERENCES tournaments(id)
    )
  `);

  db.run(`
    CREATE TABLE matches (
      id TEXT PRIMARY KEY,
      tournamentId TEXT NOT NULL,
      round INTEGER NOT NULL,
      bracket TEXT,
      participant1Id TEXT,
      participant2Id TEXT,
      participant1Score INTEGER,
      participant2Score INTEGER,
      winnerId TEXT,
      status TEXT NOT NULL,
      scheduledAt TEXT,
      venue TEXT,
      FOREIGN KEY (tournamentId) REFERENCES tournaments(id),
      FOREIGN KEY (participant1Id) REFERENCES participants(id),
      FOREIGN KEY (participant2Id) REFERENCES participants(id)
    )
  `);

  const insertTournament = db.prepare(
    `INSERT INTO tournaments (id, name, description, format, status, maxParticipants, createdAt, startDate, endDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const t of tournaments) {
    insertTournament.run([
      t.id,
      t.name,
      t.description ?? '',
      t.format,
      t.status,
      t.maxParticipants ?? null,
      t.createdAt ?? '',
      t.startDate ?? '',
      t.endDate ?? '',
    ]);
  }
  insertTournament.free();

  const insertParticipant = db.prepare(
    `INSERT INTO participants (id, tournamentId, name, seed, rating, groupId)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const p of participants) {
    insertParticipant.run([
      p.id,
      p.tournamentId,
      p.name,
      p.seed ?? null,
      p.rating ?? null,
      p.groupId ?? null,
    ]);
  }
  insertParticipant.free();

  const insertMatch = db.prepare(
    `INSERT INTO matches (id, tournamentId, round, bracket, participant1Id, participant2Id, participant1Score, participant2Score, winnerId, status, scheduledAt, venue)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const m of matches) {
    insertMatch.run([
      m.id,
      m.tournamentId,
      m.round,
      m.bracket ?? '',
      m.participant1Id ?? null,
      m.participant2Id ?? null,
      m.participant1Score ?? null,
      m.participant2Score ?? null,
      m.winnerId ?? null,
      m.status,
      m.scheduledAt ?? '',
      m.venue ?? '',
    ]);
  }
  insertMatch.free();

  const data = db.export();
  db.close();

  return new Blob([new Uint8Array(data)], { type: 'application/x-sqlite3' });
};
