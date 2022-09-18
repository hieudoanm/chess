import { FILES, RANKS } from '../../../constants';
import Square, { Color } from '../../atoms/Square';

const Background: React.FC = () => {
  return (
    <div className="w-full grid grid-cols-8 border border-black">
      {FILES.map((file: string, fileIndex: number) => {
        return (
          <div key={`file-${file}`}>
            {RANKS.map((rank: string, rankIndex: number) => {
              const squareIndex: number = fileIndex + rankIndex;
              const color: Color =
                squareIndex % 2 === 0 ? Color.LIGHT : Color.DARK;
              return <Square key={`square-${file}${rank}`} color={color} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

Background.displayName = 'Background';

export default Background;
