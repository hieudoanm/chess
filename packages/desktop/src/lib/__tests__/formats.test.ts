import {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  generateRoundRobinSchedule,
  generateSwissRounds,
  generateGroupStageKnockout,
  generateLeagueSchedule,
  generateBracket,
  getNextRoundMatches,
  advanceBracketWinners,
  assignGroups,
} from '@/lib/formats';
import type { TournamentFormat } from '@/types';

describe('generateSingleEliminationBracket', () => {
  it('creates a bracket with n-1 matches for a power of two', () => {
    const matches = generateSingleEliminationBracket('t1', [
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(matches).toHaveLength(3);
    expect(matches.map((m) => m.round)).toEqual([1, 1, 2]);
    expect(matches.every((m) => m.status === 'scheduled')).toBe(true);
    expect(matches.every((m) => m.winnerId === null)).toBe(true);
  });

  it('pads non-power-of-two participant counts', () => {
    const matches = generateSingleEliminationBracket('t1', ['a', 'b', 'c']);
    expect(matches).toHaveLength(3);
    const round1 = matches.filter((m) => m.round === 1);
    expect(round1).toHaveLength(2);
    expect(round1.map((m) => m.participant1Id)).toEqual(['a', 'c']);
    expect(round1.map((m) => m.participant2Id)).toEqual(['b', null]);
  });

  it('wires match ids into the next round', () => {
    const matches = generateSingleEliminationBracket('t1', [
      'a',
      'b',
      'c',
      'd',
    ]);
    const final = matches.find((m) => m.round === 2);
    const round1 = matches.filter((m) => m.round === 1);
    expect(round1.map((m) => m.id)).toContain(final!.participant1Id);
    expect(round1.map((m) => m.id)).toContain(final!.participant2Id);
  });

  it('returns no matches for empty or single participant lists', () => {
    expect(generateSingleEliminationBracket('t1', [])).toHaveLength(0);
    expect(generateSingleEliminationBracket('t1', ['a'])).toHaveLength(0);
  });

  it('creates empty match slots for spare participant slots', () => {
    const matches = generateSingleEliminationBracket('t1', [
      'a',
      'b',
      'c',
      'd',
      'e',
    ]);
    expect(matches).toHaveLength(7);
    expect(matches.some((m) => m.participant1Id === null)).toBe(true);
    expect(matches.some((m) => m.participant2Id === null)).toBe(true);
  });
});

describe('generateDoubleEliminationBracket', () => {
  it('creates a winners, losers, and final bracket', () => {
    const matches = generateDoubleEliminationBracket('t1', [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
    ]);
    expect(matches).toHaveLength(13);
    const winners = matches.filter((m) => m.bracket === 'winners');
    const losers = matches.filter((m) => m.bracket === 'losers');
    const final = matches.filter((m) => m.bracket === 'final');
    expect(winners).toHaveLength(7);
    expect(losers).toHaveLength(5);
    expect(final).toHaveLength(1);
    expect(final[0].round).toBe(8);
  });

  it('handles two participants with a single match', () => {
    const matches = generateDoubleEliminationBracket('t1', ['a', 'b']);
    expect(matches).toHaveLength(1);
    expect(matches[0].bracket).toBe('winners');
  });

  it('creates a final for four participants', () => {
    const matches = generateDoubleEliminationBracket('t1', [
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(matches).toHaveLength(5);
    expect(matches.some((m) => m.bracket === 'final')).toBe(true);
  });

  it('pads non-power-of-two participant counts', () => {
    const matches = generateDoubleEliminationBracket('t1', [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ]);
    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches
        .filter((m) => m.bracket === 'winners')
        .some((m) => m.participant1Id === null)
    ).toBe(true);
    expect(
      matches
        .filter((m) => m.bracket === 'winners')
        .some((m) => m.participant2Id === null)
    ).toBe(true);
  });
});

describe('generateRoundRobinSchedule', () => {
  it('creates every pairing once for an even count', () => {
    const matches = generateRoundRobinSchedule('t1', ['a', 'b', 'c', 'd']);
    expect(matches).toHaveLength(6);
    expect(matches.map((m) => m.round)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('handles an odd count with a bye', () => {
    const matches = generateRoundRobinSchedule('t1', ['a', 'b', 'c', 'd', 'e']);
    expect(matches).toHaveLength(10);
    expect(
      matches.every((m) => !['a', 'b', 'c', 'd', 'e'].includes('BYE'))
    ).toBe(true);
  });
});

describe('generateSwissRounds', () => {
  it('defaults round count to ceil(log2(participants))', () => {
    const matches = generateSwissRounds('t1', [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
    ]);
    expect(matches).toHaveLength(12);
    expect(new Set(matches.map((m) => m.round)).size).toBe(3);
  });

  it('respects an explicit round count', () => {
    const matches = generateSwissRounds('t1', ['a', 'b', 'c', 'd'], 2);
    expect(matches).toHaveLength(4);
  });

  it('skips bye slots for an odd count', () => {
    const matches = generateSwissRounds('t1', ['a', 'b', 'c', 'd', 'e'], 2);
    expect(matches).toHaveLength(4);
  });
});

describe('generateGroupStageKnockout', () => {
  it('creates group round robins plus a knockout bracket', () => {
    const ids = [
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'p6',
      'p7',
      'p8',
      'p9',
      'p10',
      'p11',
      'p12',
    ];
    const matches = generateGroupStageKnockout('t1', ids);
    expect(matches).toHaveLength(19);
    const knockout = matches.filter((m) => m.bracket === 'final');
    expect(knockout).toHaveLength(7);
  });

  it('returns no matches when groups cannot form', () => {
    expect(generateGroupStageKnockout('t1', ['a', 'b'])).toHaveLength(0);
  });

  it('respects a custom group count', () => {
    const ids = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
    const matches = generateGroupStageKnockout('t1', ids, { groupCount: 2 });
    expect(matches).toHaveLength(15);
  });

  it('adds a third-place knockout match when enabled', () => {
    const ids = [
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'p6',
      'p7',
      'p8',
      'p9',
      'p10',
      'p11',
      'p12',
    ];
    const matches = generateGroupStageKnockout('t1', ids, {
      thirdPlacePlayoff: true,
    });
    expect(matches).toHaveLength(20);
    const bronze = matches.find(
      (m) => m.isThirdPlaceMatch && m.bracket === 'final'
    );
    expect(bronze).toBeDefined();
    expect(bronze!.participant1Id).toBeNull();
  });

  it('skips the third-place match when the knockout is a single final', () => {
    const ids = ['p1', 'p2', 'p3', 'p4'];
    const matches = generateGroupStageKnockout('t1', ids, {
      groupCount: 1,
      thirdPlacePlayoff: true,
    });
    expect(matches).toHaveLength(7);
    expect(matches.some((m) => m.isThirdPlaceMatch)).toBe(false);
  });
});

describe('generateLeagueSchedule', () => {
  it('creates home and away legs', () => {
    const matches = generateLeagueSchedule('t1', ['a', 'b', 'c', 'd']);
    expect(matches).toHaveLength(12);
    const firstLeg = matches.slice(0, 6);
    const returnLeg = matches.slice(6);
    expect(returnLeg[0].participant1Id).toBe(firstLeg[0].participant2Id);
    expect(returnLeg[0].participant2Id).toBe(firstLeg[0].participant1Id);
    expect(returnLeg[0].round).toBe(firstLeg[0].round + 1000);
  });
});

describe('generateBracket', () => {
  it.each<TournamentFormat>([
    'single-elimination',
    'double-elimination',
    'round-robin',
    'swiss',
    'league',
  ])('dispatches the %s format', (format) => {
    const matches = generateBracket(format, 't1', ['a', 'b', 'c', 'd']);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('dispatches the group-stage format with enough participants', () => {
    const matches = generateBracket('group-stage', 't1', [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
    ]);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('returns an empty array for an unknown format', () => {
    expect(
      generateBracket('unknown' as TournamentFormat, 't1', ['a', 'b'])
    ).toEqual([]);
  });
});

const bracketMatch = (
  id: string,
  round: number,
  p1: string | null,
  p2: string | null,
  winnerId: string | null = null
) => ({
  id,
  tournamentId: 't1',
  round,
  participant1Id: p1,
  participant2Id: p2,
  participant1Score: null,
  participant2Score: null,
  winnerId,
  status: winnerId ? ('completed' as const) : ('scheduled' as const),
});

describe('getNextRoundMatches', () => {
  it('returns matches referencing the given match id', () => {
    const matches = [
      bracketMatch('m1', 1, 'a', 'b'),
      bracketMatch('m2', 1, 'c', 'd'),
      bracketMatch('m3', 2, 'm1', 'm2'),
    ];
    expect(getNextRoundMatches(matches, 'm1').map((m) => m.id)).toEqual(['m3']);
    expect(getNextRoundMatches(matches, 'nope')).toEqual([]);
  });
});

describe('advanceBracketWinners', () => {
  it('promotes winners into the next round', () => {
    const matches = [
      bracketMatch('m1', 1, 'a', 'b', 'a'),
      bracketMatch('m2', 1, 'c', 'd', 'c'),
      bracketMatch('m3', 2, 'm1', 'm2'),
    ];
    const advanced = advanceBracketWinners(matches);
    expect(advanced[2].participant1Id).toBe('a');
    expect(advanced[2].participant2Id).toBe('c');
  });

  it('leaves matches unchanged when no winners exist', () => {
    const matches = [
      bracketMatch('m1', 1, 'a', 'b'),
      bracketMatch('m3', 2, 'm1', 'm2'),
    ];
    expect(advanceBracketWinners(matches)).toEqual(matches);
  });

  it('keeps bye slots and does not overwrite null slots', () => {
    const matches = [
      bracketMatch('m1', 1, 'a', 'b', 'b'),
      bracketMatch('m2', 1, 'c', null, 'c'),
      bracketMatch('m3', 2, 'm1', 'm2'),
    ];
    const advanced = advanceBracketWinners(matches);
    expect(advanced[2].participant1Id).toBe('b');
    expect(advanced[2].participant2Id).toBe('c');
  });
});

describe('assignGroups', () => {
  it('distributes ids evenly across groups in snake order', () => {
    const groups = assignGroups(['1', '2', '3', '4'], 2);
    expect(groups).toEqual([
      ['1', '4'],
      ['2', '3'],
    ]);
  });

  it('handles more participants than slots per group', () => {
    const groups = assignGroups(['1', '2', '3', '4', '5', '6'], 2);
    expect(groups[0]).toEqual(['1', '4', '5']);
    expect(groups[1]).toEqual(['2', '3', '6']);
  });

  it('ignores null entries and clamps the group count', () => {
    expect(assignGroups([null, 'a', 'b', null], 0)).toEqual([['a', 'b']]);
    expect(assignGroups([], 4)).toEqual([[], [], [], []]);
  });
});

describe('generateSingleEliminationBracket with third place', () => {
  it('adds a bronze match for four participants', () => {
    const matches = generateSingleEliminationBracket(
      't1',
      ['a', 'b', 'c', 'd'],
      { thirdPlacePlayoff: true }
    );
    expect(matches).toHaveLength(4);
    const bronze = matches.find((m) => m.isThirdPlaceMatch);
    expect(bronze).toBeDefined();
    expect(bronze!.round).toBe(2);
    expect(bronze!.participant1Id).toBeNull();
    expect(bronze!.participant2Id).toBeNull();
  });

  it('does not add a bronze match when the toggle is off', () => {
    const matches = generateSingleEliminationBracket('t1', [
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(matches.some((m) => m.isThirdPlaceMatch)).toBe(false);
  });

  it('skips the bronze match for two-participant brackets', () => {
    const matches = generateSingleEliminationBracket('t1', ['a', 'b'], {
      thirdPlacePlayoff: true,
    });
    expect(matches.some((m) => m.isThirdPlaceMatch)).toBe(false);
  });
});

describe('advanceBracketWinners with walkovers and third place', () => {
  it('promotes walkover winners into the next round', () => {
    const matches = [
      {
        ...bracketMatch('m1', 1, 'a', 'b'),
        status: 'walkover' as const,
        winnerId: 'a',
      },
      {
        ...bracketMatch('m2', 1, 'c', 'd'),
        status: 'walkover' as const,
        winnerId: 'c',
      },
      bracketMatch('m3', 2, 'm1', 'm2'),
    ];
    const advanced = advanceBracketWinners(matches);
    expect(advanced[2].participant1Id).toBe('a');
    expect(advanced[2].participant2Id).toBe('c');
  });

  it('fills the bronze match with semi-final losers', () => {
    const matches = [
      bracketMatch('m1', 1, 'a', 'b', 'a'),
      bracketMatch('m2', 1, 'c', 'd', 'd'),
      bracketMatch('m3', 2, 'm1', 'm2'),
      {
        ...bracketMatch('m4', 2, null, null),
        isThirdPlaceMatch: true,
      },
    ];
    const advanced = advanceBracketWinners(matches);
    const bronze = advanced.find((m) => m.isThirdPlaceMatch)!;
    expect(bronze.participant1Id).toBe('b');
    expect(bronze.participant2Id).toBe('c');
  });

  it('keeps the bronze match empty until a semi-final is decided', () => {
    const matches = [
      bracketMatch('m1', 1, 'a', 'b'),
      bracketMatch('m2', 1, 'c', 'd'),
      bracketMatch('m3', 2, 'm1', 'm2'),
      {
        ...bracketMatch('m4', 2, null, null),
        isThirdPlaceMatch: true,
      },
    ];
    const advanced = advanceBracketWinners(matches);
    const bronze = advanced.find((m) => m.isThirdPlaceMatch)!;
    expect(bronze.participant1Id).toBeNull();
    expect(bronze.participant2Id).toBeNull();
  });

  it('fills a bronze slot as soon as the matching semi-final loser is known', () => {
    const matches = [
      bracketMatch('m1', 1, 'a', 'b', 'a'),
      bracketMatch('m2', 1, 'c', 'd'),
      bracketMatch('m3', 2, 'm1', 'm2'),
      {
        ...bracketMatch('m4', 2, null, null),
        isThirdPlaceMatch: true,
      },
    ];
    const advanced = advanceBracketWinners(matches);
    const bronze = advanced.find((m) => m.isThirdPlaceMatch)!;
    expect(bronze.participant1Id).toBe('b');
    expect(bronze.participant2Id).toBeNull();
  });
});

describe('advanceBracketWinners group promotion', () => {
  const groupMatch = (id: string, round: number, p1: string, p2: string) =>
    bracketMatch(id, round, p1, p2);

  const knockoutMatch = (id: string, round: number) => ({
    ...bracketMatch(id, round, null, null),
    bracket: 'final' as const,
  });

  const knockoutFinal = (
    id: string,
    round: number,
    p1: string | null,
    p2: string | null
  ) => ({
    ...bracketMatch(id, round, p1, p2),
    bracket: 'final' as const,
  });

  const groups = [
    { id: 'gA', tournamentId: 't1', name: 'A', participantIds: ['p1', 'p2'] },
    { id: 'gB', tournamentId: 't1', name: 'B', participantIds: ['p3', 'p4'] },
  ];

  const participants = [
    { id: 'p1', tournamentId: 't1', name: 'P1', groupId: 'gA' },
    { id: 'p2', tournamentId: 't1', name: 'P2', groupId: 'gA' },
    { id: 'p3', tournamentId: 't1', name: 'P3', groupId: 'gB' },
    { id: 'p4', tournamentId: 't1', name: 'P4', groupId: 'gB' },
  ];

  const knockoutBracket = [
    knockoutMatch('k1', 3001),
    knockoutMatch('k2', 3001),
    knockoutFinal('k3', 3002, 'k1', 'k2'),
  ];

  it('fills knockout first-round slots with the top two per group', () => {
    const matches = [
      {
        ...groupMatch('g1', 1, 'p1', 'p2'),
        status: 'completed' as const,
        participant1Score: 2,
        participant2Score: 0,
        winnerId: 'p1',
      },
      {
        ...groupMatch('g2', 1001, 'p3', 'p4'),
        status: 'completed' as const,
        participant1Score: 3,
        participant2Score: 1,
        winnerId: 'p3',
      },
      ...knockoutBracket,
    ];
    const advanced = advanceBracketWinners(matches, { groups, participants });
    const k1 = advanced.find((m) => m.id === 'k1')!;
    const k2 = advanced.find((m) => m.id === 'k2')!;
    expect(k1.participant1Id).toBe('p1');
    expect(k1.participant2Id).toBe('p2');
    expect(k2.participant1Id).toBe('p3');
    expect(k2.participant2Id).toBe('p4');
  });

  it('respects the scoring rule when deciding the group winners', () => {
    const matches = [
      {
        ...groupMatch('g1', 1, 'p1', 'p2'),
        status: 'completed' as const,
        participant1Score: 1,
        participant2Score: 1,
        penaltyScore1: 3,
        penaltyScore2: 4,
        winnerId: 'p2',
      },
      {
        ...groupMatch('g2', 1001, 'p3', 'p4'),
        status: 'completed' as const,
        participant1Score: 3,
        participant2Score: 1,
        winnerId: 'p3',
      },
      ...knockoutBracket,
    ];
    const advanced = advanceBracketWinners(matches, {
      groups,
      participants,
      scoringRule: 'penalty-shootout',
    });
    const k1 = advanced.find((m) => m.id === 'k1')!;
    expect(k1.participant1Id).toBe('p2');
    expect(k1.participant2Id).toBe('p1');
  });

  it('keeps knockout slots empty until every group match is decided', () => {
    const matches = [
      {
        ...groupMatch('g1', 1, 'p1', 'p2'),
        status: 'completed' as const,
        participant1Score: 2,
        participant2Score: 0,
        winnerId: 'p1',
      },
      groupMatch('g2', 1001, 'p3', 'p4'),
      ...knockoutBracket,
    ];
    const advanced = advanceBracketWinners(matches, { groups, participants });
    const k1 = advanced.find((m) => m.id === 'k1')!;
    expect(k1.participant1Id).toBeNull();
    expect(k1.participant2Id).toBeNull();
  });

  it('treats walkovers as a decided group phase', () => {
    const matches = [
      {
        ...groupMatch('g1', 1, 'p1', 'p2'),
        status: 'walkover' as const,
        winnerId: 'p1',
      },
      {
        ...groupMatch('g2', 1001, 'p3', 'p4'),
        status: 'completed' as const,
        participant1Score: 3,
        participant2Score: 1,
        winnerId: 'p3',
      },
      ...knockoutBracket,
    ];
    const advanced = advanceBracketWinners(matches, { groups, participants });
    const k1 = advanced.find((m) => m.id === 'k1')!;
    expect(k1.participant1Id).toBe('p1');
    expect(k1.participant2Id).toBe('p2');
  });

  it('returns matches unchanged when there are no groups or participants', () => {
    const advanced = advanceBracketWinners(knockoutBracket);
    expect(advanced).toEqual(knockoutBracket);
  });

  it('ignores participants whose group is not part of the tournament', () => {
    const matches = [
      {
        ...groupMatch('g1', 1, 'p1', 'p2'),
        status: 'completed' as const,
        participant1Score: 2,
        participant2Score: 0,
        winnerId: 'p1',
      },
      ...knockoutBracket,
    ];
    const advanced = advanceBracketWinners(matches, {
      groups,
      participants: participants.map((p) => ({ ...p, groupId: 'gUnknown' })),
    });
    const k1 = advanced.find((m) => m.id === 'k1')!;
    expect(k1.participant1Id).toBeNull();
    expect(k1.participant2Id).toBeNull();
  });

  it('leaves knockout slots empty when not enough participants qualify', () => {
    const singleGroup = [
      { id: 'gA', tournamentId: 't1', name: 'A', participantIds: ['p1', 'p2'] },
    ];
    const twoParticipants = [
      { id: 'p1', tournamentId: 't1', name: 'P1', groupId: 'gA' },
      { id: 'p2', tournamentId: 't1', name: 'P2', groupId: 'gA' },
    ];
    const matches = [
      {
        ...groupMatch('g1', 1, 'p1', 'p2'),
        status: 'completed' as const,
        participant1Score: 2,
        participant2Score: 0,
        winnerId: 'p1',
      },
      knockoutMatch('k1', 3001),
      knockoutMatch('k2', 3001),
      knockoutFinal('k3', 3002, 'k1', 'k2'),
    ];
    const advanced = advanceBracketWinners(matches, {
      groups: singleGroup,
      participants: twoParticipants,
    });
    const k1 = advanced.find((m) => m.id === 'k1')!;
    const k2 = advanced.find((m) => m.id === 'k2')!;
    expect(k1.participant1Id).toBe('p1');
    expect(k1.participant2Id).toBe('p2');
    expect(k2.participant1Id).toBeNull();
    expect(k2.participant2Id).toBeNull();
  });

  it('fills only the empty knockout slot with a qualified participant', () => {
    const singleGroup = [
      { id: 'gA', tournamentId: 't1', name: 'A', participantIds: ['p1', 'p2'] },
    ];
    const twoParticipants = [
      { id: 'p1', tournamentId: 't1', name: 'P1', groupId: 'gA' },
      { id: 'p2', tournamentId: 't1', name: 'P2', groupId: 'gA' },
    ];
    const matches = [
      {
        ...groupMatch('g1', 1, 'p1', 'p2'),
        status: 'completed' as const,
        participant1Score: 2,
        participant2Score: 0,
        winnerId: 'p1',
      },
      knockoutFinal('k1', 3001, 'p2', null),
    ];
    const advanced = advanceBracketWinners(matches, {
      groups: singleGroup,
      participants: twoParticipants,
    });
    const k1 = advanced.find((m) => m.id === 'k1')!;
    expect(k1.participant1Id).toBe('p2');
    expect(k1.participant2Id).toBe('p1');
  });
});
