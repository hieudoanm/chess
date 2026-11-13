import type { FC } from 'react';

type TokKind = 'cmd' | 'flag' | 'str' | 'key' | 'url' | 'dim' | 'ok' | 'err';

interface Tok {
  t: string;
  c: TokKind;
}

const TK: Record<TokKind, string> = {
  cmd: 'font-semibold text-sky-300',
  flag: 'text-amber-400',
  str: 'text-green-300',
  key: 'text-violet-300',
  url: 'text-cyan-300',
  dim: 'text-slate-400',
  ok: 'text-gray-200',
  err: 'text-red-400',
};

const PROMPT = /^([$#>❯➜])\s+/;
const CMD_WORD = /^[A-Za-z][\w.-]*$|^[./][\w./-]*$/;

const RE =
  /(https?:\/\/[^\s"'`<>]+|(?:(?:\d{1,3}\.){3}\d{1,3}|localhost|[a-zA-Z][\w-]*(?:\.[\w-]+)+):\d{2,5}(?:\/[^\s"'`<>]*)?)|("[\w .-]+"\s*:|'[\w .-]+'\s*:)|("[^"\n]*"|'[^'\n]*')|((?<=^|\s)-{1,2}[\w-]+)|([A-Z_][A-Z0-9_]{2,}=)|([{}()\[\],;|\\])|\b([Ee]rror|ERROR|FAILED|failed|fatal|panic|PANIC|denied|refused)\b/g;

const tokenize = (line: string, isPrompt: boolean): Tok[] => {
  const toks: Tok[] = [];
  let rest = line;
  if (isPrompt) {
    const word = rest.match(/^\S+/)?.[0];
    if (word && CMD_WORD.test(word)) {
      toks.push({ t: word, c: 'cmd' });
      rest = rest.slice(word.length);
    }
  }
  let last = 0;
  RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(rest))) {
    if (m.index > last) toks.push({ t: rest.slice(last, m.index), c: 'ok' });
    const c: TokKind = m[1]
      ? 'url'
      : m[2]
        ? 'key'
        : m[3]
          ? 'str'
          : m[4]
            ? 'flag'
            : m[5]
              ? 'key'
              : m[6]
                ? 'dim'
                : 'err';
    toks.push({ t: m[0], c });
    last = m.index + m[0].length;
  }
  if (last < rest.length) toks.push({ t: rest.slice(last), c: 'ok' });
  return toks;
};

interface TerminalProps {
  lines: string[];
  className?: string;
}

const Terminal: FC<TerminalProps> = ({ lines, className = '' }) => (
  <div className={`mockup-code ${className}`}>
    {lines.map((line, i) => {
      const prompt = line.match(PROMPT);
      const body = prompt ? line.slice(prompt[0].length) : line;
      const toks = tokenize(body, prompt !== null);
      return (
        <pre key={i} {...(prompt ? { 'data-prefix': prompt[1] } : {})}>
          <code>
            {toks.map((tok, j) => (
              <span key={j} className={TK[tok.c]}>
                {tok.t}
              </span>
            ))}
          </code>
        </pre>
      );
    })}
  </div>
);

Terminal.displayName = 'Terminal';

export default Terminal;
