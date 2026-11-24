'use client';

import { formatDate } from '@/lib/utils';
import { useData } from '@/providers/DataProvider';
import type { Tournament } from '@/types';
import Link from 'next/link';
import { useCallback } from 'react';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import {
  ContextMenu,
  type ContextMenuItem,
} from '@/components/atoms/ContextMenu';
import { FormatBadge } from './FormatBadge';
import { StatusBadge } from './StatusBadge';

interface TournamentCardProps {
  tournament: Tournament;
  participantCount: number;
}

export const TournamentCard = ({
  tournament,
  participantCount,
}: TournamentCardProps) => {
  const {
    participants,
    matches,
    groups,
    deleteTournament,
    createTournament,
    createParticipants,
    createMatches,
    createGroup,
  } = useData();

  const handleClone = useCallback(async () => {
    const t = await createTournament({
      name: `${tournament.name} (Copy)`,
      description: tournament.description,
      format: tournament.format,
      status: 'draft',
      maxParticipants: tournament.maxParticipants,
    });

    const tournamentParticipants = participants.filter(
      (p) => p.tournamentId === tournament.id
    );
    if (tournamentParticipants.length > 0) {
      const newParticipants = await createParticipants(
        tournamentParticipants.map((p) => ({
          tournamentId: t.id,
          name: p.name,
          seed: p.seed,
          rating: p.rating,
          groupId: p.groupId,
        }))
      );

      const oldToNew = new Map(
        tournamentParticipants.map((p, i) => [p.id, newParticipants[i].id])
      );

      const tournamentMatches = matches.filter(
        (m) => m.tournamentId === tournament.id
      );
      if (tournamentMatches.length > 0) {
        await createMatches(
          tournamentMatches.map((m) => ({
            tournamentId: t.id,
            round: m.round,
            bracket: m.bracket,
            participant1Id: m.participant1Id
              ? (oldToNew.get(m.participant1Id) ?? null)
              : null,
            participant2Id: m.participant2Id
              ? (oldToNew.get(m.participant2Id) ?? null)
              : null,
            participant1Score: null,
            participant2Score: null,
            winnerId: null,
            status: 'scheduled' as const,
          }))
        );
      }

      const tournamentGroups = groups.filter(
        (g) => g.tournamentId === tournament.id
      );
      for (const g of tournamentGroups) {
        await createGroup({
          tournamentId: t.id,
          name: g.name,
          participantIds: g.participantIds
            .map((pid) => oldToNew.get(pid))
            .filter((pid): pid is string => pid !== undefined),
        });
      }
    }
  }, [
    tournament,
    participants,
    matches,
    groups,
    createTournament,
    createParticipants,
    createMatches,
    createGroup,
  ]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Delete "${tournament.name}"?`)) {
      deleteTournament(tournament.id);
    }
  }, [tournament, deleteTournament]);

  const contextItems: ContextMenuItem[] = [
    { label: 'Clone', icon: <FiCopy />, onClick: handleClone },
    ...(!tournament.isSample
      ? [
          {
            label: 'Delete',
            icon: <FiTrash2 />,
            destructive: true,
            onClick: handleDelete,
          },
        ]
      : []),
  ];

  return (
    <ContextMenu items={contextItems}>
      <Link
        href={`/tournament?id=${tournament.id}`}
        className="border-base-content/10 bg-base-200 hover:bg-base-300 block rounded-2xl border p-3 transition-colors sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base-content truncate text-base font-medium">
              {tournament.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <FormatBadge format={tournament.format} />
              <StatusBadge status={tournament.status} />
            </div>
          </div>
          <div className="text-base-content/50 flex shrink-0 flex-col items-end gap-1 text-xs">
            <span>
              {participantCount}/{tournament.maxParticipants}
            </span>
            <span>{formatDate(tournament.createdAt)}</span>
          </div>
        </div>
      </Link>
    </ContextMenu>
  );
};
