import type { TournamentStatus } from '@/types';

export const statusBadgeClass: Record<TournamentStatus, string> = {
  draft: 'badge-neutral',
  upcoming: 'badge-info',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
  cancelled: 'badge-error',
};

export const formatLabel: Record<string, string> = {
  'single-elimination': 'Single Elimination',
  'double-elimination': 'Double Elimination',
  'round-robin': 'Round Robin',
  swiss: 'Swiss System',
  'group-stage': 'Group Stage + Knockout',
  league: 'League',
};
