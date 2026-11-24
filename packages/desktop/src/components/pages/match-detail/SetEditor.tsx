import type { FC } from 'react';

export interface SetRow {
  p1Score: string;
  p2Score: string;
}

interface SetEditorProps {
  sets: SetRow[];
  maxSets: number;
  onSetsChange: (sets: SetRow[]) => void;
  onSave: () => void;
  saving: boolean;
}

export const SetEditor: FC<SetEditorProps> = ({
  sets,
  maxSets,
  onSetsChange,
  onSave,
  saving,
}) => {
  const update = (
    index: number,
    field: 'p1Score' | 'p2Score',
    value: string
  ): void => {
    const next = sets.map((set, i) =>
      i === index ? { ...set, [field]: value } : set
    );
    onSetsChange(next);
  };

  const add = (): void => {
    onSetsChange([...sets, { p1Score: '', p2Score: '' }]);
  };

  const remove = (index: number): void => {
    onSetsChange(sets.filter((_, i) => i !== index));
  };

  return (
    <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
      <h3 className="mb-3 text-sm font-medium">Sets (best of {maxSets})</h3>
      <div className="flex flex-col gap-2">
        {sets.map((set, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-base-content/50 w-10 text-xs">
              Set {i + 1}
            </span>
            <input
              type="number"
              value={set.p1Score}
              onChange={(e) => update(i, 'p1Score', e.target.value)}
              placeholder="0"
              className="input input-bordered input-sm w-16 text-center"
              min={0}
              aria-label={`Set ${i + 1} player 1 score`}
            />
            <span className="text-base-content/50 font-mono text-xs">:</span>
            <input
              type="number"
              value={set.p2Score}
              onChange={(e) => update(i, 'p2Score', e.target.value)}
              placeholder="0"
              className="input input-bordered input-sm w-16 text-center"
              min={0}
              aria-label={`Set ${i + 1} player 2 score`}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="btn btn-ghost btn-xs">
              ×
            </button>
          </div>
        ))}
        {sets.length < maxSets && (
          <button
            type="button"
            onClick={add}
            className="btn btn-ghost btn-xs w-fit">
            Add Set
          </button>
        )}
      </div>
      <button
        onClick={onSave}
        className="btn btn-primary btn-sm mt-3"
        disabled={saving}>
        {saving ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          'Save'
        )}
      </button>
    </div>
  );
};
