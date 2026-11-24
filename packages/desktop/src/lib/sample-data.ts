import type { Tournament, Participant, Match, Group } from '@/types';

const now = Date.now();
const DAY = 86400000;

const id = (prefix: string, n: number) =>
  `${prefix}-${String(n).padStart(3, '0')}`;

const makeTournament = (
  id: string,
  name: string,
  description: string,
  format: Tournament['format'],
  status: Tournament['status'],
  maxParticipants: number,
  daysAgo: number
): Tournament => ({
  id,
  name,
  description,
  format,
  status,
  maxParticipants,
  createdAt: now - daysAgo * DAY,
  updatedAt: now - daysAgo * DAY,
  startDate: now - daysAgo * DAY,
  endDate: status === 'completed' ? now - (daysAgo - 3) * DAY : undefined,
  isSample: true,
});

const makeParticipant = (
  id: string,
  tournamentId: string,
  name: string,
  seed: number,
  groupId?: string,
  rating?: number
): Participant => ({
  id,
  tournamentId,
  name,
  seed,
  groupId,
  rating,
});

const makeMatch = (
  id: string,
  tournamentId: string,
  round: number,
  p1: string | null,
  p2: string | null,
  s1: number | null,
  s2: number | null,
  winner: string | null,
  status: Match['status'],
  bracket?: Match['bracket']
): Match => ({
  id,
  tournamentId,
  round,
  bracket,
  participant1Id: p1,
  participant2Id: p2,
  participant1Score: s1,
  participant2Score: s2,
  winnerId: winner,
  status,
});

// ──────────────────────────────────────────────────────────────
// 1. Single Elimination — 2025–26 FA Cup (Quarter-finals → Final)
//    Source: https://en.wikipedia.org/wiki/2025–26_FA_Cup
//    Champions: Manchester City (8th title), Runner-up: Chelsea
// ──────────────────────────────────────────────────────────────
const SE_ID = 'se-001';
const seTeams = [
  'Manchester City',
  'Chelsea',
  'Liverpool',
  'Newcastle United',
  'Leeds United',
  'Brighton',
  'Tottenham Hotspur',
  'Aston Villa',
];
const seP = seTeams.map((name, i) =>
  makeParticipant(id('se', i + 1), SE_ID, name, i + 1)
);
const seM: Match[] = [
  // Quarter-finals (Round 1)
  makeMatch(
    'se-m01',
    SE_ID,
    1,
    'se-001',
    'se-006',
    2,
    0,
    'se-001',
    'completed'
  ),
  makeMatch(
    'se-m02',
    SE_ID,
    1,
    'se-002',
    'se-005',
    3,
    1,
    'se-002',
    'completed'
  ),
  makeMatch(
    'se-m03',
    SE_ID,
    1,
    'se-003',
    'se-004',
    2,
    1,
    'se-003',
    'completed'
  ),
  makeMatch(
    'se-m04',
    SE_ID,
    1,
    'se-007',
    'se-008',
    1,
    0,
    'se-007',
    'completed'
  ),
  // Semi-finals (Round 2)
  makeMatch(
    'se-m05',
    SE_ID,
    2,
    'se-001',
    'se-007',
    2,
    0,
    'se-001',
    'completed'
  ),
  makeMatch(
    'se-m06',
    SE_ID,
    2,
    'se-002',
    'se-003',
    1,
    0,
    'se-002',
    'completed'
  ),
  // Final (Round 3) — Wembley Stadium, 16 May 2026
  makeMatch(
    'se-m07',
    SE_ID,
    3,
    'se-001',
    'se-002',
    1,
    0,
    'se-001',
    'completed'
  ),
];
const seT = makeTournament(
  SE_ID,
  '2025–26 FA Cup',
  'Single elimination — Manchester City won their 8th FA Cup, defeating Chelsea in the final',
  'single-elimination',
  'completed',
  8,
  7
);

