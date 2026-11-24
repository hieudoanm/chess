'use client';

import type { FC, ReactNode } from 'react';
import type { Group, Participant } from '@/types';

interface GroupAssignmentProps {
  participants: Participant[];
  groups: Group[];
  onAssign: (participantId: string, groupId: string | undefined) => void;
}

export const GroupAssignment: FC<GroupAssignmentProps> = ({
  participants,
  groups,
  onAssign,
}) => {
  const unassigned = participants.filter((p) => !p.groupId);

  const renderParticipant = (p: Participant): ReactNode => (
    <div
      key={p.id}
      className="border-base-content/10 bg-base-200 flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs">
      <span className="truncate font-medium">{p.name}</span>
      <select
        value={p.groupId ?? ''}
        onChange={(e) =>
          onAssign(p.id, e.target.value === '' ? undefined : e.target.value)
        }
        className="select select-bordered select-xs ml-auto"
        aria-label={`Group for ${p.name}`}>
        <option value="">None</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {groups.map((group) => {
          const members = participants.filter((p) => p.groupId === group.id);
          return (
            <div
              key={group.id}
              className="border-base-content/10 rounded-xl border p-3">
              <h4 className="mb-2 text-sm font-medium">
                {group.name}{' '}
                <span className="text-base-content/50 text-xs">
                  ({members.length})
                </span>
              </h4>
              <div className="flex flex-col gap-1.5">
                {members.map(renderParticipant)}
                {members.length === 0 && (
                  <p className="text-base-content/50 text-xs">Empty group.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {unassigned.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">
            Unassigned ({unassigned.length})
          </h4>
          <div className="flex flex-col gap-1.5">
            {unassigned.map(renderParticipant)}
          </div>
        </div>
      )}
    </div>
  );
};
