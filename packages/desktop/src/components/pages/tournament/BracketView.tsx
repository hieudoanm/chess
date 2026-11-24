import type { FC } from 'react';
import { useData } from '@/providers/DataProvider';
import { MatchCard } from './MatchCard';

interface BracketViewProps {
  matches: ReturnType<typeof useData>['matches'];
  participants: ReturnType<typeof useData>['participants'];
  format: string;
}

export const BracketView: FC<BracketViewProps> = ({
  matches,
  participants,
  format,
}) => {
  const getName = (id: string | null) =>
    id ? (participants.find((p) => p.id === id)?.name ?? 'TBD') : 'BYE';

  if (format === 'round-robin' || format === 'swiss' || format === 'league') {
    return <RoundRobinBracket matches={matches} getName={getName} />;
  }

  if (format === 'double-elimination') {
    return <DoubleEliminationBracket matches={matches} getName={getName} />;
  }

  return <EliminationBracket matches={matches} getName={getName} />;
};

const EliminationBracket: FC<{
  matches: ReturnType<typeof useData>['matches'];
  getName: (id: string | null) => string;
}> = ({ matches, getName }) => {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort(
    (a, b) => a - b
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {rounds.map((round) => (
        <div key={round} className="min-w-[200px] flex-shrink-0">
          <h3 className="mb-2 text-center text-sm font-medium">
            {round === rounds[rounds.length - 1] && rounds.length > 1
              ? 'Final'
              : `Round ${round}`}
          </h3>
          <div className="flex flex-col gap-3">
            {matches
              .filter((m) => m.round === round)
              .map((m) => (
                <MatchCard key={m.id} match={m} getName={getName} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const RoundRobinBracket: FC<{
  matches: ReturnType<typeof useData>['matches'];
  getName: (id: string | null) => string;
}> = ({ matches, getName }) => {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort(
    (a, b) => a - b
  );

  return (
    <div className="flex flex-col gap-4">
      {rounds.map((round) => (
        <div key={round}>
          <h3 className="mb-2 text-sm font-medium">Round {round}</h3>
          <div className="flex flex-col gap-2">
            {matches
              .filter((m) => m.round === round)
              .map((m) => (
                <div
                  key={m.id}
                  className="border-base-content/10 bg-base-200 rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        m.winnerId === m.participant1Id
                          ? 'text-primary font-bold'
                          : ''
                      }`}>
                      {getName(m.participant1Id)}
                    </span>
                    <span className="text-base-content/50 font-mono text-sm">
                      {m.participant1Score ?? '-'} :{' '}
                      {m.participant2Score ?? '-'}
                    </span>
                    <span
                      className={`text-sm ${
                        m.winnerId === m.participant2Id
                          ? 'text-primary font-bold'
                          : ''
                      }`}>
                      {getName(m.participant2Id)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const DoubleEliminationBracket: FC<{
  matches: ReturnType<typeof useData>['matches'];
  getName: (id: string | null) => string;
}> = ({ matches, getName }) => {
  const winners = matches.filter((m) => m.bracket === 'winners');
  const losers = matches.filter((m) => m.bracket === 'losers');
  const finals = matches.filter((m) => m.bracket === 'final');

  const renderBracket = (label: string, bracketMatches: typeof matches) => {
    const rounds = Array.from(new Set(bracketMatches.map((m) => m.round))).sort(
      (a, b) => a - b
    );

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold">{label}</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {rounds.map((round) => (
            <div key={round} className="min-w-[200px] flex-shrink-0">
              <h4 className="mb-2 text-center text-xs font-medium">
                {round === rounds[rounds.length - 1] && rounds.length > 1
                  ? 'Final'
                  : `Round ${round}`}
              </h4>
              <div className="flex flex-col gap-3">
                {bracketMatches
                  .filter((m) => m.round === round)
                  .map((m) => (
                    <MatchCard key={m.id} match={m} getName={getName} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {winners.length > 0 && renderBracket('Winners Bracket', winners)}
      {losers.length > 0 && renderBracket('Losers Bracket', losers)}
      {finals.length > 0 && renderBracket('Grand Final', finals)}
    </div>
  );
};
