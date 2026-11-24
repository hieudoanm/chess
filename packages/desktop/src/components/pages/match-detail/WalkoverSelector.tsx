import type { FC } from 'react';

interface WalkoverSelectorProps {
  participant1Id: string;
  participant2Id: string;
  participant1Name: string;
  participant2Name: string;
  onWalkover: (winnerId: string) => void;
}

export const WalkoverSelector: FC<WalkoverSelectorProps> = ({
  participant1Id,
  participant2Id,
  participant1Name,
  participant2Name,
  onWalkover,
}) => (
  <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
    <h3 className="mb-1 text-sm font-medium">Walkover / Forfeit</h3>
    <p className="text-base-content/50 mb-3 text-xs">
      The opponent advances with no score.
    </p>
    <div className="flex gap-2">
      <button
        onClick={() => onWalkover(participant1Id)}
        className="btn btn-sm flex-1">
        Walkover: {participant1Name}
      </button>
      <button
        onClick={() => onWalkover(participant2Id)}
        className="btn btn-sm flex-1">
        Walkover: {participant2Name}
      </button>
    </div>
  </div>
);
