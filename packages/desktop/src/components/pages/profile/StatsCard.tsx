import type { FC } from 'react';

interface StatsCardProps {
  totalTournaments: number;
  totalMatches: number;
  winRate: number | null;
}

export const StatsCard: FC<StatsCardProps> = ({
  totalTournaments,
  totalMatches,
  winRate,
}) => (
  <div className="border-base-content/10 bg-base-200 container mx-auto mb-8 w-full rounded-2xl border p-6">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-sm">
          Tournaments Created
        </span>
        <span className="font-mono text-sm font-bold">{totalTournaments}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-sm">Matches Tracked</span>
        <span className="font-mono text-sm font-bold">{totalMatches}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-sm">Win Rate</span>
        <span className="font-mono text-sm font-bold">
          {winRate !== null ? `${winRate}%` : '-'}
        </span>
      </div>
    </div>
  </div>
);
