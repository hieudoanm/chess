import type { FC } from 'react';

interface WinnerSelectorProps {
  participant1Id: string;
  participant2Id: string;
  participant1Name: string;
  participant2Name: string;
  winnerId: string | null;
  onSelect: (winnerId: string) => void;
}

export const WinnerSelector: FC<WinnerSelectorProps> = ({
  participant1Id,
  participant2Id,
  participant1Name,
  participant2Name,
  winnerId,
  onSelect,
}) => (
  <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
    <h3 className="mb-3 text-sm font-medium">Set Winner</h3>
    <div className="flex gap-2">
      <button
        onClick={() => onSelect(participant1Id)}
        className={`btn btn-sm flex-1 ${
          winnerId === participant1Id ? 'btn-primary' : 'btn-ghost'
        }`}>
        {participant1Name}
      </button>
      <button
        onClick={() => onSelect(participant2Id)}
        className={`btn btn-sm flex-1 ${
          winnerId === participant2Id ? 'btn-primary' : 'btn-ghost'
        }`}>
        {participant2Name}
      </button>
    </div>
  </div>
);