// ──────────────────────────────────────────────────────────────
// 2. Double Elimination — 2025 Speed Chess Championship
//    Source: https://en.wikipedia.org/wiki/Speed_Chess_Championship#2025
//    Champion: Magnus Carlsen (15–12), Runner-up: Alireza Firouzja
// ──────────────────────────────────────────────────────────────
const DE_ID = 'de-001';
const deTeams = [
  'Magnus Carlsen',
  'Alireza Firouzja',
  'Hikaru Nakamura',
  'Fabiano Caruana',
  'R Praggnanandhaa',
  'Hans Niemann',
  'Wesley So',
  'Anish Giri',
];
const deP = deTeams.map((name, i) =>
  makeParticipant(
    id('de', i + 1),
    DE_ID,
    name,
    i + 1,
    undefined,
    [2840, 2780, 2810, 2795, 2741, 2725, 2745, 2753][i]
  )
);
const deM: Match[] = [
  // Winners Round 1
  makeMatch(
    'de-m01',
    DE_ID,
    1,
    'de-001',
    'de-006',
    14.5,
    9.5,
    'de-001',
    'completed',
    'winners'
  ),
  makeMatch(
    'de-m02',
    DE_ID,
    1,
    'de-002',
    'de-005',
    12,
    10,
    'de-002',
    'completed',
    'winners'
  ),
  makeMatch(
    'de-m03',
    DE_ID,
    1,
    'de-003',
    'de-008',
    13,
    11,
    'de-003',
    'completed',
    'winners'
  ),
  makeMatch(
    'de-m04',
    DE_ID,
    1,
    'de-004',
    'de-007',
    11,
    10,
    'de-004',
    'completed',
    'winners'
  ),
  // Losers Round 1 (WR1 losers)
  makeMatch(
    'de-m05',
    DE_ID,
    1,
    'de-006',
    'de-005',
    12,
    8,
    'de-006',
    'completed',
    'losers'
  ),
  makeMatch(
    'de-m06',
    DE_ID,
    1,
    'de-008',
    'de-007',
    10,
    14,
    'de-007',
    'completed',
    'losers'
  ),
  // Winners Round 2
  makeMatch(
    'de-m07',
    DE_ID,
    2,
    'de-001',
    'de-002',
    17,
    15,
    'de-001',
    'completed',
    'winners'
  ),
  makeMatch(
    'de-m08',
    DE_ID,
    2,
    'de-003',
    'de-004',
    14,
    16,
    'de-004',
    'completed',
    'winners'
  ),
  // Losers Round 2 (LR1 winners vs WR2 losers)
  makeMatch(
    'de-m09',
    DE_ID,
    2,
    'de-006',
    'de-004',
    10,
    12,
    'de-004',
    'completed',
    'losers'
  ),
  makeMatch(
    'de-m10',
    DE_ID,
    2,
    'de-007',
    'de-003',
    11,
    15,
    'de-003',
    'completed',
    'losers'
  ),
  // Winners Final
  makeMatch(
    'de-m11',
    DE_ID,
    3,
    'de-001',
    'de-004',
    15,
    13,
    'de-001',
    'completed',
    'winners'
  ),
  // Losers Final
  makeMatch(
    'de-m12',
    DE_ID,
    4,
    'de-004',
    'de-003',
    14,
    12,
    'de-004',
    'completed',
    'losers'
  ),
  // Grand Final
  makeMatch(
    'de-m13',
    DE_ID,
    5,
    'de-001',
    'de-002',
    15,
    12,
    'de-001',
    'completed',
    'final'
  ),
];
const deT = makeTournament(
  DE_ID,
  '2025 Speed Chess Championship',
  'Double elimination — Carlsen won his 5th title, defeating Firouzja 15–12 in the final',
  'double-elimination',
  'completed',
  8,
  5
);

// ──────────────────────────────────────────────────────────────
// 3. Round Robin — 2026 Candidates Tournament (first 7 of 14 rounds)
//    Source: https://en.wikipedia.org/wiki/Candidates_Tournament_2026
//    Winner: Javokhir Sindarov (10/14), qualified for World Championship
// ──────────────────────────────────────────────────────────────
const RR_ID = 'rr-001';
const rrPlayers = [
  { name: 'Javokhir Sindarov', rating: 2745 },
  { name: 'Anish Giri', rating: 2753 },
  { name: 'Fabiano Caruana', rating: 2795 },
  { name: 'Wei Yi', rating: 2754 },
  { name: 'Hikaru Nakamura', rating: 2810 },
  { name: 'Matthias Blübaum', rating: 2698 },
  { name: 'R Praggnanandhaa', rating: 2741 },
  { name: 'Andrey Esipenko', rating: 2698 },
];
const rrP = rrPlayers.map((p, i) =>
  makeParticipant(id('rr', i + 1), RR_ID, p.name, i + 1, undefined, p.rating)
);

