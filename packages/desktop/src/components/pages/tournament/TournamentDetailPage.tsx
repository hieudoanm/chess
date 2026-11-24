'use client';

import type { FC } from 'react';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/providers/DataProvider';
import { calculateStandings } from '@/lib/standings';
import { generateBracket } from '@/lib/formats';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';
import { OverviewView } from './OverviewView';
import { BracketView } from './BracketView';
import { StandingsView } from './StandingsView';
import { MatchesView } from './MatchesView';
import { ParticipantsView } from './ParticipantsView';

type Tab = 'overview' | 'bracket' | 'standings' | 'matches' | 'participants';

const tabs: { label: string; value: Tab }[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Bracket', value: 'bracket' },
  { label: 'Standings', value: 'standings' },
  { label: 'Matches', value: 'matches' },
  { label: 'Participants', value: 'participants' },
];

const TournamentDetailPageContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const {
    tournaments,
    participants,
    matches,
    updateTournament,
    deleteTournament,
    createMatches,
    cloneTournament,
  } = useData();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const standings = useMemo(
    () =>
      calculateStandings(
        tournamentMatches,
        tournamentParticipants.map((p) => p.id),
        tournament?.id ?? '',
        {
          tiebreakers: tournament?.tiebreakers,
          scoringRule: tournament?.scoringRule,
          bestOf: tournament?.bestOf,
        }
      ),
    [tournamentMatches, tournamentParticipants, tournament]
  );

  const handleStart = async () => {
    if (!tournament) return;
    const participantIds = tournamentParticipants.map((p) => p.id);
    if (participantIds.length < 2) return;
    const bracketMatches = generateBracket(
      tournament.format,
      tournament.id,
      participantIds,
      { thirdPlacePlayoff: tournament.thirdPlacePlayoff }
    );
    await createMatches(bracketMatches);
    await updateTournament({ ...tournament, status: 'in-progress' });
  };

  const handleDelete = async () => {
    if (!tournament) return;
    await deleteTournament(tournament.id);
    router.push('/');
  };

  const handleClone = async () => {
    if (!tournament) return;
    const cloned = await cloneTournament(tournament.id);
    if (cloned) router.push(`/tournament?id=${cloned.id}`);
  };

  if (!id) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <p className="mb-4 text-6xl">⚠️</p>
        <h2 className="text-base-content/50 mb-2">No tournament selected</h2>
        <Link href="/" className="btn btn-primary btn-sm mt-4">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <div className="border-base-300 bg-base-100 sticky top-[65px] z-10 border-b px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`btn btn-sm btn-ghost rounded-b-none ${
                activeTab === tab.value
                  ? 'text-primary border-primary border-b-2'
                  : ''
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto flex flex-1 flex-col p-6">
        {activeTab === 'overview' && (
          <OverviewView
            tournament={tournament}
            participants={tournamentParticipants}
            matches={tournamentMatches}
            onStart={handleStart}
            onDelete={() => setShowDeleteConfirm(true)}
            onClone={handleClone}
          />
        )}

        {activeTab === 'bracket' && (
          <BracketView
            matches={tournamentMatches}
            participants={tournamentParticipants}
            format={tournament.format}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsView
            standings={standings}
            participants={tournamentParticipants}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            matches={tournamentMatches}
            participants={tournamentParticipants}
            tournamentId={tournament.id}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantsView
            tournament={tournament}
            participants={tournamentParticipants}
          />
        )}
      </main>

      {showDeleteConfirm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Delete Tournament?</h3>
            <p className="py-4">
              This action cannot be undone. All data will be lost.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-error">
                Delete
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowDeleteConfirm(false)}>close</button>
          </form>
        </dialog>
      )}

      <Navbar items={NAV_ITEMS} />
    </div>
  );
};

export const TournamentDetailPage: FC = () => (
  <Suspense>
    <TournamentDetailPageContent />
  </Suspense>
);
