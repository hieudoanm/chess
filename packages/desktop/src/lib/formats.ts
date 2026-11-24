import type {
  BestOf,
  Group,
  Match,
  MatchScoringRule,
  Participant,
  Tiebreaker,
  TournamentFormat,
} from '@/types';
import { calculateStandings } from './standings';

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createMatch = (data: Omit<Match, 'id'>): Match => ({
  ...data,
  id: generateId(),
});

const padToPowerOfTwo = (ids: (string | null)[]): (string | null)[] => {
  const target = Math.pow(2, Math.ceil(Math.log2(ids.length || 1)));
  return [...ids, ...Array(target - ids.length).fill(null)];
};

export interface BracketOptions {
  thirdPlacePlayoff?: boolean;
}

export interface GroupStageOptions extends BracketOptions {
  groupCount?: number;
}

export const generateSingleEliminationBracket = (
  tournamentId: string,
  participantIds: string[],
  options: BracketOptions = {}
): Match[] => {
  const matches: Match[] = [];
  const padded = padToPowerOfTwo([...participantIds]);

  if (padded.length < 2) return matches;

  const roundCount = Math.log2(padded.length);
  let currentSlots: (string | null)[] = [...padded];

  for (let round = 1; round < roundCount; round++) {
    const nextSlots: (string | null)[] = [];

    for (let i = 0; i < currentSlots.length; i += 2) {
      const match = createMatch({
        tournamentId,
        round,
        participant1Id: currentSlots[i] ?? null,
        participant2Id: currentSlots[i + 1] ?? null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      });
      matches.push(match);
      nextSlots.push(match.id);
    }

    currentSlots = nextSlots;
  }

  matches.push(
    createMatch({
      tournamentId,
      round: roundCount,
      participant1Id: currentSlots[0] ?? null,
      participant2Id: currentSlots[1] ?? null,
      participant1Score: null,
      participant2Score: null,
      winnerId: null,
      status: 'scheduled',
    })
  );

  if (options.thirdPlacePlayoff && roundCount >= 2) {
    matches.push(
      createMatch({
        tournamentId,
        round: roundCount,
        participant1Id: null,
        participant2Id: null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
        isThirdPlaceMatch: true,
      })
    );
  }

  return matches;
};

export const generateDoubleEliminationBracket = (
  tournamentId: string,
  participantIds: string[]
): Match[] => {
  const matches: Match[] = [];
  const padded = padToPowerOfTwo([...participantIds]);
  const winnersRounds = Math.log2(padded.length);

  const winnersRoundMatchIds: string[][] = [];
  let winnersSlots: (string | null)[] = [...padded];

  for (let round = 1; round <= winnersRounds; round++) {
    const roundIds: string[] = [];
    const nextSlots: (string | null)[] = [];

    for (let i = 0; i < winnersSlots.length; i += 2) {
      const match = createMatch({
        tournamentId,
        round,
        bracket: 'winners',
        participant1Id: winnersSlots[i] ?? null,
        participant2Id: winnersSlots[i + 1] ?? null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      });
      matches.push(match);
      roundIds.push(match.id);
      nextSlots.push(match.id);
    }

    winnersRoundMatchIds.push(roundIds);
    winnersSlots = nextSlots;
  }

  const losersRoundCount = winnersRounds === 1 ? 0 : (winnersRounds - 1) * 2;
  let losersSlots: string[] = [];

  for (let round = 1; round <= losersRoundCount; round++) {
    const isDropRound = round % 2 === 1;

    if (isDropRound) {
      const winnersRoundIdx = Math.ceil(round / 2) - 1;
      if (
        winnersRoundIdx >= 0 &&
        winnersRoundIdx < winnersRoundMatchIds.length
      ) {
        const dropped = winnersRoundMatchIds[winnersRoundIdx].map(
          (_, i) => `W${winnersRoundIdx + 1}-L${i}`
        );
        losersSlots.push(...dropped);
      }
    }

    const roundMatchIds: string[] = [];

    for (let i = 0; i < losersSlots.length; i += 2) {
      if (i + 1 >= losersSlots.length) {
        roundMatchIds.push(losersSlots[i]);
        break;
      }

      const match = createMatch({
        tournamentId,
        round: winnersRounds + round,
        bracket: 'losers',
        participant1Id: null,
        participant2Id: null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      });
      matches.push(match);
      roundMatchIds.push(match.id);
    }

    losersSlots = [...roundMatchIds];
  }

  if (losersRoundCount > 0) {
    matches.push(
      createMatch({
        tournamentId,
        round: winnersRounds + losersRoundCount + 1,
        bracket: 'final',
        participant1Id: null,
        participant2Id: null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      })
    );
  }

  return matches;
};

