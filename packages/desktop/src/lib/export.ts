import type { Tournament, Participant, Match, Standing } from '@/types';

const escapeCSV = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const toCSVRow = (values: (string | number | undefined | null)[]): string =>
  values.map(escapeCSV).join(',');

const buildSection = (title: string, header: string, rows: string[]): string =>
  [`# ${title}`, header, ...rows].join('\n');

export const exportToCSV = (data: {
  tournaments: Tournament[];
  participants: Participant[];
  matches: Match[];
  standings: Standing[];
}): string => {
  const tournamentHeader = toCSVRow([
    'id',
    'name',
    'description',
    'format',
    'status',
    'maxParticipants',
    'createdAt',
    'startDate',
    'endDate',
  ]);
  const tournamentRows = data.tournaments.map((t) =>
    toCSVRow([
      t.id,
      t.name,
      t.description,
      t.format,
      t.status,
      t.maxParticipants,
      t.createdAt,
      t.startDate,
      t.endDate,
    ])
  );

  const participantHeader = toCSVRow([
    'id',
    'tournamentId',
    'name',
    'seed',
    'rating',
    'groupId',
  ]);
  const participantRows = data.participants.map((p) =>
    toCSVRow([p.id, p.tournamentId, p.name, p.seed, p.rating, p.groupId])
  );

  const matchHeader = toCSVRow([
    'id',
    'tournamentId',
    'round',
    'bracket',
    'participant1Id',
    'participant2Id',
    'participant1Score',
    'participant2Score',
    'winnerId',
    'status',
    'scheduledAt',
    'venue',
  ]);
  const matchRows = data.matches.map((m) =>
    toCSVRow([
      m.id,
      m.tournamentId,
      m.round,
      m.bracket,
      m.participant1Id,
      m.participant2Id,
      m.participant1Score,
      m.participant2Score,
      m.winnerId,
      m.status,
      m.scheduledAt,
      m.venue,
    ])
  );

  const standingHeader = toCSVRow([
    'participantId',
    'tournamentId',
    'played',
    'won',
    'drawn',
    'lost',
    'points',
    'position',
  ]);
  const standingRows = data.standings.map((s) =>
    toCSVRow([
      s.participantId,
      s.tournamentId,
      s.played,
      s.won,
      s.drawn,
      s.lost,
      s.points,
      s.position,
    ])
  );

  return [
    buildSection('Tournaments', tournamentHeader, tournamentRows),
    '',
    buildSection('Participants', participantHeader, participantRows),
    '',
    buildSection('Matches', matchHeader, matchRows),
    '',
    buildSection('Standings', standingHeader, standingRows),
  ].join('\n');
};

export const exportTournamentToCSV = (
  tournament: Tournament,
  participants: Participant[],
  matches: Match[],
  standings: Standing[]
): string => {
  const tournamentRow = toCSVRow([
    tournament.id,
    tournament.name,
    tournament.description,
    tournament.format,
    tournament.status,
    tournament.maxParticipants,
    tournament.createdAt,
    tournament.startDate,
    tournament.endDate,
  ]);

  const participantHeader = toCSVRow([
    'id',
    'name',
    'seed',
    'rating',
    'groupId',
  ]);
  const participantRows = participants
    .filter((p) => p.tournamentId === tournament.id)
    .map((p) => toCSVRow([p.id, p.name, p.seed, p.rating, p.groupId]));

  const matchHeader = toCSVRow([
    'id',
    'round',
    'bracket',
    'participant1Id',
    'participant2Id',
    'participant1Score',
    'participant2Score',
    'winnerId',
    'status',
    'scheduledAt',
    'venue',
  ]);
  const matchRows = matches
    .filter((m) => m.tournamentId === tournament.id)
    .map((m) =>
      toCSVRow([
        m.id,
        m.round,
        m.bracket,
        m.participant1Id,
        m.participant2Id,
        m.participant1Score,
        m.participant2Score,
        m.winnerId,
        m.status,
        m.scheduledAt,
        m.venue,
      ])
    );

  const standingHeader = toCSVRow([
    'participantId',
    'played',
    'won',
    'drawn',
    'lost',
    'points',
    'position',
  ]);
  const standingRows = standings
    .filter((s) => s.tournamentId === tournament.id)
    .map((s) =>
      toCSVRow([
        s.participantId,
        s.played,
        s.won,
        s.drawn,
        s.lost,
        s.points,
        s.position,
      ])
    );

  const tournamentHeader = toCSVRow([
    'id',
    'name',
    'description',
    'format',
    'status',
    'maxParticipants',
    'createdAt',
    'startDate',
    'endDate',
  ]);

  return [
    buildSection('Tournament', tournamentHeader, [tournamentRow]),
    '',
    buildSection('Participants', participantHeader, participantRows),
    '',
    buildSection('Matches', matchHeader, matchRows),
    '',
    buildSection('Standings', standingHeader, standingRows),
  ].join('\n');
};

export const downloadFile = (
  content: string | Blob,
  filename: string,
  type: string
): void => {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: {
  tournaments: Tournament[];
  participants: Participant[];
  matches: Match[];
  groups: any[];
}): string => {
  return JSON.stringify(
    { ...data, exportedAt: Date.now(), version: 1 },
    null,
    2
  );
};

export const importFromJSON = (
  json: string
): {
  tournaments: Tournament[];
  participants: Participant[];
  matches: Match[];
  groups: any[];
} | null => {
  try {
    const data = JSON.parse(json);
    if (!data.tournaments || !data.participants || !data.matches) return null;
    return data;
  } catch {
    return null;
  }
};