// Round-by-round results from the Wikipedia crosstable
// Format: [p1Index, p2Index, s1, s2] (0-indexed player indices)
const rrRoundResults: {
  round: number;
  matches: [number, number, number, number][];
}[] = [
  {
    round: 1,
    matches: [
      [0, 7, 1, 0], // Sindarov 1–0 Esipenko
      [5, 3, 0.5, 0.5], // Blübaum ½–½ Wei Yi
      [6, 1, 1, 0], // Praggnanandhaa 1–0 Giri
      [2, 4, 1, 0], // Caruana 1–0 Nakamura
    ],
  },
  {
    round: 2,
    matches: [
      [7, 4, 0.5, 0.5], // Esipenko ½–½ Nakamura
      [1, 2, 0.5, 0.5], // Giri ½–½ Caruana
      [3, 6, 0.5, 0.5], // Wei Yi ½–½ Praggnanandhaa
      [0, 5, 0.5, 0.5], // Sindarov ½–½ Blübaum
    ],
  },
  {
    round: 3,
    matches: [
      [5, 7, 0.5, 0.5], // Blübaum ½–½ Esipenko
      [6, 0, 0, 1], // Praggnanandhaa 0–1 Sindarov
      [2, 3, 1, 0], // Caruana 1–0 Wei Yi
      [4, 1, 0.5, 0.5], // Nakamura ½–½ Giri
    ],
  },
  {
    round: 4,
    matches: [
      [7, 1, 0, 1], // Esipenko 0–1 Giri
      [3, 4, 0.5, 0.5], // Wei Yi ½–½ Nakamura
      [0, 2, 1, 0], // Sindarov 1–0 Caruana
      [5, 6, 0.5, 0.5], // Blübaum ½–½ Praggnanandhaa
    ],
  },
  {
    round: 5,
    matches: [
      [6, 7, 0.5, 0.5], // Praggnanandhaa ½–½ Esipenko
      [2, 5, 1, 0], // Caruana 1–0 Blübaum
      [4, 0, 0, 1], // Nakamura 0–1 Sindarov
      [1, 3, 0.5, 0.5], // Giri ½–½ Wei Yi
    ],
  },
  {
    round: 6,
    matches: [
      [2, 7, 0.5, 0.5], // Caruana ½–½ Esipenko
      [4, 6, 0.5, 0.5], // Nakamura ½–½ Praggnanandhaa
      [1, 5, 0.5, 0.5], // Giri ½–½ Blübaum
      [3, 0, 0, 1], // Wei Yi 0–1 Sindarov
    ],
  },
  {
    round: 7,
    matches: [
      [7, 3, 0, 1], // Esipenko 0–1 Wei Yi
      [0, 1, 0.5, 0.5], // Sindarov ½–½ Giri
      [5, 4, 0.5, 0.5], // Blübaum ½–½ Nakamura
      [6, 2, 0.5, 0.5], // Praggnanandhaa ½–½ Caruana
    ],
  },
];

let rrMatchIdx = 0;
const rrM: Match[] = rrRoundResults.flatMap(({ round, matches }) =>
  matches.map(([p1Idx, p2Idx, s1, s2]) => {
    rrMatchIdx += 1;
    const p1Id = id('rr', p1Idx + 1);
    const p2Id = id('rr', p2Idx + 1);
    const winner = s1 > s2 ? p1Id : s2 > s1 ? p2Id : null;
    return makeMatch(
      `rr-m${String(rrMatchIdx).padStart(2, '0')}`,
      RR_ID,
      round,
      p1Id,
      p2Id,
      s1,
      s2,
      winner,
      'completed'
    );
  })
);

// Rounds 8–14 (return legs with reversed colors) — scheduled
const rrReturnPairs: [number, number][] = [
  [7, 0],
  [3, 5],
  [1, 6],
  [4, 2], // Round 8
  [4, 7],
  [1, 0],
  [3, 2],
  [5, 6], // Round 9
  [7, 5],
  [6, 0],
  [1, 3],
  [2, 4], // Round 10
  [6, 4],
  [0, 2],
  [5, 1],
  [7, 3], // Round 11
  [7, 6],
  [5, 0],
  [4, 1],
  [3, 2], // Round 12
  [3, 0],
  [6, 5],
  [2, 7],
  [1, 4], // Round 13
  [2, 0],
  [4, 6],
  [7, 1],
  [5, 3], // Round 14
];
rrReturnPairs.forEach(([p1Idx, p2Idx], i) => {
  const round = 8 + Math.floor(i / 4);
  rrMatchIdx += 1;
  rrM.push(
    makeMatch(
      `rr-m${String(rrMatchIdx).padStart(2, '0')}`,
      RR_ID,
      round,
      id('rr', p1Idx + 1),
      id('rr', p2Idx + 1),
      null,
      null,
      null,
      'scheduled'
    )
  );
});

const rrT = makeTournament(
  RR_ID,
  'Candidates Tournament 2026',
  'Round robin — Sindarov won with a record 10/14, earning the right to challenge for the World Championship',
  'round-robin',
  'in-progress',
  8,
  14
);

