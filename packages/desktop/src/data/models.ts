import type { Tournament, Participant, Match, Standing } from '@/types';

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createTournament = (
  data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>
): Tournament => ({
  ...data,
  id: generateId(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const createParticipant = (
  data: Omit<Participant, 'id'>
): Participant => ({
  ...data,
  id: generateId(),
});

export const createMatch = (data: Omit<Match, 'id'>): Match => ({
  ...data,
  id: generateId(),
});

export const calculateStandings = (
  matches: Match[],
  participantIds: string[]
): Standing[] => {
  const standings: Map<string, Standing> = new Map();

  for (const id of participantIds) {
    standings.set(id, {
      participantId: id,
      tournamentId: '',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      position: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== 'completed' || !match.winnerId) continue;

    const p1 = standings.get(match.participant1Id!);
    const p2 = standings.get(match.participant2Id!);
    if (!p1 || !p2) continue;

    p1.played += 1;
    p2.played += 1;

    if (match.participant1Score === match.participant2Score) {
      p1.drawn += 1;
      p2.drawn += 1;
      p1.points += 1;
      p2.points += 1;
    } else {
      const winner = match.winnerId === match.participant1Id ? p1 : p2;
      const loser = match.winnerId === match.participant1Id ? p2 : p1;
      winner.won += 1;
      winner.points += 3;
      loser.lost += 1;
    }
  }

  return Array.from(standings.values())
    .sort((a, b) => b.points - a.points || b.won - a.won)
    .map((s, i) => ({ ...s, position: i + 1 }));
};
