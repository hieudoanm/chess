import { type TournamentStatus, type MatchStatus } from '@/types';

type Status = TournamentStatus | MatchStatus;

interface StatusBadgeProps {
  status: Status;
}

const STATUS_STYLES: Record<Status, string> = {
  draft: 'badge-ghost',
  upcoming: 'badge-info',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
  cancelled: 'badge-error',
  scheduled: 'badge-info',
  postponed: 'badge-ghost',
  walkover: 'badge-error',
};

const STATUS_LABELS: Record<Status, string> = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  scheduled: 'Scheduled',
  postponed: 'Postponed',
  walkover: 'Walkover',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`badge ${STATUS_STYLES[status]}`}>
    {STATUS_LABELS[status]}
  </span>
);
