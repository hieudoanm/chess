'use client';

import type { FC } from 'react';
import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/providers/DataProvider';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';
import { advanceBracketWinners } from '@/lib/formats';
import { getAggregateScores, resolveMatchResult } from '@/lib/match-rules';
import type { Match, MatchSet } from '@/types';
import { MatchParticipants } from './MatchParticipants';
import { ScoreEditor } from './ScoreEditor';
import { SetEditor, type SetRow } from './SetEditor';
import { PenaltyEditor } from './PenaltyEditor';
import { WinnerSelector } from './WinnerSelector';
import { WalkoverSelector } from './WalkoverSelector';

type MatchPatch = Partial<
  Omit<
    Match,
    'id' | 'tournamentId' | 'round' | 'participant1Id' | 'participant2Id'
  >
>;

const parseOptionalNumber = (value: string): number | null =>
  value === '' ? null : Number(value);

const MatchDetailPageContent: FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { tournaments, participants, matches, groups, updateMatch } = useData();

  const match = useMemo(() => matches.find((m) => m.id === id), [matches, id]);

  const tournament = useMemo(
    () => tournaments.find((t) => t.id === match?.tournamentId),
    [tournaments, match]
  );

  const bestOf = tournament?.bestOf ?? 1;
  const scoringRule = tournament?.scoringRule ?? 'standard';
  const useSetsEntry = bestOf > 1 || scoringRule === 'sets';
  const usePenaltyEntry = scoringRule === 'penalty-shootout';

  const participant1 = useMemo(
    () =>
      match?.participant1Id
        ? participants.find((p) => p.id === match.participant1Id)
        : undefined,
    [participants, match]
  );

  const participant2 = useMemo(
    () =>
      match?.participant2Id
        ? participants.find((p) => p.id === match.participant2Id)
        : undefined,
    [participants, match]
  );

  const [score1, setScore1] = useState<string>('');
  const [score2, setScore2] = useState<string>('');
  const [sets, setSets] = useState<SetRow[]>([]);
  const [penalty1, setPenalty1] = useState<string>('');
  const [penalty2, setPenalty2] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!match) return;
    setScore1(match.participant1Score?.toString() ?? '');
    setScore2(match.participant2Score?.toString() ?? '');
    setPenalty1(match.penaltyScore1?.toString() ?? '');
    setPenalty2(match.penaltyScore2?.toString() ?? '');
    setSets(
      (match.sets ?? []).map((s) => ({
        p1Score: String(s.p1Score),
        p2Score: String(s.p2Score),
      }))
    );
  }, [match]);

  const advanceAndPersist = async (patch: MatchPatch): Promise<void> => {
    if (!match) return;
    const updatedMatch: Match = { ...match, ...patch };
    await updateMatch(updatedMatch);

    const merged = matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    );
    const scoped = merged.filter((m) => m.tournamentId === match.tournamentId);
    const isGroupStage = tournament?.format === 'group-stage';
    const advanced = advanceBracketWinners(scoped, {
      groups: isGroupStage
        ? groups.filter((g) => g.tournamentId === match.tournamentId)
        : undefined,
      participants: isGroupStage
        ? participants.filter((p) => p.tournamentId === match.tournamentId)
        : undefined,
      scoringRule: tournament?.scoringRule,
      tiebreakers: tournament?.tiebreakers,
      bestOf: tournament?.bestOf,
    });

    for (const next of advanced) {
      const original = scoped.find((m) => m.id === next.id);
      if (
        next.id !== updatedMatch.id &&
        original &&
        (next.participant1Id !== original.participant1Id ||
          next.participant2Id !== original.participant2Id)
      ) {
        await updateMatch(next);
      }
    }
  };

  const buildSetsPatch = (): MatchPatch => {
    const rows = sets.filter(
      (s) => s.p1Score.trim() !== '' || s.p2Score.trim() !== ''
    );
    const parsedSets: MatchSet[] = rows.map((s) => ({
      p1Score: Number(s.p1Score) || 0,
      p2Score: Number(s.p2Score) || 0,
    }));
    const aggregate = getAggregateScores({
      sets: parsedSets,
      participant1Score: null,
      participant2Score: null,
    });
    const penaltyScore1 = usePenaltyEntry
      ? parseOptionalNumber(penalty1)
      : null;
    const penaltyScore2 = usePenaltyEntry
      ? parseOptionalNumber(penalty2)
      : null;
    const resolved = resolveMatchResult(
      {
        participant1Id: match!.participant1Id,
        participant2Id: match!.participant2Id,
        sets: parsedSets,
        participant1Score: aggregate.p1Score,
        participant2Score: aggregate.p2Score,
        penaltyScore1,
        penaltyScore2,
      },
      { scoringRule }
    );

    return {
      status: 'completed',
      winnerId: resolved.winnerId,
      participant1Score: aggregate.p1Score,
      participant2Score: aggregate.p2Score,
      sets: parsedSets.length > 0 ? parsedSets : undefined,
      penaltyScore1,
      penaltyScore2,
    };
  };

  const buildStandardPatch = (): MatchPatch => {
    const p1Score = parseOptionalNumber(score1);
    const p2Score = parseOptionalNumber(score2);
    const penaltyScore1 = usePenaltyEntry
      ? parseOptionalNumber(penalty1)
      : null;
    const penaltyScore2 = usePenaltyEntry
      ? parseOptionalNumber(penalty2)
      : null;
    const resolved = resolveMatchResult(
      {
        participant1Id: match!.participant1Id,
        participant2Id: match!.participant2Id,
        sets: undefined,
        participant1Score: p1Score,
        participant2Score: p2Score,
        penaltyScore1,
        penaltyScore2,
      },
      { scoringRule }
    );

    return {
      status: 'completed',
      winnerId: resolved.winnerId,
      participant1Score: p1Score,
      participant2Score: p2Score,
      sets: undefined,
      penaltyScore1,
      penaltyScore2,
    };
  };

  const handleSaveScore = async (): Promise<void> => {
    if (!match) return;
    setSaving(true);
    await advanceAndPersist(
      useSetsEntry ? buildSetsPatch() : buildStandardPatch()
    );
    setSaving(false);
  };

  const handleSetWinner = async (winnerId: string): Promise<void> => {
    if (!match) return;
    await advanceAndPersist({
      winnerId,
      status: 'completed',
      participant1Score: null,
      participant2Score: null,
    });
  };

  const handleWalkover = async (winnerId: string): Promise<void> => {
    if (!match) return;
    setSaving(true);
    await advanceAndPersist({
      winnerId,
      status: 'walkover',
      participant1Score: null,
      participant2Score: null,
      sets: undefined,
      penaltyScore1: null,
      penaltyScore2: null,
    });
    setSaving(false);
  };

  const handleReset = async (): Promise<void> => {
    if (!match) return;
    setSaving(true);
    await advanceAndPersist({
      winnerId: null,
      status: 'scheduled',
      participant1Score: null,
      participant2Score: null,
      sets: undefined,
      penaltyScore1: null,
      penaltyScore2: null,
    });
    setSaving(false);
  };

  if (!id || !match) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <p className="mb-4 text-6xl">⚠️</p>
        <h2 className="text-base-content/50 mb-2">Match not found</h2>
        <Link href="/" className="btn btn-primary btn-sm mt-4">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const canReset = match.status === 'completed' || match.status === 'walkover';

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <main className="container mx-auto flex flex-1 flex-col gap-6 p-6">
        <MatchParticipants
          participant1Name={participant1?.name ?? 'TBD'}
          participant2Name={participant2?.name ?? 'TBD'}
          winnerId={match.winnerId}
          participant1Id={match.participant1Id}
          participant2Id={match.participant2Id}
        />

        {useSetsEntry ? (
          <SetEditor
            sets={sets}
            maxSets={bestOf}
            onSetsChange={setSets}
            onSave={handleSaveScore}
            saving={saving}
          />
        ) : (
          <ScoreEditor
            score1={score1}
            score2={score2}
            onScore1Change={setScore1}
            onScore2Change={setScore2}
            onSave={handleSaveScore}
            saving={saving}
          />
        )}

        {usePenaltyEntry && (
          <PenaltyEditor
            penalty1={penalty1}
            penalty2={penalty2}
            onPenalty1Change={setPenalty1}
            onPenalty2Change={setPenalty2}
          />
        )}

        {match.participant1Id && match.participant2Id && (
          <>
            <WinnerSelector
              participant1Id={match.participant1Id}
              participant2Id={match.participant2Id}
              participant1Name={participant1?.name ?? 'Player 1'}
              participant2Name={participant2?.name ?? 'Player 2'}
              winnerId={match.winnerId}
              onSelect={handleSetWinner}
            />
            <WalkoverSelector
              participant1Id={match.participant1Id}
              participant2Id={match.participant2Id}
              participant1Name={participant1?.name ?? 'Player 1'}
              participant2Name={participant2?.name ?? 'Player 2'}
              onWalkover={handleWalkover}
            />
          </>
        )}

        {canReset && (
          <button
            onClick={handleReset}
            className="btn btn-outline btn-sm w-full"
            disabled={saving}>
            Reset Result
          </button>
        )}

        <Link
          href={`/matches?tournamentId=${match.tournamentId}`}
          className="btn btn-ghost btn-sm w-full">
          Back to Matches
        </Link>
      </main>

      <Navbar items={NAV_ITEMS} />
    </div>
  );
};

export const MatchDetailPage: FC = () => (
  <Suspense>
    <MatchDetailPageContent />
  </Suspense>
);
