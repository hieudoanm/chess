import type { FC } from 'react';

interface Standing {
  participantId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

interface StandingsTableProps {
  standings: Standing[];
  getParticipantName: (id: string) => string;
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

export const StandingsTable: FC<StandingsTableProps> = ({
  standings,
  getParticipantName,
}) => (
  <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-2xl border">
    <table>
      <thead>
        <tr>
          <th className="w-16 text-center">#</th>
          <th>Participant</th>
          <th className="w-12 text-center">P</th>
          <th className="w-12 text-center">W</th>
          <th className="w-12 text-center">D</th>
          <th className="w-12 text-center">L</th>
          <th className="w-16 text-center">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s) => (
          <tr key={s.participantId} className={positionColor(s.position)}>
            <td className="text-center">{positionIcon(s.position)}</td>
            <td className="font-medium">
              {getParticipantName(s.participantId)}
            </td>
            <td className="text-center font-mono text-sm">{s.played}</td>
            <td className="text-center font-mono text-sm">{s.won}</td>
            <td className="text-center font-mono text-sm">{s.drawn}</td>
            <td className="text-center font-mono text-sm">{s.lost}</td>
            <td className="text-center font-mono text-sm font-bold">
              {s.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
