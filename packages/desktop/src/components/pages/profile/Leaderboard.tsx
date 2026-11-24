'use client';

import { useMemo, type FC } from 'react';
import type { Match, Participant } from '@/types';

interface LeaderboardEntry {
  participantId: string;
  name: string;
  tournamentCount: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

interface LeaderboardProps {
  matches: Match[];
  participants: Participant[];
}

export const computeLeaderboard = (
  matches: Match[],
  participants: Participant[]
): LeaderboardEntry[] => {
  const entries = new Map<string, LeaderboardEntry>();

  const ensure = (participant: Participant): LeaderboardEntry => {
    const existing = entries.get(participant.id);
    if (existing) {
      existing.tournamentCount += 1;
      return existing;
    }
    const entry: LeaderboardEntry = {
      participantId: participant.id,
      name: participant.name,
      tournamentCount: 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
    };
    entries.set(participant.id, entry);
    return entry;
  };

  for (const m of matches) {
    if (m.status !== 'completed') continue;
    const p1 = participants.find((p) => p.id === m.participant1Id);
    const p2 = participants.find((p) => p.id === m.participant2Id);
    if (!p1 || !p2) continue;

    const e1 = ensure(p1);
    const e2 = ensure(p2);
    e1.played += 1;
    e2.played += 1;

    if (m.winnerId === p1.id) {
      e1.won += 1;
      e1.points += 3;
      e2.lost += 1;
    } else if (m.winnerId === p2.id) {
      e2.won += 1;
      e2.points += 3;
      e1.lost += 1;
    } else {
      e1.drawn += 1;
      e1.points += 1;
      e2.drawn += 1;
      e2.points += 1;
    }
  }

  return Array.from(entries.values()).sort(
    (a, b) => b.points - a.points || b.won - a.won || a.played - b.played
  );
};

export const Leaderboard: FC<LeaderboardProps> = ({
  matches,
  participants,
}) => {
  const entries = useMemo(
    () => computeLeaderboard(matches, participants).slice(0, 10),
    [matches, participants]
  );

  return (
    <div className="border-base-content/10 bg-base-200 w-full max-w-sm rounded-2xl border p-6">
      <h2 className="mb-4 text-lg font-semibold">Leaderboard</h2>

      {entries.length === 0 ? (
        <p className="text-base-content/50 text-sm">
          No results yet. Complete matches across tournaments to build the
          leaderboard.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {entries.map((entry, index) => (
            <li
              key={entry.participantId}
              className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-base-content/50 w-6 flex-shrink-0 text-center">
                  {index === 0
                    ? '🥇'
                    : index === 1
                      ? '🥈'
                      : index === 2
                        ? '🥉'
                        : `#${index + 1}`}
                </span>
                <span className="truncate">{entry.name}</span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-3">
                <span className="text-base-content/50 text-xs">
                  {entry.played} played
                </span>
                <span className="font-mono font-bold">{entry.points} pts</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
