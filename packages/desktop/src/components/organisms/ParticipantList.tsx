import { useState } from 'react';
import { type Participant } from '@/types';

interface ParticipantListProps {
  participants: Participant[];
  onRemove?: (id: string) => void;
  onAdd?: (name: string) => void;
  onBatchAdd?: (names: string[]) => void;
}

export const ParticipantList = ({
  participants,
  onRemove,
  onAdd,
  onBatchAdd,
}: ParticipantListProps) => {
  const [name, setName] = useState('');
  const [batchText, setBatchText] = useState('');
  const [showBatch, setShowBatch] = useState(false);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed || !onAdd) return;
    onAdd(trimmed);
    setName('');
  };

  const handleBatchAdd = () => {
    if (!onBatchAdd) return;
    const names = batchText
      .split('\n')
      .map((name: string) => name.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    onBatchAdd(names);
    setBatchText('');
  };

  return (
    <div className="space-y-4">
      {onAdd && (
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
            placeholder="Participant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            Add
          </button>
        </div>
      )}

      {onBatchAdd && (
        <div className="collapse-arrow bg-base-200 border-base-content/10 collapse border">
          <input
            type="checkbox"
            checked={showBatch}
            onChange={(e) => setShowBatch(e.target.checked)}
          />
          <div className="collapse-title text-sm font-medium">Batch Add</div>
          <div className="collapse-content space-y-2">
            <textarea
              className="textarea textarea-bordered w-full text-sm"
              placeholder="One name per line"
              rows={4}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={handleBatchAdd}>
              Add All
            </button>
          </div>
        </div>
      )}

      {participants.length === 0 ? (
        <div className="text-base-content/40 py-8 text-center">
          No participants yet
        </div>
      ) : (
        <ul className="divide-base-content/10 divide-y">
          {participants.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center justify-between px-1 py-2">
              <div className="flex items-center gap-3">
                <span className="text-base-content/40 w-6 text-right text-xs">
                  {i + 1}
                </span>
                {p.seed != null && (
                  <span className="badge badge-sm badge-outline">
                    Seed {p.seed}
                  </span>
                )}
                <span className="font-medium">{p.name}</span>
              </div>
              {onRemove && (
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => onRemove(p.id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
