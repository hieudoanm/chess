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
    <div className="mockup-code rounded-none">
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
  </figure>
);

Terminal.displayName = 'Terminal';

export default Terminal;
