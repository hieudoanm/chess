import type { Tournament, Participant, Match } from '@/types';

export const shareTournament = async (data: string): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Tournament', text: data });
      return true;
    } catch {
      return false;
    }
  }

  return copyToClipboard(data);
};

export const generateShareableJSON = (
  tournaments: Tournament[],
  participants: Participant[],
  matches: Match[]
): string => {
  return JSON.stringify(
    { tournaments, participants, matches, sharedAt: Date.now() },
    null,
    2
  );
};

export const generateTextSummary = (
  tournament: Tournament,
  participants: Participant[],
  matches: Match[]
): string => {
  const lines: string[] = [];
  lines.push(`${tournament.name}`);
  lines.push(`${tournament.format} | ${tournament.status}`);
  lines.push('');

  const completed = matches.filter((m) => m.status === 'completed');
  lines.push(`Matches: ${completed.length}/${matches.length} completed`);

  const pMap = new Map<string, Participant>();
  for (const p of participants) {
    if (p.tournamentId === tournament.id) {
      pMap.set(p.id, p);
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

  const topScorers = Array.from(scoreMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (topScorers.length > 0) {
    lines.push('');
    lines.push('Top Scorers:');
    for (const [id, score] of topScorers) {
      const name = pMap.get(id)?.name ?? 'Unknown';
      lines.push(`  ${name}: ${score} pts`);
    }
  }

  return lines.join('\n');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
