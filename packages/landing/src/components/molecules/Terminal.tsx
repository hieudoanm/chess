import type { FC } from 'react';

interface TerminalProps {
  caption: string;
  lines: string[];
  className?: string;
}

const Terminal: FC<TerminalProps> = ({ caption, lines, className = '' }) => (
  <figure
    className={`border-base-300 bg-neutral text-neutral-content m-0 overflow-hidden rounded-2xl border shadow-xl ${className}`}>
    <figcaption className="border-base-300 text-base-content/50 border-b px-4 py-2.5 text-xs font-semibold tracking-wide uppercase">
      {caption}
    </figcaption>
    <pre className="m-0 overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre">
      {lines.map((line, i) =>
        line.startsWith('$ ') ? (
          <span key={i} className="block">
            <span className="text-accent">$</span> {line.slice(2)}
          </span>
        ) : (
          <span key={i} className="text-neutral-content/80 block">
            {line}
          </span>
        )
      )}
    </pre>
  </figure>
);

Terminal.displayName = 'Terminal';

export default Terminal;
