import type { TournamentStatus } from '@/types';

type FilterValue = TournamentStatus | 'all';

interface StatusFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

export const StatusFilter = ({ value, onChange }: StatusFilterProps) => (
  <div className="mb-6 flex gap-2 overflow-x-auto">
    {FILTERS.map((f) => (
      <button
        key={f.value}
        onClick={() => onChange(f.value)}
        className={`btn btn-sm rounded-full ${
          value === f.value ? 'btn-primary' : 'btn-ghost'
        }`}>
        {f.label}
      </button>
    ))}
  </div>
);
