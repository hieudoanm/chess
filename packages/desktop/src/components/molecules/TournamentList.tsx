import type { FC } from 'react';
import Link from 'next/link';
import { FiAward } from 'react-icons/fi';
import { TournamentCard } from '@/components/molecules/TournamentCard';
import { EmptyState } from '@/components/atoms/EmptyState';
import type { Tournament } from '@/types';

interface TournamentListProps {
  loading: boolean;
  tournaments: Tournament[];
  participantCounts: Record<string, number>;
}

export const TournamentList: FC<TournamentListProps> = ({
  loading,
  tournaments,
  participantCounts,
}) => {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <EmptyState
        icon={<FiAward className="text-base-content/30" />}
        title="No tournaments yet"
        description="Create your first tournament to get started"
        action={
          <Link href="/create" className="btn btn-primary btn-sm">
            Create Tournament
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {tournaments.map((t) => (
        <TournamentCard
          key={t.id}
          tournament={t}
          participantCount={participantCounts[t.id] ?? 0}
        />
      ))}
    </div>
  );
};
