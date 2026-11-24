import type { FC } from 'react';
import Link from 'next/link';
import type { MatchStatus } from '@/types';

const statusBadgeClass: Record<MatchStatus, string> = {
  scheduled: 'badge-neutral',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
  postponed: 'badge-info',
  walkover: 'badge-error',
};

interface MatchListItemProps {
  id: string;
  participant1Name: string;
  participant2Name: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: MatchStatus;
}

export const MatchListItem: FC<MatchListItemProps> = ({
  id,
  participant1Name,
  participant2Name,
  participant1Score,
  participant2Score,
  status,
}) => (
  <Link
    href={`/match?id=${id}`}
    className="border-base-content/10 bg-base-200 hover:bg-base-300 rounded-xl border p-3 transition-colors">
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-[80px] text-right text-sm font-medium">
        {participant1Name}
      </span>
      <span className="text-base-content/50 font-mono text-sm">
        {participant1Score ?? '-'} : {participant2Score ?? '-'}
      </span>
      <span className="min-w-[80px] text-left text-sm font-medium">
        {participant2Name}
      </span>
      <span className={`badge badge-sm ${statusBadgeClass[status]}`}>
        {status}
      </span>
    </div>
  </Link>
);
