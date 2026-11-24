import type { FC } from 'react';

interface MatchParticipantsProps {
  participant1Name: string;
  participant2Name: string;
  winnerId: string | null;
  participant1Id: string | null;
  participant2Id: string | null;
}

export const MatchParticipants: FC<MatchParticipantsProps> = ({
  participant1Name,
  participant2Name,
  winnerId,
  participant1Id,
  participant2Id,
}) => (
  <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 flex-col items-center gap-2">
        <span
          className={`text-lg font-bold ${
            winnerId === participant1Id ? 'text-primary' : ''
          }`}>
          {participant1Name}
        </span>
        {winnerId === participant1Id && (
          <span className="badge badge-primary badge-sm">Winner</span>
        )}
      </div>

      <span className="text-base-content/50 font-mono text-2xl">vs</span>

      <div className="flex flex-1 flex-col items-center gap-2">
        <span
          className={`text-lg font-bold ${
            winnerId === participant2Id ? 'text-primary' : ''
          }`}>
          {participant2Name}
        </span>
        {winnerId === participant2Id && (
          <span className="badge badge-primary badge-sm">Winner</span>
        )}
      </div>
    </div>
  </div>
);
