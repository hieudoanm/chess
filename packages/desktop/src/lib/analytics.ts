import type { Tournament, Match, Participant, Standing } from '@/types';

export interface TournamentAnalytics {
  totalMatches: number;
  completedMatches: number;
  averageMatchDuration: number;
  upsets: number;
  closestMatches: Match[];
  longestWinStreak: { participantId: string; streak: number };
  topScorer: { participantId: string; totalScore: number };
}

export const calculateAnalytics = (
  tournament: Tournament,
  matches: Match[],
  participants: Participant[]
): TournamentAnalytics => {
  const tournamentMatches = matches.filter(
    (m) => m.tournamentId === tournament.id
  );
  const completed = tournamentMatches.filter((m) => m.status === 'completed');

  const totalMatches = tournamentMatches.length;
  const completedMatches = completed.length;

  // placeholder: no duration data on Match type
  const averageMatchDuration = 30;

  const participantMap = new Map<string, Participant>();
  for (const p of participants) {
    if (p.tournamentId === tournament.id) {
      participantMap.set(p.id, p);
    }
  }

  let upsets = 0;
  for (const match of completed) {
    if (match.participant1Score === null || match.participant2Score === null)
      continue;
    if (match.winnerId === null) continue;

    const p1 = participantMap.get(match.participant1Id ?? '');
    const p2 = participantMap.get(match.participant2Id ?? '');
    if (!p1 || !p2) continue;
    if (p1.seed === undefined || p2.seed === undefined) continue;

    const winnerSeed =
      match.winnerId === match.participant1Id ? p1.seed : p2.seed;
    const loserSeed =
      match.winnerId === match.participant1Id ? p2.seed : p1.seed;
    if (winnerSeed > loserSeed) {
      upsets += 1;
    }
  }

  const scoredMatches = completed
    .filter((m) => m.participant1Score !== null && m.participant2Score !== null)
    .sort((a, b) => {
      const diffA = Math.abs(
        (a.participant1Score ?? 0) - (a.participant2Score ?? 0)
      );
      const diffB = Math.abs(
        (b.participant1Score ?? 0) - (b.participant2Score ?? 0)
      );
      return diffA - diffB;
    });

  const closestMatches = scoredMatches.slice(0, 5);

  const streakMap = new Map<string, number>();
  const sortedByRound = [...completed].sort((a, b) => a.round - b.round);

  const currentStreaks = new Map<string, number>();
  for (const match of sortedByRound) {
    if (match.winnerId === null) continue;

    for (const id of [match.participant1Id, match.participant2Id]) {
      if (id === null) continue;
      const streak =
        id === match.winnerId ? (currentStreaks.get(id) ?? 0) + 1 : 0;
      currentStreaks.set(id, streak);
      if (streak > (streakMap.get(id) ?? 0)) {
        streakMap.set(id, streak);
      }
    }
  }

  let longestWinStreak = { participantId: '', streak: 0 };
  for (const [participantId, streak] of streakMap) {
    if (streak > longestWinStreak.streak) {
      longestWinStreak = { participantId, streak };
    }
  }

  const scoreMap = new Map<string, number>();
  for (const match of completed) {
    if (match.participant1Score !== null && match.participant1Id) {
      scoreMap.set(
        match.participant1Id,
        (scoreMap.get(match.participant1Id) ?? 0) + match.participant1Score
      );
    }
    if (match.participant2Score !== null && match.participant2Id) {
      scoreMap.set(
        match.participant2Id,
        (scoreMap.get(match.participant2Id) ?? 0) + match.participant2Score
      );
    }
  }

  let topScorer = { participantId: '', totalScore: 0 };
  for (const [participantId, totalScore] of scoreMap) {
    if (totalScore > topScorer.totalScore) {
      topScorer = { participantId, totalScore };
    }
  }

  return {
    totalMatches,
    completedMatches,
    averageMatchDuration,
    upsets,
    closestMatches,
    longestWinStreak,
    topScorer,
  };
};

export interface PredictedStanding {
  participantId: string;
  currentPoints: number;
  maxPossiblePoints: number;
  likelyPosition: number;
  scenarios: { wins: number; draws: number; losses: number };
}

export const predictStandings = (
  matches: Match[],
  participantIds: string[],
  tournamentId: string
): PredictedStanding[] => {
  const tournamentMatches = matches.filter(
    (m) => m.tournamentId === tournamentId
  );
  const completed = tournamentMatches.filter(
    (m) =>
      m.status === 'completed' &&
      m.participant1Id !== null &&
      m.participant2Id !== null &&
      m.participant1Score !== null &&
      m.participant2Score !== null
  );
  const remaining = tournamentMatches.filter(
    (m) =>
      m.status !== 'completed' &&
      m.participant1Id !== null &&
      m.participant2Id !== null
  );

  const pointsMap = new Map<string, number>();
  const playedMap = new Map<string, number>();
  for (const id of participantIds) {
    pointsMap.set(id, 0);
    playedMap.set(id, 0);
  }

  for (const match of completed) {
    const p1 = match.participant1Id!;
    const p2 = match.participant2Id!;

    playedMap.set(p1, (playedMap.get(p1) ?? 0) + 1);
    playedMap.set(p2, (playedMap.get(p2) ?? 0) + 1);

    if (match.participant1Score === match.participant2Score) {
      pointsMap.set(p1, (pointsMap.get(p1) ?? 0) + 1);
      pointsMap.set(p2, (pointsMap.get(p2) ?? 0) + 1);
    } else if (match.winnerId === p1) {
      pointsMap.set(p1, (pointsMap.get(p1) ?? 0) + 3);
    } else if (match.winnerId === p2) {
      pointsMap.set(p2, (pointsMap.get(p2) ?? 0) + 3);
    }
  }

  const remainingPerParticipant = new Map<string, number>();
  for (const id of participantIds) {
    remainingPerParticipant.set(id, 0);
  }
  for (const match of remaining) {
    const p1 = match.participant1Id!;
    const p2 = match.participant2Id!;
    remainingPerParticipant.set(p1, (remainingPerParticipant.get(p1) ?? 0) + 1);
    remainingPerParticipant.set(p2, (remainingPerParticipant.get(p2) ?? 0) + 1);
  }

  const predictions: PredictedStanding[] = participantIds.map((id) => {
    const currentPoints = pointsMap.get(id) ?? 0;
    const remainingGames = remainingPerParticipant.get(id) ?? 0;
    const maxPossiblePoints = currentPoints + remainingGames * 3;

    const wins = remainingGames;
    const draws = 0;
    const losses = 0;

    return {
      participantId: id,
      currentPoints,
      maxPossiblePoints,
      likelyPosition: 0,
      scenarios: { wins, draws, losses },
    };
  });

  predictions.sort((a, b) => b.maxPossiblePoints - a.maxPossiblePoints);
  for (let i = 0; i < predictions.length; i++) {
    predictions[i].likelyPosition = i + 1;
  }

  return predictions;
};
