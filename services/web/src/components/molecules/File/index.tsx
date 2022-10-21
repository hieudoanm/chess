import React from 'react';
import { FILES } from '../../../constants';
import Square from '../../atoms/Square';

const File: React.FC = () => {
  return (
    <div className="grid grid-cols-8">
      {FILES.map((file: string, index: number) => {
        const textColor = index % 2 === 0 ? 'text-gray-400' : 'text-gray-600';
        return (
          <div key={`file-${file}`} className="w-12">
            <Square>
              <div
                className={`w-full h-full text-xs p-1 flex items-end justify-end ${textColor}`}
              >
                {file}
              </div>
            </Square>
          </div>
        );
      })}
    </div>
  );
};

File.displayName = 'File';

export default File;
