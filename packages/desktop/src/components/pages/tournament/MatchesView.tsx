import type { FC } from 'react';
import Link from 'next/link';
import { useData } from '@/providers/DataProvider';
import type { MatchStatus } from '@/types';

const statusBadge: Record<MatchStatus, string> = {
  scheduled: 'badge-neutral',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
  postponed: 'badge-info',
  walkover: 'badge-error',
};

interface MatchesViewProps {
  matches: ReturnType<typeof useData>['matches'];
  participants: ReturnType<typeof useData>['participants'];
  tournamentId: string;
}

export const MatchesView: FC<MatchesViewProps> = ({
  matches,
  participants,
  tournamentId,
}) => {
  const getName = (id: string | null) =>
    id ? (participants.find((p) => p.id === id)?.name ?? 'TBD') : 'TBD';

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort(
    (a, b) => a - b
  );

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/participants?tournamentId=${tournamentId}`}
        className="btn btn-primary btn-sm w-fit">
        Add Match
      </Link>
      {rounds.map((round) => (
        <div key={round}>
          <h3 className="mb-2 text-sm font-medium">Round {round}</h3>
          <div className="flex flex-col gap-2">
            {matches
              .filter((m) => m.round === round)
              .map((m) => (
                <Link
                  key={m.id}
                  href={`/match?id=${m.id}`}
                  className="border-base-content/10 bg-base-200 hover:bg-base-300 rounded-xl border p-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {getName(m.participant1Id)}
                    </span>
                    <span className="text-base-content/50 font-mono text-sm">
                      {m.participant1Score ?? '-'} :{' '}
                      {m.participant2Score ?? '-'}
                    </span>
                    <span className="text-sm font-medium">
                      {getName(m.participant2Id)}
                    </span>
                    <span className={`badge badge-sm ${statusBadge[m.status]}`}>
                      {m.status}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
