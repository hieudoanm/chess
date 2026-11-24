import type { FC } from 'react';
import type { Participant } from '@/types';

interface ParticipantListProps {
  participants: Participant[];
  onRemove: (id: string) => void;
  onSeedChange?: (id: string, seed: number) => void;
  onRatingChange?: (id: string, rating: number) => void;
  onSelect?: (participant: Participant) => void;
}

export const ParticipantList: FC<ParticipantListProps> = ({
  participants,
  onRemove,
  onSeedChange,
  onRatingChange,
  onSelect,
}) => (
  <div className="flex flex-col gap-2">
    {participants.map((p) => (
      <div
        key={p.id}
        className="border-base-content/10 bg-base-200 flex items-center justify-between gap-2 rounded-xl border p-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onSeedChange ? (
            <input
              type="number"
              min={1}
              value={p.seed ?? 1}
              onChange={(e) =>
                onSeedChange(p.id, Math.max(1, Number(e.target.value) || 1))
              }
              className="input input-bordered input-sm w-16 text-center font-mono"
              aria-label={`Seed for ${p.name}`}
            />
          ) : (
            <span className="text-base-content/50 font-mono text-sm">
              #{p.seed ?? '-'}
            </span>
          )}
          <button
            onClick={() => onSelect?.(p)}
            className="hover:text-primary min-w-0 flex-1 truncate text-left text-sm font-medium"
            aria-label={`View profile for ${p.name}`}>
            {p.name}
          </button>
          {onRatingChange ? (
            <input
              type="number"
              min={0}
              value={p.rating ?? 0}
              onChange={(e) =>
                onRatingChange(p.id, Math.max(0, Number(e.target.value) || 0))
              }
              className="input input-bordered input-sm w-20 text-center"
              aria-label={`Rating for ${p.name}`}
            />
          ) : (
            p.rating !== undefined && (
              <span className="badge badge-sm badge-outline">{p.rating}</span>
            )
          )}
        </div>
        <button
          onClick={() => onRemove(p.id)}
          className="btn btn-ghost btn-xs text-error">
          Remove
        </button>
      </div>
    ))}
  </div>
);
