import type { FC } from 'react';
import { useData } from '@/providers/DataProvider';
import { calculateStandings } from '@/lib/standings';

interface StandingsViewProps {
  standings: ReturnType<typeof calculateStandings>;
  participants: ReturnType<typeof useData>['participants'];
}

const positionIcon = (pos: number): string => {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return `#${pos}`;
};

const positionColor = (pos: number): string => {
  if (pos === 1) return 'bg-yellow-500/10 border-yellow-500/30';
  if (pos === 2) return 'bg-gray-400/10 border-gray-400/30';
  if (pos === 3) return 'bg-orange-500/10 border-orange-500/30';
  return '';
};

export const StandingsView: FC<StandingsViewProps> = ({
  standings,
  participants,
}) => {
  const getName = (id: string) =>
    participants.find((p) => p.id === id)?.name ?? 'Unknown';

  return (
    <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-2xl border">
      <table>
        <thead>
          <tr>
            <th className="text-center">#</th>
            <th>Participant</th>
            <th className="text-center">P</th>
            <th className="text-center">W</th>
            <th className="text-center">D</th>
            <th className="text-center">L</th>
            <th className="text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.participantId} className={positionColor(s.position)}>
              <td className="text-center">{positionIcon(s.position)}</td>
              <td className="font-medium">{getName(s.participantId)}</td>
              <td className="text-center font-mono">{s.played}</td>
              <td className="text-center font-mono">{s.won}</td>
              <td className="text-center font-mono">{s.drawn}</td>
              <td className="text-center font-mono">{s.lost}</td>
              <td className="text-center font-mono font-bold">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
