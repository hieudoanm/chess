import type { FC } from 'react';

interface TerminalProps {
  lines: string[];
  className?: string;
}

const Terminal: FC<TerminalProps> = ({ lines, className = '' }) => (
  <div className={`mockup-code ${className}`}>
    {lines.map((line, i) =>
      line.startsWith('$ ') ? (
        <pre key={i} data-prefix="$">
          <code>{line.slice(2)}</code>
        </pre>
      ) : (
        <pre key={i}>
          <code>{line}</code>
        </pre>
      )
    )}
  </div>
);

Terminal.displayName = 'Terminal';

export default Terminal;
