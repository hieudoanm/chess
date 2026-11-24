import type { FC } from 'react';
import type { TournamentFormat } from '@/types';

interface FormatSelectorProps {
  value: TournamentFormat;
  onChange: (value: TournamentFormat) => void;
}

const formats: {
  value: TournamentFormat;
  label: string;
  description: string;
}[] = [
  {
    value: 'single-elimination',
    label: 'Single Elimination',
    description: "One loss and you're out",
  },
  {
    value: 'double-elimination',
    label: 'Double Elimination',
    description: 'Must lose twice to exit',
  },
  {
    value: 'round-robin',
    label: 'Round Robin',
    description: 'Everyone plays everyone',
  },
  {
    value: 'swiss',
    label: 'Swiss System',
    description: 'Paired rounds by record',
  },
  {
    value: 'group-stage',
    label: 'Group Stage + Knockout',
    description: 'Groups then elimination',
  },
  {
    value: 'league',
    label: 'League',
    description: 'Season-based with standings',
  },
];

export const FormatSelector: FC<FormatSelectorProps> = ({
  value,
  onChange,
}) => (
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
    {formats.map((f) => (
      <label
        key={f.value}
        className={`border-base-content/20 flex cursor-pointer flex-col rounded-lg border p-3 transition-colors ${
          value === f.value
            ? 'bg-primary/10 border-primary'
            : 'hover:bg-base-200'
        }`}>
        <input
          type="radio"
          name="format"
          value={f.value}
          checked={value === f.value}
          onChange={() => onChange(f.value)}
          className="hidden"
        />
        <span className="text-sm font-medium">{f.label}</span>
        <span className="text-base-content/50 text-xs">{f.description}</span>
      </label>
    ))}
  </div>
);
