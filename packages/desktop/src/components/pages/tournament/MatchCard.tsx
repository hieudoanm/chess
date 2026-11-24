import type { FC } from 'react';
import type { Match } from '@/types';
import { formatMatchScore } from '@/lib/match-rules';

interface MatchCardProps {
  match: Match;
  getName: (id: string | null) => string;
}

export const MatchCard: FC<MatchCardProps> = ({ match: m, getName }) => {
  const display = formatMatchScore(m);

  return (
    <div className="border-base-content/10 bg-base-200 rounded-xl border p-3">
      <div
        className={`flex items-center justify-between rounded px-2 py-1 ${
          m.winnerId === m.participant1Id ? 'bg-primary/10' : ''
        }`}>
        <span
          className={`text-sm ${
            m.winnerId === m.participant1Id ? 'text-primary font-bold' : ''
          }`}>
          {getName(m.participant1Id)}
        </span>
      </div>
      <div className="border-base-content/10 flex items-center justify-between border-y px-2 py-1">
        <span className="font-mono text-sm">{display.main}</span>
        {m.isThirdPlaceMatch && (
          <span className="badge badge-outline badge-xs">Third Place</span>
        )}
      </div>
      <div
        className={`flex items-center justify-between rounded px-2 py-1 ${
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
        <div className="text-base-content/50 px-2 pt-1 text-center font-mono text-xs">
          {display.detail}
        </div>
      )}
    </div>
  );
};
