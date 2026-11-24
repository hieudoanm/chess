'use client';

import { useMemo } from 'react';
import { useData } from '@/providers/DataProvider';
import { useToast } from '@/providers/ToastProvider';
import {
  calculateAnalytics,
  predictStandings,
  type TournamentAnalytics,
  type PredictedStanding,
} from '@/lib/analytics';
import { formatDate } from '@/lib/utils';

interface AnalyticsPanelProps {
  tournamentId: string;
}

export const AnalyticsPanel = ({ tournamentId }: AnalyticsPanelProps) => {
  const { tournaments, matches, participants } = useData();

  const tournament = useMemo(
    () => tournaments.find((t) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const tournamentMatches = useMemo(
    () => matches.filter((m) => m.tournamentId === tournamentId),
    [matches, tournamentId]
  );

  const tournamentParticipants = useMemo(
    () => participants.filter((p) => p.tournamentId === tournamentId),
    [participants, tournamentId]
  );

  const analytics: TournamentAnalytics | null = useMemo(() => {
    if (!tournament) return null;
    return calculateAnalytics(tournament, matches, tournamentParticipants);
  }, [tournament, matches, tournamentParticipants]);

  const participantIds = useMemo(
    () => tournamentParticipants.map((p) => p.id),
    [tournamentParticipants]
  );

  const predictions: PredictedStanding[] = useMemo(() => {
    if (!tournament || tournament.status !== 'in-progress') return [];
    return predictStandings(matches, participantIds, tournamentId);
  }, [tournament, matches, participantIds, tournamentId]);

  const participantMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of tournamentParticipants) {
      map.set(p.id, p.name);
    }
    return map;
  }, [tournamentParticipants]);

  const completionRate = analytics
    ? Math.round((analytics.completedMatches / analytics.totalMatches) * 100)
    : 0;

  if (!tournament || !analytics) {
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <p className="text-base-content/50 py-8 text-center">
            No analytics available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Matches" value={analytics.totalMatches} />
        <StatCard label="Completed" value={analytics.completedMatches} />
        <StatCard label="Completion" value={`${completionRate}%`} />
        <StatCard label="Upsets" value={analytics.upsets} />
      </div>

      {(analytics.topScorer.participantId ||
        analytics.longestWinStreak.participantId) && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">Highlights</h3>
            <div className="space-y-2">
              {analytics.topScorer.participantId && (
                <div className="flex items-center justify-between">
                  <span className="text-base-content/60 text-sm">
                    Top Scorer
                  </span>
                  <span className="text-sm font-medium">
                    {participantMap.get(analytics.topScorer.participantId) ??
                      'Unknown'}{' '}
                    ({analytics.topScorer.totalScore} pts)
                  </span>
                </div>
              )}
              {analytics.longestWinStreak.participantId && (
                <div className="flex items-center justify-between">
                  <span className="text-base-content/60 text-sm">
                    Longest Win Streak
                  </span>
                  <span className="text-sm font-medium">
                    {participantMap.get(
                      analytics.longestWinStreak.participantId
                    ) ?? 'Unknown'}{' '}
                    ({analytics.longestWinStreak.streak} wins)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {analytics.closestMatches.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">Closest Matches</h3>
            <div className="space-y-2">
              {analytics.closestMatches.map((match) => {
                const name1 =
                  participantMap.get(match.participant1Id ?? '') ?? 'TBD';
                const name2 =
                  participantMap.get(match.participant2Id ?? '') ?? 'TBD';
                const diff = Math.abs(
                  (match.participant1Score ?? 0) -
                    (match.participant2Score ?? 0)
                );

                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">
                      {name1} vs {name2}
                    </span>
                    <span className="font-mono">
                      {match.participant1Score} - {match.participant2Score}
                      <span className="text-base-content/50 ml-2 text-xs">
                        ({diff} diff)
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {predictions.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">Predicted Standings</h3>
            <div className="overflow-x-auto">
              <table className="table-zebra table-sm table w-full">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Team</th>
                    <th className="text-center">Current</th>
                    <th className="text-center">Max Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred) => (
                    <tr key={pred.participantId}>
                      <td className="font-medium">{pred.likelyPosition}</td>
                      <td className="font-medium">
                        {participantMap.get(pred.participantId) ?? 'Unknown'}
                      </td>
                      <td className="text-center">{pred.currentPoints}</td>
                      <td className="text-center">{pred.maxPossiblePoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="card bg-base-200">
    <div className="card-body items-center p-3 text-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-base-content/50 text-xs">{label}</span>
    </div>
  </div>
);

AnalyticsPanel.displayName = 'AnalyticsPanel';
