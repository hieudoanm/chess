import type {
  BestOf,
  Match,
  MatchScoringRule,
  Standing,
  Tiebreaker,
} from '@/types';
import {
  DEFAULT_TIEBREAKERS,
  getAggregateScores,
  getMatchPoints,
  resolveMatchResult,
} from './match-rules';

export const getGoalDifference = (
  matches: Match[],
  participantId: string
): number => {
  let diff = 0;

  for (const match of matches) {
    if (match.status !== 'completed') continue;
    if (
      match.participant1Id !== participantId &&
      match.participant2Id !== participantId
    )
      continue;

    const { p1Score, p2Score } = getAggregateScores(match);
    if (p1Score === null || p2Score === null) continue;

    if (match.participant1Id === participantId) {
      diff += p1Score - p2Score;
    } else {
      diff += p2Score - p1Score;
    }
  }

  return diff;
};

export const getPointsScored = (
  matches: Match[],
  participantId: string
): number => {
  let total = 0;

  for (const match of matches) {
    if (match.status !== 'completed') continue;
    if (
      match.participant1Id !== participantId &&
      match.participant2Id !== participantId
    )
      continue;

    const { p1Score, p2Score } = getAggregateScores(match);
    if (p1Score === null || p2Score === null) continue;

    total += match.participant1Id === participantId ? p1Score : p2Score;
  }

  return total;
};

export const getHeadToHead = (
  matches: Match[],
  p1Id: string,
  p2Id: string
): { p1Wins: number; p2Wins: number; draws: number } => {
  let p1Wins = 0;
  let p2Wins = 0;
  let draws = 0;

  for (const match of matches) {
    const hasP1 =
      match.participant1Id === p1Id || match.participant2Id === p1Id;
    const hasP2 =
      match.participant1Id === p2Id || match.participant2Id === p2Id;

    if (!hasP1 || !hasP2) continue;

    if (match.status === 'walkover' && match.winnerId) {
      if (match.winnerId === p1Id) p1Wins += 1;
      else if (match.winnerId === p2Id) p2Wins += 1;
      continue;
    }

    if (match.status !== 'completed') continue;

    const { p1Score, p2Score } = getAggregateScores(match);
    if (p1Score === null || p2Score === null) continue;

    if (p1Score === p2Score) {
      draws += 1;
    } else if (match.winnerId === p1Id) {
      p1Wins += 1;
    } else if (match.winnerId === p2Id) {
      p2Wins += 1;
    }
  }

  return { p1Wins, p2Wins, draws };
};

export interface StandingsOptions {
  tiebreakers?: Tiebreaker[];
  scoringRule?: MatchScoringRule;
  bestOf?: BestOf;
  pointsPerWin?: number;
}

export const calculateStandings = (
  matches: Match[],
  participantIds: string[],
  tournamentId: string,
  options: StandingsOptions = {}
): Standing[] => {
  const standingsMap = new Map<string, Standing>();
  const tiebreakers =
    options.tiebreakers && options.tiebreakers.length > 0
      ? options.tiebreakers
      : DEFAULT_TIEBREAKERS;

  for (const id of participantIds) {
    standingsMap.set(id, {
      participantId: id,
      tournamentId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      position: 0,
    });
  }

  const countable = matches.filter(
    (m) =>
      (m.status === 'completed' || m.status === 'walkover') &&
      m.participant1Id !== null &&
      m.participant2Id !== null
  );

  for (const match of countable) {
    const p1 = standingsMap.get(match.participant1Id!);
    const p2 = standingsMap.get(match.participant2Id!);
    if (!p1 || !p2) continue;

    const { p1Score, p2Score } = getAggregateScores(match);
    if (match.status !== 'walkover' && (p1Score === null || p2Score === null))
      continue;

    p1.played += 1;
    p2.played += 1;
    p1.points += getMatchPoints(match, match.participant1Id!, options);
    p2.points += getMatchPoints(match, match.participant2Id!, options);

    if (match.status === 'walkover') {
      if (match.winnerId === match.participant1Id) {
        p1.won += 1;
        p2.lost += 1;
      } else {
        p2.won += 1;
        p1.lost += 1;
      }
      continue;
    }

    const resolved = resolveMatchResult(match, {
      scoringRule: options.scoringRule,
    });

    if (resolved.winnerId) {
      if (resolved.winnerId === match.participant1Id) {
        p1.won += 1;
        p2.lost += 1;
      } else {
        p2.won += 1;
        p1.lost += 1;
      }
    } else if (p1Score === p2Score) {
      p1.drawn += 1;
      p2.drawn += 1;
    }
  }

  const standings = Array.from(standingsMap.values());

  standings.sort((a, b) => {
    for (const tiebreaker of tiebreakers) {
      let diff = 0;

      if (tiebreaker === 'points') {
        diff = b.points - a.points;
      } else if (tiebreaker === 'wins') {
        diff = b.won - a.won;
      } else if (tiebreaker === 'goal-difference') {
        diff =
          getGoalDifference(countable, b.participantId) -
          getGoalDifference(countable, a.participantId);
      } else if (tiebreaker === 'scored') {
        diff =
          getPointsScored(countable, b.participantId) -
          getPointsScored(countable, a.participantId);
      } else if (tiebreaker === 'head-to-head') {
        const h2h = getHeadToHead(countable, a.participantId, b.participantId);
        diff = h2h.p2Wins - h2h.p1Wins;
      }

      if (diff !== 0) return diff;
    }

    return 0;
  });

  return standings.map((s, i) => ({ ...s, position: i + 1 }));
};
