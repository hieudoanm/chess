import { type Match, type Participant, type MatchStatus } from '@/types';

interface MatchCardProps {
  match: Match;
  participant1?: Participant;
  participant2?: Participant;
  onClick?: () => void;
}

const STATUS_BADGE: Record<MatchStatus, string> = {
  scheduled: 'badge-info',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
  postponed: 'badge-ghost',
  walkover: 'badge-error',
};

export const MatchCard = ({
  match,
  participant1,
  participant2,
  onClick,
}: MatchCardProps) => {
  const name1 = participant1?.name ?? 'TBD';
  const name2 = participant2?.name ?? 'TBD';
  const isCompleted = match.status === 'completed';
  const score1 = match.participant1Score ?? 0;
  const score2 = match.participant2Score ?? 0;
  const winnerId = match.winnerId;

  return (
    <div
      className={`bg-base-200 border-base-content/10 rounded-lg border p-3 ${onClick ? 'hover:border-base-content/30 cursor-pointer transition-colors' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base-content/50 text-xs">
          {match.scheduledAt
            ? new Date(match.scheduledAt).toLocaleDateString()
            : ''}
        </span>
        <span className={`badge badge-sm ${STATUS_BADGE[match.status]}`}>
          {match.status}
        </span>
      </div>

      <div className="space-y-1">
        <div
          className={`flex items-center justify-between ${winnerId === match.participant1Id ? 'text-primary font-bold' : ''}`}>
          <span className="truncate">{name1}</span>
          {isCompleted && <span className="font-mono text-sm">{score1}</span>}
        </div>
        <div
          className={`flex items-center justify-between ${winnerId === match.participant2Id ? 'text-primary font-bold' : ''}`}>
          <span className="truncate">{name2}</span>
          {isCompleted && <span className="font-mono text-sm">{score2}</span>}
        </div>
      </div>
    </div>
  );
};