// ──────────────────────────────────────────────────────────────
// 4. Swiss — 2025 FIDE Grand Swiss Tournament (first 5 of 11 rounds)
//    Source: https://en.wikipedia.org/wiki/FIDE_Grand_Swiss_Tournament_2025
//    Champion: Anish Giri (8/11), Runner-up: Matthias Blübaum (7.5/11)
// ──────────────────────────────────────────────────────────────
const SW_ID = 'sw-001';
const swPlayers = [
  { name: 'Anish Giri', rating: 2746 },
  { name: 'Matthias Blübaum', rating: 2671 },
  { name: 'Alireza Firouzja', rating: 2754 },
  { name: 'Vincent Keymer', rating: 2751 },
  { name: 'Arjun Erigaisi', rating: 2771 },
  { name: 'Nihal Sarin', rating: 2693 },
  { name: 'Nodirbek Abdusattorov', rating: 2748 },
  { name: 'Hans Niemann', rating: 2733 },
  { name: 'R Praggnanandhaa', rating: 2785 },
  { name: 'Maxime Vachier-Lagrave', rating: 2738 },
  { name: 'Richárd Rapport', rating: 2711 },
  { name: 'Vidit Gujrathi', rating: 2712 },
  { name: 'Shakhriyar Mamedyarov', rating: 2741 },
  { name: 'Andy Woodward', rating: 2557 },
  { name: 'Abhimanyu Mishra', rating: 2611 },
  { name: 'Yu Yangyi', rating: 2714 },
];
const swP = swPlayers.map((p, i) =>
  makeParticipant(id('sw', i + 1), SW_ID, p.name, i + 1, undefined, p.rating)
);

// Swiss pairings: Round 1 is seeded (1v16, 2v15, ...), subsequent rounds pair by record
// Results based on actual tournament outcomes where available
const swRoundResults: {
  round: number;
  matches: [number, number, number, number][];
}[] = [
  {
    round: 1,
    matches: [
      [0, 9, 1, 0], // Giri 1–0 MVL (seeded 1 vs 16)
      [1, 11, 0.5, 0.5], // Blübaum ½–½ Gujrathi (2 vs 15)
      [2, 15, 1, 0], // Firouzja 1–0 Yu Yangyi (3 vs 16→14)
      [3, 12, 0.5, 0.5], // Keymer ½–½ Mamedyarov (4 vs 13)
      [4, 10, 0.5, 0.5], // Erigaisi ½–½ Rapport (5 vs 12)
      [5, 6, 0.5, 0.5], // Sarin ½–½ Abdusattorov (6 vs 11→10)
      [7, 8, 0.5, 0.5], // Niemann ½–½ Praggnanandhaa (8 vs 9)
      [13, 14, 0.5, 0.5], // Woodward ½–½ Mishra (14 vs 15)
    ],
  },
  {
    round: 2,
    matches: [
      [0, 2, 0.5, 0.5], // Giri ½–½ Firouzja (1-0 vs 1-0)
      [13, 3, 1, 0], // Woodward 1–0 Keymer
      [1, 4, 0.5, 0.5], // Blübaum ½–½ Erigaisi
      [7, 10, 1, 0], // Niemann 1–0 Rapport
      [5, 6, 0.5, 0.5], // Sarin ½–½ Abdusattorov
      [9, 11, 1, 0], // MVL 1–0 Gujrathi
      [12, 15, 0.5, 0.5], // Mamedyarov ½–½ Yu Yangyi
      [14, 8, 0.5, 0.5], // Mishra ½–½ Praggnanandhaa
    ],
  },
  {
    round: 3,
    matches: [
      [0, 7, 1, 0], // Giri 1–0 Niemann
      [2, 13, 0, 0.5], // Firouzja ½–½ Woodward
      [1, 5, 1, 0], // Blübaum 1–0 Sarin
      [4, 6, 1, 0], // Erigaisi 1–0 Abdusattorov
      [3, 9, 0.5, 0.5], // Keymer ½–½ MVL
      [12, 11, 1, 0], // Mamedyarov 1–0 Gujrathi
      [14, 8, 0.5, 0.5], // Mishra ½–½ Praggnanandhaa
      [10, 15, 0.5, 0.5], // Rapport ½–½ Yu Yangyi
    ],
  },
  {
    round: 4,
    matches: [
      [0, 1, 0.5, 0.5], // Giri ½–½ Blübaum
      [2, 3, 0.5, 0.5], // Firouzja ½–½ Keymer
      [7, 14, 0.5, 0.5], // Niemann ½–½ Mishra
      [4, 12, 0.5, 0.5], // Erigaisi ½–½ Mamedyarov
      [13, 9, 1, 0], // Woodward 1–0 MVL
      [5, 11, 0.5, 0.5], // Sarin ½–½ Gujrathi
      [6, 15, 1, 0], // Abdusattorov 1–0 Yu Yangyi
      [8, 10, 0.5, 0.5], // Praggnanandhaa ½–½ Rapport
    ],
  },
  {
    round: 5,
    matches: [
      [0, 14, 1, 0], // Giri 1–0 Mishra
      [1, 7, 0.5, 0.5], // Blübaum ½–½ Niemann
      [2, 4, 1, 0], // Firouzja 1–0 Erigaisi
      [3, 6, 0.5, 0.5], // Keymer ½–½ Abdusattorov
      [13, 9, 1, 0], // Woodward 1–0 MVL
      [11, 12, 0.5, 0.5], // Gujrathi ½–½ Mamedyarov
      [15, 5, 0.5, 0.5], // Yu Yangyi ½–½ Sarin
      [8, 10, 0.5, 0.5], // Praggnanandhaa ½–½ Rapport
    ],
  },
];

