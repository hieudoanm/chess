'use client';

import { useMemo, type FC } from 'react';
import type { Match, Participant } from '@/types';

interface ParticipantProfileModalProps {
  participant: Participant | null;
  matches: Match[];
  getParticipantName: (participantId: string | null) => string;
  onClose: () => void;
}

const statusBadgeClass: Record<Match['status'], string> = {
  scheduled: 'badge-neutral',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
  postponed: 'badge-info',
  walkover: 'badge-error',
};

export const ParticipantProfileModal: FC<ParticipantProfileModalProps> = ({
  participant,
  matches,
  getParticipantName,
  onClose,
}) => {
  const involvedMatches = useMemo(
    () =>
      participant
        ? matches
            .filter(
              (m) =>
                m.participant1Id === participant.id ||
                m.participant2Id === participant.id
            )
            .sort((a, b) => (b.round ?? 0) - (a.round ?? 0))
        : [],
    [matches, participant]
  );

  const stats = useMemo(() => {
    const completed = involvedMatches.filter((m) => m.status === 'completed');
    if (!participant) return { played: 0, won: 0, drawn: 0, lost: 0 };
    const won = completed.filter((m) => m.winnerId === participant.id).length;
    const played = completed.length;
    return {
      played,
      won,
      drawn: 0,
      lost: played - won,
    };
  }, [involvedMatches, participant]);

  if (!participant) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-semibold">{participant.name}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="badge badge-sm badge-outline">
            Seed: {participant.seed ?? '-'}
          </span>
          {participant.rating !== undefined && (
            <span className="badge badge-sm badge-outline">
              Rating: {participant.rating}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            ['Played', stats.played],
            ['Won', stats.won],
            ['Drawn', stats.drawn],
            ['Lost', stats.lost],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-base-content/10 rounded-xl border p-2">
              <div className="font-mono text-lg font-bold">{value}</div>
              <div className="text-base-content/50 text-xs">{label}</div>
            </div>
          ))}
        </div>

        <h4 className="mt-4 mb-2 text-sm font-medium">Recent Matches</h4>
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {involvedMatches.length === 0 && (
            <p className="text-base-content/50 text-xs">No matches yet.</p>
          )}
          {involvedMatches.slice(0, 8).map((m) => {
            const opponentId =
              m.participant1Id === participant.id
                ? m.participant2Id
                : m.participant1Id;
            const opponentName = getParticipantName(opponentId);
            const ownScore =
              m.participant1Id === participant.id
                ? m.participant1Score
                : m.participant2Score;
            const oppScore =
              m.participant1Id === participant.id
                ? m.participant2Score
                : m.participant1Score;
            const won = m.winnerId === participant.id;
            return (
              <div
                key={m.id}
                className="border-base-content/10 flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs">
                <span
                  className={`truncate ${won ? 'text-primary font-medium' : ''}`}>
                  vs {opponentName}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono">
                    {ownScore ?? '-'} : {oppScore ?? '-'}
                  </span>
                  <span
                    className={`badge badge-xs ${statusBadgeClass[m.status]}`}>
                    {m.status}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