export const generateRoundRobinSchedule = (
  tournamentId: string,
  participantIds: string[]
): Match[] => {
  const matches: Match[] = [];
  const ids = [...participantIds];
  const hasBye = ids.length % 2 !== 0;

  if (hasBye) {
    ids.push('BYE');
  }

  const roundCount = ids.length - 1;
  const fixed = ids[0];
  const rotating = ids.slice(1);

  for (let round = 0; round < roundCount; round++) {
    const pairing = [fixed, ...rotating];

    for (let i = 0; i < pairing.length / 2; i++) {
      const p1 = pairing[i];
      const p2 = pairing[pairing.length - 1 - i];

      if (p1 === 'BYE' || p2 === 'BYE') continue;

      matches.push(
        createMatch({
          tournamentId,
          round: round + 1,
          participant1Id: p1,
          participant2Id: p2,
          participant1Score: null,
          participant2Score: null,
          winnerId: null,
          status: 'scheduled',
        })
      );
    }

    if (rotating.length > 0) {
      const last = rotating.pop()!;
      rotating.unshift(last);
    }
  }

  return matches;
};

export const generateSwissRounds = (
  tournamentId: string,
  participantIds: string[],
  roundCount?: number
): Match[] => {
  const matches: Match[] = [];
  const rounds = roundCount ?? Math.ceil(Math.log2(participantIds.length));
  const hasBye = participantIds.length % 2 !== 0;
  const slots: (string | null)[] = hasBye
    ? [...participantIds, null]
    : [...participantIds];

  for (let round = 1; round <= rounds; round++) {
    const roundSlots: (string | null)[] =
      round === 1 ? [...slots] : [...slots].sort(() => Math.random() - 0.5);

    for (let i = 0; i < roundSlots.length; i += 2) {
      const p1 = roundSlots[i];
      const p2 = roundSlots[i + 1];

      if (p1 === null || p2 === null) continue;

      matches.push(
        createMatch({
          tournamentId,
          round,
          participant1Id: p1,
          participant2Id: p2,
          participant1Score: null,
          participant2Score: null,
          winnerId: null,
          status: 'scheduled',
        })
      );
    }
  }

  return matches;
};

