'use client';

import type { FC } from 'react';
import { Suspense, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/providers/DataProvider';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';
import { AddParticipantForm } from './AddParticipantForm';
import { BatchAddForm } from './BatchAddForm';
import { ParticipantList } from './ParticipantList';
import { GroupAssignment } from './GroupAssignment';
import { ParticipantProfileModal } from './ParticipantProfileModal';
import { assignGroups } from '@/lib/formats';
import { importParticipantsFromCSV, readFileAsText } from '@/lib/import';
import type { Participant } from '@/types';

const ParticipantsPageContent: FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [groupCount, setGroupCount] = useState(2);

  const {
    tournaments,
    participants,
    matches,
    groups,
    createParticipant,
    createParticipants,
    createGroup,
    updateParticipant,
    deleteParticipant,
  } = useData();

  const tournament = useMemo(
    () => tournaments.find((t) => t.id === id),
    [tournaments, id]
  );

  const tournamentParticipants = useMemo(
    () => participants.filter((p) => p.tournamentId === id),
    [participants, id]
  );

  const tournamentGroups = useMemo(
    () => groups.filter((g) => g.tournamentId === id),
    [groups, id]
  );

  const sortedParticipants = useMemo(
    () =>
      [...tournamentParticipants].sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0)),
    [tournamentParticipants]
  );

  const [newName, setNewName] = useState('');
  const [batchText, setBatchText] = useState('');
  const [showBatch, setShowBatch] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);

  const getParticipantName = (participantId: string | null): string => {
    if (!participantId) return 'TBD';
    return (
      tournamentParticipants.find((p) => p.id === participantId)?.name ?? 'TBD'
    );
  };

  const handleAdd = async () => {
    if (!newName.trim() || !id) return;
    await createParticipant({
      tournamentId: id,
      name: newName.trim(),
      seed: tournamentParticipants.length + 1,
    });
    setNewName('');
  };

  const handleBatchAdd = async () => {
    if (!id) return;
    const names = batchText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    await createParticipants(
      names.map((name, i) => ({
        tournamentId: id,
        name,
        seed: tournamentParticipants.length + i + 1,
      }))
    );
    setBatchText('');
    setShowBatch(false);
  };

  const handleRemove = async (participantId: string) => {
    await deleteParticipant(participantId);
  };

  const handleSeedChange = async (participantId: string, seed: number) => {
    const p = tournamentParticipants.find((x) => x.id === participantId);
    if (p) await updateParticipant({ ...p, seed });
  };

  const handleRatingChange = async (participantId: string, rating: number) => {
    const p = tournamentParticipants.find((x) => x.id === participantId);
    if (p) await updateParticipant({ ...p, rating });
  };

  const handleAutoSeedByRating = async () => {
    const sorted = [...tournamentParticipants].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
    );
    for (let i = 0; i < sorted.length; i++) {
      await updateParticipant({ ...sorted[i], seed: i + 1 });
    }
  };

  const handleRandomizeSeeds = async () => {
    const shuffled = [...tournamentParticipants].sort(
      () => Math.random() - 0.5
    );
    for (let i = 0; i < shuffled.length; i++) {
      await updateParticipant({ ...shuffled[i], seed: i + 1 });
    }
  };

  const handleAutoAssignGroups = async () => {
    if (!id) return;
    let groupsToUse = tournamentGroups;
    if (groupsToUse.length === 0) {
      const created = [];
      for (let i = 0; i < groupCount; i++) {
        created.push(
          await createGroup({
            tournamentId: id,
            name: `Group ${String.fromCharCode(65 + i)}`,
            participantIds: [],
          })
        );
      }
      groupsToUse = created;
    }

    const assignment = assignGroups(
      sortedParticipants.map((p) => p.id),
      groupsToUse.length
    );
    for (let i = 0; i < groupsToUse.length; i++) {
      const group = groupsToUse[i];
      const memberIds = assignment[i] ?? [];
      await updateParticipantGroupForIds(group.id, memberIds);
    }
  };

  const updateParticipantGroupForIds = async (
    groupId: string,
    memberIds: string[]
  ) => {
    for (const memberId of memberIds) {
      const p = tournamentParticipants.find((x) => x.id === memberId);
      if (p && p.groupId !== groupId) {
        await updateParticipant({ ...p, groupId });
      }
    }
  };

  const handleGroupAssign = async (
    participantId: string,
    groupId: string | undefined
  ) => {
    const p = tournamentParticipants.find((x) => x.id === participantId);
    if (p) await updateParticipant({ ...p, groupId });
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const text = await readFileAsText(file);
    const imported = importParticipantsFromCSV(text);
    if (imported.length > 0) {
      await createParticipants(
        imported.map((p, i) => ({
          tournamentId: id,
          name: p.name,
          seed: p.seed ?? tournamentParticipants.length + i + 1,
          rating: p.rating,
        }))
      );
    }
    if (csvInputRef.current) csvInputRef.current.value = '';
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

  const isGroupStage = tournament.format === 'group-stage';

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-6">
        <AddParticipantForm
          value={newName}
          onChange={setNewName}
          onAdd={handleAdd}
          disabled={
            !newName.trim() ||
            tournamentParticipants.length >= tournament.maxParticipants
          }
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBatch(!showBatch)}
            className="btn btn-ghost btn-sm">
            {showBatch ? 'Hide Batch' : 'Batch Add'}
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="btn btn-ghost btn-sm">
            Import CSV
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
            aria-label="Import participants CSV"
          />
        </div>

        {showBatch && (
          <BatchAddForm
            value={batchText}
            onChange={setBatchText}
            onAdd={handleBatchAdd}
            onClose={() => setShowBatch(false)}
          />
        )}

        {tournamentParticipants.length > 0 && (
          <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
            <h3 className="mb-3 text-sm font-medium">Seeding</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAutoSeedByRating}
                className="btn btn-ghost btn-sm">
                Auto-seed by Rating
              </button>
              <button
                onClick={handleRandomizeSeeds}
                className="btn btn-ghost btn-sm">
                Randomize Seeds
              </button>
            </div>
          </div>
        )}

        {isGroupStage && (
          <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
            <h3 className="mb-3 text-sm font-medium">Groups</h3>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={1}
                max={8}
                value={groupCount}
                onChange={(e) =>
                  setGroupCount(Math.max(1, Number(e.target.value) || 1))
                }
                className="input input-bordered input-sm w-20 text-center"
                aria-label="Number of groups"
              />
              <button
                onClick={handleAutoAssignGroups}
                className="btn btn-primary btn-sm">
                Auto-assign Groups
              </button>
            </div>
            <GroupAssignment
              participants={tournamentParticipants}
              groups={tournamentGroups}
              onAssign={handleGroupAssign}
            />
          </div>
        )}

        <ParticipantList
          participants={sortedParticipants}
          onRemove={handleRemove}
          onSeedChange={handleSeedChange}
          onRatingChange={handleRatingChange}
          onSelect={setSelectedParticipant}
        />

        {tournamentParticipants.length === 0 && (
          <div className="text-base-content/50 py-8 text-center text-sm">
            No participants yet. Add some to get started.
          </div>
        )}
      </main>

      <Navbar items={NAV_ITEMS} />

      <ParticipantProfileModal
        participant={selectedParticipant}
        matches={matches}
        getParticipantName={getParticipantName}
        onClose={() => setSelectedParticipant(null)}
      />
    </div>
  );
};

export const ParticipantsPage: FC = () => (
  <Suspense>
    <ParticipantsPageContent />
  </Suspense>
);