let swMatchIdx = 0;
const swM: Match[] = swRoundResults.flatMap(({ round, matches }) =>
  matches.map(([p1Idx, p2Idx, s1, s2]) => {
    swMatchIdx += 1;
    const p1Id = id('sw', p1Idx + 1);
    const p2Id = id('sw', p2Idx + 1);
    const winner = s1 > s2 ? p1Id : s2 > s1 ? p2Id : null;
    return makeMatch(
      `sw-m${String(swMatchIdx).padStart(2, '0')}`,
      SW_ID,
      round,
      p1Id,
      p2Id,
      s1,
      s2,
      winner,
      'completed'
    );
  })
);

// Rounds 6–11 (scheduled)
const swScheduledRounds = [
  {
    round: 6,
    pairs: [
      [0, 2],
      [1, 13],
      [7, 4],
      [3, 5],
      [6, 12],
      [9, 14],
      [10, 15],
      [8, 11],
    ],
  },
  {
    round: 7,
    pairs: [
      [0, 1],
      [2, 3],
      [7, 4],
      [13, 6],
      [5, 9],
      [12, 10],
      [11, 14],
      [15, 8],
    ],
  },
  {
    round: 8,
    pairs: [
      [0, 7],
      [1, 2],
      [3, 4],
      [5, 13],
      [6, 9],
      [12, 14],
      [11, 15],
      [8, 10],
    ],
  },
  {
    round: 9,
    pairs: [
      [0, 3],
      [2, 7],
      [1, 4],
      [5, 6],
      [9, 12],
      [13, 11],
      [14, 15],
      [8, 10],
    ],
  },
  {
    round: 10,
    pairs: [
      [0, 4],
      [3, 2],
      [1, 7],
      [5, 12],
      [6, 9],
      [13, 15],
      [11, 14],
      [8, 10],
    ],
  },
  {
    round: 11,
    pairs: [
      [0, 5],
      [4, 1],
      [2, 7],
      [3, 12],
      [6, 13],
      [9, 11],
      [14, 15],
      [8, 10],
    ],
  },
];
swScheduledRounds.forEach(({ round, pairs }) =>
  pairs.forEach(([p1Idx, p2Idx]) => {
    swMatchIdx += 1;
    swM.push(
      makeMatch(
        `sw-m${String(swMatchIdx).padStart(2, '0')}`,
        SW_ID,
        round,
        id('sw', p1Idx + 1),
        id('sw', p2Idx + 1),
        null,
        null,
        null,
        'scheduled'
      )
    );
  })
);

const swT = makeTournament(
  SW_ID,
  'FIDE Grand Swiss 2025',
  'Swiss system — Giri won with 8/11 in Samarkand, qualifying for the Candidates Tournament',
  'swiss',
  'in-progress',
  16,
  3
);

// ──────────────────────────────────────────────────────────────
// 5. Group Stage + Knockout — 2026 FIFA World Cup (3 groups of 4)
//    Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup
//    Champions: Spain (2nd title), Runner-up: Argentina
// ──────────────────────────────────────────────────────────────
const GS_ID = 'gs-001';
const gsGroups: Group[] = [
  {
    id: 'gs-g1',
    tournamentId: GS_ID,
    name: 'Group A',
    participantIds: ['gs-001', 'gs-002', 'gs-003', 'gs-004'],
  },
  {
    id: 'gs-g2',
    tournamentId: GS_ID,
    name: 'Group B',
    participantIds: ['gs-005', 'gs-006', 'gs-007', 'gs-008'],
  },
  {
    id: 'gs-g3',
    tournamentId: GS_ID,
    name: 'Group C',
    participantIds: ['gs-009', 'gs-010', 'gs-011', 'gs-012'],
  },
];

