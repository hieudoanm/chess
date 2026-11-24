import type { FC } from 'react';

interface ScoreEditorProps {
  score1: string;
  score2: string;
  onScore1Change: (value: string) => void;
  onScore2Change: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const ScoreEditor: FC<ScoreEditorProps> = ({
  score1,
  score2,
  onScore1Change,
  onScore2Change,
  onSave,
  saving,
}) => (
  <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
    <h3 className="mb-3 text-sm font-medium">Score</h3>
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={score1}
        onChange={(e) => onScore1Change(e.target.value)}
        placeholder="0"
        className="input input-bordered input-sm w-20 text-center"
        min={0}
      />
      <span className="text-base-content/50 font-mono">:</span>
      <input
        type="number"
        value={score2}
        onChange={(e) => onScore2Change(e.target.value)}
        placeholder="0"
        className="input input-bordered input-sm w-20 text-center"
        min={0}
      />
      <button
        onClick={onSave}
        className="btn btn-primary btn-sm"
        disabled={saving}>
        {saving ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          'Save'
        )}
      </button>
    </div>
  </div>
);
