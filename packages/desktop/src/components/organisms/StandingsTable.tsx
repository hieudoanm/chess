import { useMemo } from 'react';
import { type Standing, type Participant } from '@/types';

interface StandingsTableProps {
  standings: Standing[];
  participants: Participant[];
}

const MEDAL_CLASSES = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

export const StandingsTable = ({
  standings,
  participants,
}: StandingsTableProps) => {
  const lookup = useMemo(() => {
    const map = new Map<string, Participant>();
    for (const p of participants) map.set(p.id, p);
    return map;
  }, [participants]);

  return (
    <div className="overflow-x-auto">
      <table className="table-zebra table w-full">
        <thead>
          <tr>
            <th className="w-12">#</th>
            <th>Team</th>
            <th className="text-center">P</th>
            <th className="text-center">W</th>
            <th className="text-center">D</th>
            <th className="text-center">L</th>
            <th className="text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const participant = lookup.get(s.participantId);
            const medalClass = i < 3 ? MEDAL_CLASSES[i] : undefined;

            return (
              <tr key={s.participantId} className={medalClass}>
                <td className="font-medium">{i + 1}</td>
                <td className="font-medium">
                  {participant?.name ?? 'Unknown'}
                </td>
                <td className="text-center">{s.played}</td>
                <td className="text-center">{s.won}</td>
                <td className="text-center">{s.drawn}</td>
                <td className="text-center">{s.lost}</td>
                <td className="text-center font-bold">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