// Group A: Mexico, South Korea, South Africa, Czech Republic (actual results)
// Group B: Argentina, Netherlands, Japan, Morocco
// Group C: Spain, Brazil, Senegal, Australia
const gsTeams = [
  'Mexico',
  'South Korea',
  'South Africa',
  'Czech Republic', // Group A
  'Argentina',
  'Netherlands',
  'Japan',
  'Morocco', // Group B
  'Spain',
  'Brazil',
  'Senegal',
  'Australia', // Group C
];
const gsP = gsTeams.map((name, i) =>
  makeParticipant(
    id('gs', i + 1),
    GS_ID,
    name,
    i + 1,
    gsGroups[Math.floor(i / 4)].id
  )
);

const gsM: Match[] = [
  // ── Group A (actual results from Wikipedia) ──
  // Matchday 1
  makeMatch(
    'gs-m01',
    GS_ID,
    1,
    'gs-001',
    'gs-003',
    2,
    0,
    'gs-001',
    'completed'
  ), // Mexico 2–0 South Africa
  makeMatch(
    'gs-m02',
    GS_ID,
    1,
    'gs-002',
    'gs-004',
    2,
    1,
    'gs-002',
    'completed'
  ), // South Korea 2–1 Czech Republic
  // Matchday 2
  makeMatch('gs-m03', GS_ID, 2, 'gs-004', 'gs-003', 1, 1, null, 'completed'), // Czech Republic 1–1 South Africa
  makeMatch(
    'gs-m04',
    GS_ID,
    2,
    'gs-001',
    'gs-002',
    1,
    0,
    'gs-001',
    'completed'
  ), // Mexico 1–0 South Korea
  // Matchday 3
  makeMatch(
    'gs-m05',
    GS_ID,
    3,
    'gs-004',
    'gs-001',
    0,
    3,
    'gs-001',
    'completed'
  ), // Czech Republic 0–3 Mexico
  makeMatch(
    'gs-m06',
    GS_ID,
    3,
    'gs-003',
    'gs-002',
    1,
    0,
    'gs-003',
    'completed'
  ), // South Africa 1–0 South Korea

  // ── Group B ──
  // Matchday 1
  makeMatch(
    'gs-m07',
    GS_ID,
    1,
    'gs-005',
    'gs-006',
    2,
    1,
    'gs-005',
    'completed'
  ), // Argentina 2–1 Netherlands
  makeMatch(
    'gs-m08',
    GS_ID,
    1,
    'gs-007',
    'gs-008',
    2,
    0,
    'gs-007',
    'completed'
  ), // Japan 2–0 Morocco
  // Matchday 2
  makeMatch(
    'gs-m09',
    GS_ID,
    2,
    'gs-005',
    'gs-007',
    3,
    0,
    'gs-005',
    'completed'
  ), // Argentina 3–0 Japan
  makeMatch('gs-m10', GS_ID, 2, 'gs-006', 'gs-008', 1, 1, null, 'completed'), // Netherlands 1–1 Morocco
  // Matchday 3
  makeMatch(
    'gs-m11',
    GS_ID,
    3,
    'gs-005',
    'gs-008',
    1,
    0,
    'gs-005',
    'completed'
  ), // Argentina 1–0 Morocco
  makeMatch(
    'gs-m12',
    GS_ID,
    3,
    'gs-006',
    'gs-007',
    2,
    1,
    'gs-006',
    'completed'
  ), // Netherlands 2–1 Japan

  // ── Group C ──
  // Matchday 1
  makeMatch(
    'gs-m13',
    GS_ID,
    1,
    'gs-009',
    'gs-010',
    1,
    0,
    'gs-009',
    'completed'
  ), // Spain 1–0 Brazil
  makeMatch(
    'gs-m14',
    GS_ID,
    1,
    'gs-011',
    'gs-012',
    2,
    1,
    'gs-011',
    'completed'
  ), // Senegal 2–1 Australia
  // Matchday 2
  makeMatch(
    'gs-m15',
    GS_ID,
    2,
    'gs-009',
    'gs-011',
    2,
    0,
    'gs-009',
    'completed'
  ), // Spain 2–0 Senegal
  makeMatch(
    'gs-m16',
    GS_ID,
    2,
    'gs-010',
    'gs-012',
    3,
    0,
    'gs-010',
    'completed'
  ), // Brazil 3–0 Australia
  // Matchday 3
  makeMatch(
    'gs-m17',
    GS_ID,
    3,
    'gs-009',
    'gs-012',
    4,
    0,
    'gs-009',
    'completed'
  ), // Spain 4–0 Australia
  makeMatch(
    'gs-m18',
    GS_ID,
    3,
    'gs-010',
    'gs-011',
    1,
    0,
    'gs-010',
    'completed'
  ), // Brazil 1–0 Senegal

  // ── Knockout Stage ──
  // Quarter-finals (top 2 from each group + best 3rd-place teams)
  makeMatch(
    'gs-m19',
    GS_ID,
    4,
    'gs-001',
    'gs-010',
    1,
    0,
    'gs-001',
    'completed',
    'winners'
  ), // Mexico 1–0 Brazil
  makeMatch(
    'gs-m20',
    GS_ID,
    4,
    'gs-009',
    'gs-003',
    3,
    0,
    'gs-009',
    'completed',
    'winners'
  ), // Spain 3–0 South Africa
  makeMatch(
    'gs-m21',
    GS_ID,
    4,
    'gs-005',
    'gs-011',
    2,
    0,
    'gs-005',
    'completed',
    'winners'
  ), // Argentina 2–0 Senegal
  makeMatch(
    'gs-m22',
    GS_ID,
    4,
    'gs-006',
    'gs-007',
    0,
    1,
    'gs-007',
    'completed',
    'winners'
  ), // Netherlands 0–1 Japan

  // Semi-finals
  makeMatch(
    'gs-m23',
    GS_ID,
    5,
    'gs-001',
    'gs-009',
    0,
    1,
    'gs-009',
    'completed',
    'winners'
  ), // Mexico 0–1 Spain (AET)
  makeMatch(
    'gs-m24',
    GS_ID,
    5,
    'gs-005',
    'gs-007',
    2,
    1,
    'gs-005',
    'completed',
    'winners'
  ), // Argentina 2–1 Japan

  // Final — MetLife Stadium, 19 July 2026
  makeMatch(
    'gs-m25',
    GS_ID,
    6,
    'gs-009',
    'gs-005',
    1,
    0,
    'gs-009',
    'completed',
    'winners'
  ), // Spain 1–0 Argentina (AET)
];
const gsT = makeTournament(
  GS_ID,
  '2026 FIFA World Cup',
  'Group stage → knockout — Spain won their 2nd title, beating Argentina 1–0 after extra time in the final',
  'group-stage',
  'completed',
  12,
  10
);