export const generateGroupStageKnockout = (
  tournamentId: string,
  participantIds: string[],
  options: GroupStageOptions = {}
): Match[] => {
  const matches: Match[] = [];
  const groupCount = options.groupCount ?? 4;
  const shuffled = [...participantIds].sort(() => Math.random() - 0.5);
  const groupSize = Math.ceil(shuffled.length / groupCount);

  const groups: string[][] = [];

  for (let i = 0; i < groupCount; i++) {
    const members = shuffled.slice(i * groupSize, (i + 1) * groupSize);
    if (members.length >= 2) {
      groups.push(members);
    }
  }

  for (let g = 0; g < groups.length; g++) {
    const groupMatches = generateRoundRobinSchedule(tournamentId, groups[g]);

    for (const match of groupMatches) {
      matches.push({
        ...match,
        round: match.round + g * 1000,
      });
    }
  }

  const qualifyingTeams = Math.min(groups.length * 2, participantIds.length);
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(qualifyingTeams)));
  const knockoutRoundBase = (groups.length + 1) * 1000;

  const bracketSlots: (string | null)[] = Array(bracketSize).fill(null);

  for (let g = 0; g < groups.length; g++) {
    const pos1Idx = g * 2;
    const pos2Idx = g * 2 + 1;

    if (pos1Idx < bracketSlots.length) {
      bracketSlots[pos1Idx] = null;
    }
    if (pos2Idx < bracketSlots.length) {
      bracketSlots[pos2Idx] = null;
    }
  }

  const knockoutRounds = Math.log2(bracketSize);
  let currentSlots: (string | null)[] = [...bracketSlots];

  for (let r = 0; r < knockoutRounds; r++) {
    const nextSlots: (string | null)[] = [];

    for (let i = 0; i < currentSlots.length; i += 2) {
      const match = createMatch({
        tournamentId,
        round: knockoutRoundBase + r + 1,
        bracket: 'final',
        participant1Id: currentSlots[i] ?? null,
        participant2Id: currentSlots[i + 1] ?? null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      });
      matches.push(match);
      nextSlots.push(match.id);
    }

    currentSlots = nextSlots;
  }

  if (options.thirdPlacePlayoff && knockoutRounds >= 2) {
    matches.push(
      createMatch({
        tournamentId,
        round: knockoutRoundBase + knockoutRounds,
        bracket: 'final',
        participant1Id: null,
        participant2Id: null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
        isThirdPlaceMatch: true,
      })
    );
  }

  return matches;
};

export const generateLeagueSchedule = (
  tournamentId: string,
  participantIds: string[]
): Match[] => {
  const firstLeg = generateRoundRobinSchedule(tournamentId, participantIds);

  const returnLeg = firstLeg.map((match) =>
    createMatch({
      tournamentId,
      round: match.round + 1000,
      participant1Id: match.participant2Id,
      participant2Id: match.participant1Id,
      participant1Score: null,
      participant2Score: null,
      winnerId: null,
      status: 'scheduled',
    })
  );

  return [...firstLeg, ...returnLeg];
};

export const generateBracket = (
  format: TournamentFormat,
  tournamentId: string,
  participantIds: string[],
  options: GroupStageOptions = {}
): Match[] => {
  switch (format) {
    case 'single-elimination':
      return generateSingleEliminationBracket(
        tournamentId,
        participantIds,
        options
      );
    case 'double-elimination':
      return generateDoubleEliminationBracket(tournamentId, participantIds);
    case 'round-robin':
      return generateRoundRobinSchedule(tournamentId, participantIds);
    case 'swiss':
      return generateSwissRounds(tournamentId, participantIds);
    case 'group-stage':
      return generateGroupStageKnockout(tournamentId, participantIds, options);
    case 'league':
      return generateLeagueSchedule(tournamentId, participantIds);
    default:
      return [];
  }
};

export const getNextRoundMatches = (
  matches: Match[],
  matchId: string
): Match[] =>
  matches.filter(
    (m) => m.participant1Id === matchId || m.participant2Id === matchId
  );

export interface AdvanceBracketOptions {
  groups?: Group[];
  participants?: Participant[];
  scoringRule?: MatchScoringRule;
  tiebreakers?: Tiebreaker[];
  bestOf?: BestOf;
}

