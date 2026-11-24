import type { FC } from 'react';

interface PenaltyEditorProps {
  penalty1: string;
  penalty2: string;
  onPenalty1Change: (value: string) => void;
  onPenalty2Change: (value: string) => void;
}

export const PenaltyEditor: FC<PenaltyEditorProps> = ({
  penalty1,
  penalty2,
  onPenalty1Change,
  onPenalty2Change,
}) => (
  <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
    <h3 className="mb-3 text-sm font-medium">Penalty Shootout</h3>
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={penalty1}
        onChange={(e) => onPenalty1Change(e.target.value)}
        placeholder="0"
        className="input input-bordered input-sm w-20 text-center"
        min={0}
        aria-label="Penalty player 1 score"
      />
      <span className="text-base-content/50 font-mono">:</span>
      <input
        type="number"
        value={penalty2}
        onChange={(e) => onPenalty2Change(e.target.value)}
        placeholder="0"
        className="input input-bordered input-sm w-20 text-center"
        min={0}
        aria-label="Penalty player 2 score"
      />
    </div>
  </div>
);