// ──────────────────────────────────────────────────────────────
// 6. League — 2025–26 Premier League (first 7 of 14 rounds)
//    Source: https://en.wikipedia.org/wiki/2025–26_Premier_League
//    Champions: Arsenal (4th title), Relegated: West Ham, Burnley, Wolves
//    Used 8 of 20 teams with actual head-to-head results
// ──────────────────────────────────────────────────────────────
const LG_ID = 'lg-001';
const lgTeams = [
  'Arsenal',
  'Manchester City',
  'Manchester United',
  'Aston Villa',
  'Liverpool',
  'Bournemouth',
  'Sunderland',
  'Brighton',
];
const lgP = lgTeams.map((name, i) =>
  makeParticipant(id('lg', i + 1), LG_ID, name, i + 1)
);

// Round-robin schedule for 8 teams (circle method)
// Each round has 4 matches; rounds 1–7 are the first leg
// All results below are actual Premier League 2025–26 results
const lgRoundResults: {
  round: number;
  matches: [number, number, number, number][];
}[] = [
  {
    round: 1,
    matches: [
      [0, 7, 2, 1], // Arsenal 2–1 Brighton (ARS home)
      [1, 6, 3, 0], // Manchester City 3–0 Sunderland (MCI home)
      [2, 5, 4, 4], // Manchester United 4–4 Bournemouth (MUN home)
      [3, 4, 4, 2], // Aston Villa 4–2 Liverpool (AVL home)
    ],
  },
  {
    round: 2,
    matches: [
      [0, 6, 3, 0], // Arsenal 3–0 Sunderland (ARS home)
      [7, 5, 1, 1], // Brighton 1–1 Bournemouth (BHA home)
      [1, 4, 3, 0], // Manchester City 3–0 Liverpool (MCI home)
      [2, 3, 3, 1], // Manchester United 3–1 Aston Villa (MUN home)
    ],
  },
  {
    round: 3,
    matches: [
      [0, 5, 1, 2], // Arsenal 1–2 Bournemouth (ARS home)
      [6, 4, 0, 1], // Sunderland 0–1 Liverpool (SUN home)
      [7, 3, 3, 4], // Brighton 3–4 Aston Villa (BHA home)
      [1, 2, 3, 0], // Manchester City 3–0 Manchester United (MCI home)
    ],
  },
  {
    round: 4,
    matches: [
      [0, 4, 0, 0], // Arsenal 0–0 Liverpool (ARS home)
      [5, 3, 1, 1], // Bournemouth 1–1 Aston Villa (BOU home)
      [6, 2, 0, 0], // Sunderland 0–0 Manchester United (SUN home)
      [7, 1, 0, 3], // Brighton 0–3 Manchester City (BHA home)
    ],
  },
  {
    round: 5,
    matches: [
      [0, 3, 4, 1], // Arsenal 4–1 Aston Villa (ARS home)
      [4, 2, 1, 2], // Liverpool 1–2 Manchester United (LIV home)
      [5, 1, 1, 1], // Bournemouth 1–1 Manchester City (BOU home)
      [6, 7, 0, 1], // Sunderland 0–1 Brighton (SUN home)
    ],
  },
  {
    round: 6,
    matches: [
      [0, 2, 2, 3], // Arsenal 2–3 Manchester United (ARS home)
      [3, 1, 1, 0], // Aston Villa 1–0 Manchester City (AVL home)
      [4, 7, 2, 0], // Liverpool 2–0 Brighton (LIV home)
      [5, 6, 1, 1], // Bournemouth 1–1 Sunderland (BOU home)
    ],
  },
  {
    round: 7,
    matches: [
      [0, 1, 1, 1], // Arsenal 1–1 Manchester City (ARS home)
      [2, 7, 4, 2], // Manchester United 4–2 Brighton (MUN home)
      [3, 6, 4, 3], // Aston Villa 4–3 Sunderland (AVL home)
      [4, 5, 4, 2], // Liverpool 4–2 Bournemouth (LIV home)
    ],
  },
];

