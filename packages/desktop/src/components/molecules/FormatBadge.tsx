import { type TournamentFormat } from '@/types';

interface FormatBadgeProps {
  format: TournamentFormat;
}

const FORMAT_STYLES: Record<TournamentFormat, string> = {
  'single-elimination': 'badge-primary',
  'double-elimination': 'badge-secondary',
  'round-robin': 'badge-accent',
  swiss: 'badge-info',
  'group-stage': 'badge-warning',
  league: 'badge-success',
};

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  'single-elimination': 'Single Elimination',
  'double-elimination': 'Double Elimination',
  'round-robin': 'Round Robin',
  swiss: 'Swiss',
  'group-stage': 'Group Stage',
  league: 'League',
};

export const FormatBadge = ({ format }: FormatBadgeProps) => (
  <span className={`badge ${FORMAT_STYLES[format]}`}>
    {FORMAT_LABELS[format]}
  </span>
);
