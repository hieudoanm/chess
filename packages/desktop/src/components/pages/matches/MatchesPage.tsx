'use client';

import type { FC } from 'react';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/providers/DataProvider';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';
import { CalendarView } from '@/components/organisms/CalendarView';
import { autoSchedule } from '@/lib/scheduling';
import { MatchListItem } from './MatchListItem';

const MatchesPageContent: FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const {
    tournaments,
    participants,
    matches,
    createMatch: addMatch,
    updateMatch,
  } = useData();

  const tournament = useMemo(
    () => tournaments.find((t) => t.id === id),
    [tournaments, id]
  );

  const tournamentParticipants = useMemo(
    () => participants.filter((p) => p.tournamentId === id),
    [participants, id]
  );

  const tournamentMatches = useMemo(
    () => matches.filter((m) => m.tournamentId === id),
    [matches, id]
  );

  const getParticipantName = (participantId: string | null): string => {
    if (!participantId) return 'TBD';
    return (
      tournamentParticipants.find((p) => p.id === participantId)?.name ?? 'TBD'
    );
  };

  const handleReschedule = async (
    matchId: string,
    start: number
  ): Promise<void> => {
    const match = tournamentMatches.find((m) => m.id === matchId);
    if (!match) return;
    await updateMatch({ ...match, scheduledAt: start });
  };

  const handleAutoSchedule = async (): Promise<void> => {
    const slots = autoSchedule(
      tournamentMatches,
      ['Court 1', 'Court 2'],
      60,
      tournament?.startDate ?? Date.now()
    );
    for (const slot of slots) {
      const match = tournamentMatches.find((m) => m.id === slot.matchId);
      if (match) {
        await updateMatch({
          ...match,
          scheduledAt: slot.start,
          venue: slot.venue,
        });
      }
    }
  };

  if (!id || !tournament) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <p className="mb-4 text-6xl">⚠️</p>
        <h2 className="text-base-content/50 mb-2">Tournament not found</h2>
        <Link href="/" className="btn btn-primary btn-sm mt-4">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const rounds = Array.from(
    new Set(tournamentMatches.map((m) => m.round))
  ).sort((a, b) => a - b);

  const handleAddMatch = async () => {
    const round = rounds.length > 0 ? Math.max(...rounds) + 1 : 1;
    await addMatch({
      tournamentId: id,
      round,
      participant1Id: null,
      participant2Id: null,
      participant1Score: null,
      participant2Score: null,
      winnerId: null,
      status: 'scheduled',
    });
  };

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <main className="container mx-auto flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddMatch}
            className="btn btn-primary btn-sm w-fit">
            Add Match
          </button>
          <button
            onClick={handleAutoSchedule}
            className="btn btn-ghost btn-sm w-fit">
            Auto Schedule
          </button>
          <div className="join join-horizontal">
            <button
              onClick={() => setView('list')}
              className={`btn btn-sm join-item ${
                view === 'list' ? 'btn-active' : ''
              }`}>
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`btn btn-sm join-item ${
                view === 'calendar' ? 'btn-active' : ''
              }`}>
              Calendar
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <CalendarView
            matches={tournamentMatches}
            getParticipantName={getParticipantName}
            onReschedule={handleReschedule}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {rounds.map((round) => (
              <div key={round}>
                <h3 className="mb-2 text-sm font-medium">Round {round}</h3>
                <div className="flex flex-col gap-2">
                  {tournamentMatches
                    .filter((m) => m.round === round)
                    .map((m) => (
                      <MatchListItem
                        key={m.id}
                        id={m.id}
                        participant1Name={getParticipantName(m.participant1Id)}
                        participant2Name={getParticipantName(m.participant2Id)}
                        participant1Score={m.participant1Score}
                        participant2Score={m.participant2Score}
                        status={m.status}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tournamentMatches.length === 0 && (
          <div className="text-base-content/50 py-8 text-center text-sm">
            No matches yet. Start the tournament or add matches manually.
          </div>
        )}
      </main>

      <Navbar items={NAV_ITEMS} />
    </div>
  );
};

export const MatchesPage: FC = () => (
  <Suspense>
    <MatchesPageContent />
  </Suspense>
);
