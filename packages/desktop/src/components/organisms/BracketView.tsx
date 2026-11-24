import { useMemo } from 'react';
import { type Match, type TournamentFormat } from '@/types';
import { MatchCard } from './MatchCard';

interface BracketViewProps {
  matches: Match[];
  format: TournamentFormat;
  onMatchClick?: (matchId: string) => void;
}

const ELIMINATION_FORMATS: TournamentFormat[] = [
  'single-elimination',
  'double-elimination',
];

export const BracketView = ({
  matches,
  format,
  onMatchClick,
}: BracketViewProps) => {
  const grouped = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const match of matches) {
      const round = match.round ?? 0;
      if (!map.has(round)) map.set(round, []);
      map.get(round)!.push(match);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [matches]);

  if (ELIMINATION_FORMATS.includes(format)) {
    return <EliminationBracket grouped={grouped} onMatchClick={onMatchClick} />;
  }

  if (format === 'group-stage') {
    const groupMatches = matches.filter((m) => !m.bracket);
    const knockoutMatches = matches.filter((m) => m.bracket);
    const groupGrouped = groupByRound(groupMatches);
    const knockoutGrouped = groupByRound(knockoutMatches);

    return (
      <div className="space-y-8">
        <section>
          <h3 className="mb-4 text-lg font-semibold">Group Phase</h3>
          <ListBracket grouped={groupGrouped} />
        </section>
        <section>
          <h3 className="mb-4 text-lg font-semibold">Knockout Bracket</h3>
          <EliminationBracket
            grouped={knockoutGrouped}
            onMatchClick={onMatchClick}
          />
        </section>
      </div>
    );
  }

  return <ListBracket grouped={grouped} />;
};

const EliminationBracket = ({
  grouped,
  onMatchClick,
}: {
  grouped: [number, Match[]][];
  onMatchClick?: (matchId: string) => void;
}) => (
  <div className="flex gap-6 overflow-x-auto pb-4">
    {grouped.map(([round, roundMatches]) => (
      <div key={round} className="flex min-w-[260px] flex-col gap-4">
        <h4 className="text-base-content/60 text-center text-sm font-medium">
          Round {round}
        </h4>
        <div className="flex flex-col gap-4">
          {roundMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={onMatchClick ? () => onMatchClick(match.id) : undefined}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ListBracket = ({ grouped }: { grouped: [number, Match[]][] }) => (
  <div className="space-y-6">
    {grouped.map(([round, roundMatches]) => (
      <div key={round}>
        <h4 className="text-base-content/60 mb-2 text-sm font-medium">
          Round {round}
        </h4>
        <div className="space-y-2">
          {roundMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const groupByRound = (matches: Match[]): [number, Match[]][] => {
  const map = new Map<number, Match[]>();
  for (const match of matches) {
    const round = match.round ?? 0;
    if (!map.has(round)) map.set(round, []);
    map.get(round)!.push(match);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a - b);
};