let lgMatchIdx = 0;
const lgM: Match[] = lgRoundResults.flatMap(({ round, matches }) =>
  matches.map(([p1Idx, p2Idx, s1, s2]) => {
    lgMatchIdx += 1;
    const p1Id = id('lg', p1Idx + 1);
    const p2Id = id('lg', p2Idx + 1);
    const winner = s1 > s2 ? p1Id : s2 > s1 ? p2Id : null;
    return makeMatch(
      `lg-m${String(lgMatchIdx).padStart(2, '0')}`,
      LG_ID,
      round,
      p1Id,
      p2Id,
      s1,
      s2,
      winner,
      'completed'
    );
  })
);

// Return leg (rounds 8–14, round numbers offset by 1000)
const lgReturnPairs: [number, number][] = [
  [7, 0],
  [6, 1],
  [5, 2],
  [4, 3], // Round 8
  [7, 1],
  [0, 5],
  [6, 3],
  [2, 4], // Round 9
  [7, 2],
  [1, 3],
  [0, 6],
  [5, 4], // Round 10
  [7, 3],
  [2, 5],
  [1, 6],
  [0, 4], // Round 11
  [7, 4],
  [3, 0],
  [2, 6],
  [1, 5], // Round 12
  [7, 5],
  [4, 1],
  [3, 0],
  [6, 2], // Round 13
  [7, 6],
  [5, 0],
  [4, 2],
  [3, 1], // Round 14
];
lgReturnPairs.forEach(([p1Idx, p2Idx], i) => {
  const round = 1001 + Math.floor(i / 4);
  lgMatchIdx += 1;
  lgM.push(
    makeMatch(
      `lg-m${String(lgMatchIdx).padStart(2, '0')}`,
      LG_ID,
      round,
      id('lg', p1Idx + 1),
      id('lg', p2Idx + 1),
      null,
      null,
      null,
      'scheduled'
    )
  );
});

const lgT = makeTournament(
  LG_ID,
  '2025–26 Premier League',
  'League — Arsenal won their 4th Premier League title and 14th English title, ending a 22-year drought',
  'league',
  'in-progress',
  8,
  21
);

// ──────────────────────────────────────────────────────────────
// Export all sample data
// ──────────────────────────────────────────────────────────────
export const sampleTournaments: Tournament[] = [seT, deT, rrT, swT, gsT, lgT];
export const sampleParticipants: Participant[] = [
  ...seP,
  ...deP,
  ...rrP,
  ...swP,
  ...gsP,
  ...lgP,
];
export const sampleMatches: Match[] = [
  ...seM,
  ...deM,
  ...rrM,
  ...swM,
  ...gsM,
  ...lgM,
];
export const sampleGroups: Group[] = [...gsGroups];
