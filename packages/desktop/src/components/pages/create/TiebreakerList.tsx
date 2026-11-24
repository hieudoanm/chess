import type { FC } from 'react';
import type { Tiebreaker } from '@/types';
import { tiebreakerLabel } from '@/lib/match-rules';

const ALL_TIEBREAKERS: Tiebreaker[] = [
  'points',
  'wins',
  'goal-difference',
  'head-to-head',
  'scored',
];

interface TiebreakerListProps {
  value: Tiebreaker[];
  onChange: (next: Tiebreaker[]) => void;
}

export const TiebreakerList: FC<TiebreakerListProps> = ({
  value,
  onChange,
}) => {
  const move = (index: number, dir: -1 | 1): void => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = (tiebreaker: Tiebreaker): void => {
    onChange([...value, tiebreaker]);
  };

  const remove = (tiebreaker: Tiebreaker): void => {
    onChange(value.filter((v) => v !== tiebreaker));
  };

  const available = ALL_TIEBREAKERS.filter((tb) => !value.includes(tb));

  return (
    <div className="flex flex-col gap-1">
      {value.map((tb, i) => (
        <div
          key={tb}
          className="border-base-content/10 flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-base-content/50 text-xs">{i + 1}.</span>
          <span className="flex-1 text-sm">{tiebreakerLabel[tb]}</span>
          <button
            type="button"
            onClick={() => move(i, -1)}
            disabled={i === 0}
            aria-label={`Move ${tiebreakerLabel[tb]} up`}
            className="btn btn-ghost btn-xs">
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(i, 1)}
            disabled={i === value.length - 1}
            aria-label={`Move ${tiebreakerLabel[tb]} down`}
            className="btn btn-ghost btn-xs">
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove(tb)}
            aria-label={`Remove ${tiebreakerLabel[tb]}`}
            className="btn btn-ghost btn-xs text-error">
            ×
          </button>
        </div>
      ))}
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {available.map((tb) => (
            <button
              key={tb}
              type="button"
              onClick={() => add(tb)}
              className="btn btn-ghost btn-xs">
              + {tiebreakerLabel[tb]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
