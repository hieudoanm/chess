import type { FC } from 'react';
import type { Match } from '@/types';
import { formatMatchScore } from '@/lib/match-rules';

interface BracketCardProps {
  match: Match;
  getName: (id: string | null) => string;
}

export const BracketCard: FC<BracketCardProps> = ({ match: m, getName }) => {
  const display = formatMatchScore(m);

  return (
    <div className="border-base-content/10 bg-base-200 overflow-hidden rounded-xl border">
      <div
        className={`flex items-center justify-between px-3 py-2 ${
          m.winnerId === m.participant1Id ? 'bg-primary/10' : ''
        }`}>
        <span
          className={`text-sm ${
            m.winnerId === m.participant1Id ? 'text-primary font-bold' : ''
          }`}>
          {getName(m.participant1Id)}
        </span>
      </div>
      <div className="border-base-content/10 flex items-center justify-between border-y px-3 py-1">
        <span className="font-mono text-sm">{display.main}</span>
        {m.isThirdPlaceMatch && (
          <span className="badge badge-outline badge-xs">Third Place</span>
        )}
      </div>
      <div
        className={`flex items-center justify-between px-3 py-2 ${
          m.winnerId === m.participant2Id ? 'bg-primary/10' : ''
        }`}>
        <span
          className={`text-sm ${
            m.winnerId === m.participant2Id ? 'text-primary font-bold' : ''
          }`}>
          {getName(m.participant2Id)}
        </span>
      </div>
      {display.detail && (
        <div className="text-base-content/50 px-3 pb-2 text-center font-mono text-xs">
          {display.detail}
        </div>
      )}
    </div>
  );
};
