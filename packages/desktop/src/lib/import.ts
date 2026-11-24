import type { Tournament, Participant, Match } from '@/types';

type ParsedParticipant = { name: string; seed?: number; rating?: number };

const parseCSVLines = (csv: string): string[][] => {
  return csv
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
          if (char === '"' && line[i + 1] === '"') {
            current += '"';
            i++;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            cells.push(current);
            current = '';
          } else {
            current += char;
          }
        }
      }
      cells.push(current);
      return cells;
    });
};

const findColumnIndex = (header: string[], ...candidates: string[]): number => {
  const lower = header.map((h) => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = lower.indexOf(candidate.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
};

export const importParticipantsFromCSV = (csv: string): ParsedParticipant[] => {
  const lines = parseCSVLines(csv);
  if (lines.length < 2) return [];

  const header = lines[0];
  const nameIdx = findColumnIndex(header, 'name', 'participant', 'player');
  const seedIdx = findColumnIndex(header, 'seed');
  const ratingIdx = findColumnIndex(header, 'rating', 'elo', 'rank');

  if (nameIdx === -1) return [];

  return lines.slice(1).map((row) => ({
    name: row[nameIdx]?.trim() ?? '',
    seed: seedIdx !== -1 ? Number(row[seedIdx]) || undefined : undefined,
    rating: ratingIdx !== -1 ? Number(row[ratingIdx]) || undefined : undefined,
  }));
};

type ParsedTournament = {
  name: string;
  description?: string;
  format?: string;
  maxParticipants?: number;
};

export const importTournamentFromCSV = (csv: string): ParsedTournament[] => {
  const lines = parseCSVLines(csv);
  if (lines.length < 2) return [];

  const header = lines[0];
  const nameIdx = findColumnIndex(header, 'name', 'tournament');
  const descIdx = findColumnIndex(header, 'description', 'desc');
  const formatIdx = findColumnIndex(header, 'format', 'type');
  const maxIdx = findColumnIndex(
    header,
    'maxParticipants',
    'max',
    'max_participants'
  );

  if (nameIdx === -1) return [];

  return lines.slice(1).map((row) => ({
    name: row[nameIdx]?.trim() ?? '',
    description: descIdx !== -1 ? row[descIdx]?.trim() : undefined,
    format: formatIdx !== -1 ? row[formatIdx]?.trim() : undefined,
    maxParticipants:
      maxIdx !== -1 ? Number(row[maxIdx]) || undefined : undefined,
  }));
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

interface CsvSection {
  title: string;
  header: string[];
  rows: string[][];
}

const parseCSVLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  cells.push(current);
  return cells;
};

export const parseSections = (csv: string): CsvSection[] => {
  const sections: CsvSection[] = [];
  let current: CsvSection | null = null;

  for (const line of csv.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      current = { title: trimmed.slice(1).trim(), header: [], rows: [] };
      sections.push(current);
      continue;
    }
    if (!current || trimmed.length === 0) continue;
    const cells = parseCSVLine(trimmed);
    if (current.header.length === 0) {
      current.header = cells;
    } else {
      current.rows.push(cells);
    }
  }

  return sections;
};

export interface ImportedTournament {
  id?: string;
  name: string;
  description?: string;
  format?: string;
  status?: string;
  maxParticipants?: number;
  startDate?: number;
  endDate?: number;
}

export interface ImportedParticipant {
  id: string;
  tournamentId?: string;
  name: string;
  seed?: number;
  rating?: number;
  groupId?: string;
}

export interface ImportedMatch {
  id: string;
  tournamentId?: string;
  round?: number;
  bracket?: string;
  participant1Id?: string | null;
  participant2Id?: string | null;
  participant1Score?: number | null;
  participant2Score?: number | null;
  winnerId?: string | null;
  status?: string;
  scheduledAt?: number;
  venue?: string;
}

const toNumber = (value: string | undefined): number | undefined => {
  const n = Number(value);
  return value !== undefined && value !== '' && !Number.isNaN(n)
    ? n
    : undefined;
};

const toNumberOrNull = (value: string | undefined): number | null => {
  const n = Number(value);
  return value !== undefined && value !== '' && !Number.isNaN(n) ? n : null;
};

export const importTournamentDataFromCSV = (
  csv: string
): {
  tournaments: ImportedTournament[];
  participants: ImportedParticipant[];
  matches: ImportedMatch[];
} => {
  const tournaments: ImportedTournament[] = [];
  const participants: ImportedParticipant[] = [];
  const matches: ImportedMatch[] = [];

  for (const section of parseSections(csv)) {
    const title = section.title.toLowerCase();

    if (title === 'tournament' || title === 'tournaments') {
      const nameIdx = findColumnIndex(section.header, 'name', 'tournament');
      const descIdx = findColumnIndex(section.header, 'description', 'desc');
      const formatIdx = findColumnIndex(section.header, 'format', 'type');
      const statusIdx = findColumnIndex(section.header, 'status');
      const maxIdx = findColumnIndex(section.header, 'maxparticipants', 'max');
      const startIdx = findColumnIndex(section.header, 'startdate', 'start');
      const endIdx = findColumnIndex(section.header, 'enddate', 'end');

      for (const row of section.rows) {
        if (nameIdx === -1) continue;
        tournaments.push({
          name: row[nameIdx]?.trim() ?? '',
          description: descIdx !== -1 ? row[descIdx]?.trim() : undefined,
          format: formatIdx !== -1 ? row[formatIdx]?.trim() : undefined,
          status: statusIdx !== -1 ? row[statusIdx]?.trim() : undefined,
          maxParticipants: toNumber(maxIdx !== -1 ? row[maxIdx] : undefined),
          startDate: toNumber(startIdx !== -1 ? row[startIdx] : undefined),
          endDate: toNumber(endIdx !== -1 ? row[endIdx] : undefined),
        });
      }
    }

    if (title === 'participants') {
      const idIdx = findColumnIndex(section.header, 'id');
      const tournamentIdIdx = findColumnIndex(section.header, 'tournamentid');
      const nameIdx = findColumnIndex(
        section.header,
        'name',
        'participant',
        'player'
      );
      const seedIdx = findColumnIndex(section.header, 'seed');
      const ratingIdx = findColumnIndex(
        section.header,
        'rating',
        'elo',
        'rank'
      );
      const groupIdx = findColumnIndex(section.header, 'groupid', 'group');

      for (const row of section.rows) {
        if (nameIdx === -1) continue;
        participants.push({
          id:
            idIdx !== -1 && row[idIdx]
              ? row[idIdx]
              : `imported-${participants.length}`,
          tournamentId:
            tournamentIdIdx !== -1 ? row[tournamentIdIdx]?.trim() : undefined,
          name: row[nameIdx]?.trim() ?? '',
          seed: toNumber(seedIdx !== -1 ? row[seedIdx] : undefined),
          rating: toNumber(ratingIdx !== -1 ? row[ratingIdx] : undefined),
          groupId:
            groupIdx !== -1 && row[groupIdx]
              ? row[groupIdx]?.trim()
              : undefined,
        });
      }
    }

    if (title === 'matches') {
      const idIdx = findColumnIndex(section.header, 'id');
      const tournamentIdIdx = findColumnIndex(section.header, 'tournamentid');
      const roundIdx = findColumnIndex(section.header, 'round');
      const bracketIdx = findColumnIndex(section.header, 'bracket');
      const p1Idx = findColumnIndex(section.header, 'participant1id');
      const p2Idx = findColumnIndex(section.header, 'participant2id');
      const s1Idx = findColumnIndex(section.header, 'participant1score');
      const s2Idx = findColumnIndex(section.header, 'participant2score');
      const winnerIdx = findColumnIndex(section.header, 'winnerid');
      const statusIdx = findColumnIndex(section.header, 'status');
      const scheduledIdx = findColumnIndex(
        section.header,
        'scheduledat',
        'starttime'
      );
      const venueIdx = findColumnIndex(section.header, 'venue');

      for (const row of section.rows) {
        const p1 = p1Idx !== -1 ? row[p1Idx] : undefined;
        const p2 = p2Idx !== -1 ? row[p2Idx] : undefined;
        matches.push({
          id:
            idIdx !== -1 && row[idIdx]
              ? row[idIdx]
              : `imported-match-${matches.length}`,
          tournamentId:
            tournamentIdIdx !== -1 ? row[tournamentIdIdx]?.trim() : undefined,
          round: toNumber(roundIdx !== -1 ? row[roundIdx] : undefined),
          bracket:
            bracketIdx !== -1 && row[bracketIdx]
              ? row[bracketIdx]?.trim()
              : undefined,
          participant1Id: p1 && p1 !== '' ? p1 : null,
          participant2Id: p2 && p2 !== '' ? p2 : null,
          participant1Score: toNumberOrNull(
            s1Idx !== -1 ? row[s1Idx] : undefined
          ),
          participant2Score: toNumberOrNull(
            s2Idx !== -1 ? row[s2Idx] : undefined
          ),
          winnerId:
            winnerIdx !== -1 && row[winnerIdx] ? row[winnerIdx]?.trim() : null,
          status:
            statusIdx !== -1 && row[statusIdx]
              ? row[statusIdx]?.trim()
              : 'scheduled',
          scheduledAt: toNumber(
            scheduledIdx !== -1 ? row[scheduledIdx] : undefined
          ),
          venue:
            venueIdx !== -1 && row[venueIdx]
              ? row[venueIdx]?.trim()
              : undefined,
        });
      }
    }
  }

  return { tournaments, participants, matches };
};