const promoteGroupStage = (
  matches: Match[],
  options: AdvanceBracketOptions
): Match[] => {
  const { groups = [], participants = [] } = options;
  if (groups.length === 0 || participants.length === 0) return matches;

  const groupPhaseDone = matches
    .filter((m) => !m.bracket)
    .every((m) => m.status === 'completed' || m.status === 'walkover');
  if (!groupPhaseDone) return matches;

  const groupIds = new Set(groups.map((g) => g.id));
  const membersByGroup = new Map<string, string[]>();
  for (const group of groups) membersByGroup.set(group.id, []);
  for (const p of participants) {
    if (p.groupId && groupIds.has(p.groupId)) {
      membersByGroup.get(p.groupId)!.push(p.id);
    }
  }

  const tournamentId = matches.find((m) => m.tournamentId)?.tournamentId ?? '';
  const qualified: string[] = [];

  for (const group of groups) {
    const memberIds = membersByGroup.get(group.id) ?? [];
    if (memberIds.length === 0) continue;

    const groupMatches = matches.filter(
      (m) =>
        m.participant1Id !== null &&
        memberIds.includes(m.participant1Id) &&
        m.participant2Id !== null &&
        memberIds.includes(m.participant2Id)
    );
    const standings = calculateStandings(
      groupMatches,
      memberIds,
      tournamentId,
      {
        scoringRule: options.scoringRule,
        tiebreakers: options.tiebreakers,
        bestOf: options.bestOf,
      }
    );

    for (let i = 0; i < Math.min(2, standings.length); i++) {
      qualified.push(standings[i].participantId);
    }
  }

  if (qualified.length === 0) return matches;

  const knockoutFirstRound = matches
    .filter((m) => m.bracket === 'final')
    .reduce(
      (min, m) => (m.round < min ? m.round : min),
      Number.POSITIVE_INFINITY
    );

  let slotIndex = 0;
  return matches.map((m) => {
    if (m.round !== knockoutFirstRound || !m.bracket) return m;
    const nextP1 =
      m.participant1Id ??
      (slotIndex < qualified.length ? qualified[slotIndex++] : null);
    const nextP2 =
      m.participant2Id ??
      (slotIndex < qualified.length ? qualified[slotIndex++] : null);
    if (nextP1 === m.participant1Id && nextP2 === m.participant2Id) return m;
    return { ...m, participant1Id: nextP1, participant2Id: nextP2 };
  });
};

export const advanceBracketWinners = (
  matches: Match[],
  options: AdvanceBracketOptions = {}
): Match[] => {
  const promoted = promoteGroupStage(matches, options);
  const winnersByMatch = new Map<string, string>();
  const losersByMatch = new Map<string, string>();

  for (const m of promoted) {
    if ((m.status === 'completed' || m.status === 'walkover') && m.winnerId) {
      winnersByMatch.set(m.id, m.winnerId);
      const loserId =
        m.winnerId === m.participant1Id ? m.participant2Id : m.participant1Id;
      if (loserId) losersByMatch.set(m.id, loserId);
    }
  }

  const maxRound = promoted.reduce(
    (max, m) => (m.round > max ? m.round : max),
    0
  );

  return promoted.map((m) => {
    if (m.isThirdPlaceMatch) {
      const semiRound = maxRound - 1;
      const semis = promoted.filter((x) => x.round === semiRound);
      return {
        ...m,
        participant1Id: losersByMatch.get(semis[0]?.id ?? '') ?? null,
        participant2Id: losersByMatch.get(semis[1]?.id ?? '') ?? null,
      };
    }

    const nextP1 = m.participant1Id
      ? winnersByMatch.get(m.participant1Id)
      : undefined;
    const nextP2 = m.participant2Id
      ? winnersByMatch.get(m.participant2Id)
      : undefined;
    if (nextP1 === undefined && nextP2 === undefined) return m;
    return {
      ...m,
      participant1Id: nextP1 !== undefined ? nextP1 : m.participant1Id,
      participant2Id: nextP2 !== undefined ? nextP2 : m.participant2Id,
    };
  });
};

export const assignGroups = (
  participantIds: (string | null)[],
  groupCount: number
): string[][] => {
  const ids = participantIds.filter((x): x is string => !!x);
  const count = Math.max(1, groupCount);
  const groups: string[][] = Array.from({ length: count }, () => []);

  ids.forEach((id, i) => {
    const row = Math.floor(i / count);
    const pos = i % count;
    const groupIndex = row % 2 === 0 ? pos : count - 1 - pos;
    groups[groupIndex].push(id);
  });

  return groups;
};
