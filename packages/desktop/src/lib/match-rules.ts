import type {
  BestOf,
  Match,
  MatchScoringRule,
  MatchSet,
  Tiebreaker,
} from '@/types';

export const DEFAULT_BEST_OF: BestOf = 1;

export const DEFAULT_TIEBREAKERS: Tiebreaker[] = [
  'points',
  'wins',
  'goal-difference',
  'head-to-head',
];

export const scoringRuleLabel: Record<MatchScoringRule, string> = {
  standard: 'Standard',
  sets: 'Sets (match points)',
  'penalty-shootout': 'Penalty shootout',
  'golden-goal': 'Golden goal',
};

export const tiebreakerLabel: Record<Tiebreaker, string> = {
  points: 'Points',
  wins: 'Wins',
  'goal-difference': 'Goal difference',
  'head-to-head': 'Head-to-head',
  scored: 'Points scored',
};

export const neededSetWins = (bestOf: BestOf): number => Math.ceil(bestOf / 2);

export const countSetWins = (
  sets: MatchSet[]
): { p1Wins: number; p2Wins: number } => {
  let p1Wins = 0;
  let p2Wins = 0;

  for (const set of sets) {
    if (set.p1Score > set.p2Score) p1Wins += 1;
    else if (set.p2Score > set.p1Score) p2Wins += 1;
  }

  return { p1Wins, p2Wins };
};

export const getAggregateScores = (
  match: Pick<Match, 'sets' | 'participant1Score' | 'participant2Score'>
): { p1Score: number | null; p2Score: number | null } => {
  if (match.sets && match.sets.length > 0) {
    const { p1Wins, p2Wins } = countSetWins(match.sets);
    return { p1Score: p1Wins, p2Score: p2Wins };
  }

  return {
    p1Score: match.participant1Score,
    p2Score: match.participant2Score,
  };
};

export interface ResolvedResult {
  winnerId: string | null;
  decidedBy: 'sets' | 'penalties' | 'score' | null;
}

export const resolveMatchResult = (
  match: Pick<
    Match,
    | 'participant1Id'
    | 'participant2Id'
    | 'sets'
    | 'participant1Score'
    | 'participant2Score'
    | 'penaltyScore1'
    | 'penaltyScore2'
  >,
  opts: { scoringRule?: MatchScoringRule } = {}
): ResolvedResult => {
  const { p1Score, p2Score } = getAggregateScores(match);

  if (p1Score === null || p2Score === null) {
    return { winnerId: null, decidedBy: null };
  }

  const hasSets = !!match.sets && match.sets.length > 0;

  if (
    p1Score === p2Score &&
    opts.scoringRule === 'penalty-shootout' &&
    match.penaltyScore1 !== null &&
    match.penaltyScore2 !== null &&
    match.penaltyScore1 !== undefined &&
    match.penaltyScore2 !== undefined &&
    match.penaltyScore1 !== match.penaltyScore2
  ) {
    return {
      winnerId:
        match.penaltyScore1 > match.penaltyScore2
          ? match.participant1Id
          : match.participant2Id,
      decidedBy: 'penalties',
    };
  }

  if (p1Score !== p2Score) {
    return {
      winnerId: p1Score > p2Score ? match.participant1Id : match.participant2Id,
      decidedBy: hasSets ? 'sets' : 'score',
    };
  }

  return { winnerId: null, decidedBy: null };
};

export const getMatchPoints = (
  match: Match,
  participantId: string,
  opts: {
    scoringRule?: MatchScoringRule;
    pointsPerWin?: number;
  } = {}
): number => {
  const pointsPerWin = opts.pointsPerWin ?? 3;

  if (match.status === 'walkover' && match.winnerId) {
    return match.winnerId === participantId ? pointsPerWin : 0;
  }

  if (match.status !== 'completed') return 0;

  const { p1Score, p2Score } = getAggregateScores(match);
  if (p1Score === null || p2Score === null) return 0;

  const isP1 = match.participant1Id === participantId;
  const myScore = isP1 ? p1Score : p2Score;
  const theirScore = isP1 ? p2Score : p1Score;

  if (myScore === theirScore) {
    if (
      opts.scoringRule === 'penalty-shootout' &&
      match.penaltyScore1 !== null &&
      match.penaltyScore1 !== undefined &&
      match.penaltyScore2 !== null &&
      match.penaltyScore2 !== undefined &&
      match.penaltyScore1 !== match.penaltyScore2
    ) {
      const winnerIsP1 = match.penaltyScore1 > match.penaltyScore2;
      return isP1 === winnerIsP1 ? pointsPerWin : 0;
    }
    return 1;
  }

  const won = myScore > theirScore;

  if (opts.scoringRule === 'sets' && match.sets && match.sets.length > 0) {
    const margin = Math.abs(p1Score - p2Score);
    if (won) return margin >= 2 ? 3 : 2;
    return margin >= 2 ? 0 : 1;
  }

  return won ? pointsPerWin : 0;
};

export interface ScoreDisplay {
  main: string;
  detail?: string;
}

export const formatMatchScore = (match: Match): ScoreDisplay => {
  if (match.status === 'walkover') return { main: 'W/O' };

  const { p1Score, p2Score } = getAggregateScores(match);
  if (p1Score === null || p2Score === null) return { main: '-' };

  const main = `${p1Score} : ${p2Score}`;

  if (
    match.penaltyScore1 !== null &&
    match.penaltyScore1 !== undefined &&
    match.penaltyScore2 !== null &&
    match.penaltyScore2 !== undefined
  ) {
    return {
      main,
      detail: `P ${match.penaltyScore1}-${match.penaltyScore2}`,
    };
  }

  if (match.sets && match.sets.length > 0) {
    return {
      main,
      detail: match.sets.map((s) => `${s.p1Score}-${s.p2Score}`).join(', '),
    };
  }

  return { main };
};
