import { RANKS } from '../../../constants';
import Square from '../../atoms/Square';

const Rank: React.FC = () => {
  return (
    <div className="w-12">
      {RANKS.map((rank: string, index: number) => {
        const textColor = index % 2 === 0 ? 'text-gray-600' : 'text-gray-400';
        return (
          <Square key={`rank-${rank}`}>
            <div className={`w-full h-full text-xs p-1 ${textColor}`}>
              {rank}
            </div>
          </Square>
        );
      })}
    </div>
  );
};

Rank.displayName = 'Rank';

export default Rank;
