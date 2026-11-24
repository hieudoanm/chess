'use client';

import type { FC } from 'react';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/providers/DataProvider';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';
import { calculateStandings } from '@/data/models';
import type { StandingSnapshot } from '@/types';
import { StandingsTable } from './StandingsTable';

const StandingsPageContent: FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] =
    useState<StandingSnapshot | null>(null);

  const {
    tournaments,
    participants,
    matches,
    snapshots,
    createSnapshot,
    deleteSnapshot,
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

  const tournamentSnapshots = useMemo(
    () =>
      snapshots
        .filter((s) => s.tournamentId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [snapshots, id]
  );

  const standings = useMemo(
    () =>
      calculateStandings(
        tournamentMatches,
        tournamentParticipants.map((p) => p.id)
      ),
    [tournamentMatches, tournamentParticipants]
  );

  const getParticipantName = (participantId: string): string =>
    tournamentParticipants.find((p) => p.id === participantId)?.name ??
    'Unknown';

  const handleCaptureSnapshot = async (): Promise<void> => {
    if (!id) return;
    await createSnapshot(
      id,
      snapshotLabel.trim() || 'Standings snapshot',
      standings
    );
    setSnapshotLabel('');
  };

  const handleDeleteSnapshot = async (snapshotId: string): Promise<void> => {
    if (selectedSnapshot?.id === snapshotId) setSelectedSnapshot(null);
    await deleteSnapshot(snapshotId);
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

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <main className="container mx-auto flex flex-1 flex-col gap-6 p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
          <h3 className="mb-2 text-sm font-medium">Standings Snapshots</h3>
          <p className="text-base-content/50 mb-3 text-xs">
            Capture the current standings to compare how the table changes over
            time.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="Snapshot label (optional)"
              className="input input-sm input-bordered flex-1"
            />
            <button
              onClick={handleCaptureSnapshot}
              className="btn btn-primary btn-sm">
              Capture Snapshot
            </button>
          </div>

          {tournamentSnapshots.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {tournamentSnapshots.map((s) => (
                <div
                  key={s.id}
                  className="border-base-content/10 flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
                  <button
                    onClick={() =>
                      setSelectedSnapshot(
                        selectedSnapshot?.id === s.id ? null : s
                      )
                    }
                    className="text-left text-sm">
                    {s.label}
                    <span className="text-base-content/50 ml-2 text-xs">
                      {new Date(s.createdAt).toLocaleString()}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteSnapshot(s.id)}
                    className="btn btn-ghost btn-xs"
                    aria-label={`Delete snapshot ${s.label}`}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSnapshot ? (
          <div>
            <button
              onClick={() => setSelectedSnapshot(null)}
              className="btn btn-ghost btn-sm mb-2">
              ← Back to live standings
            </button>
            <StandingsTable
              standings={selectedSnapshot.standings}
              getParticipantName={getParticipantName}
            />
          </div>
        ) : (
          <>
            <StandingsTable
              standings={standings}
              getParticipantName={getParticipantName}
            />

            {standings.length === 0 && (
              <div className="text-base-content/50 py-8 text-center text-sm">
                No standings available yet. Complete some matches first.
              </div>
            )}
          </>
        )}
      </main>

      <Navbar items={NAV_ITEMS} />
    </div>
  );
};

export const StandingsPage: FC = () => (
  <Suspense>
    <StandingsPageContent />
  </Suspense>
);
