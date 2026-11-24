// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { extractGameMetadata, extractPgn } from './pgn-extractor';

const PGN = `[Event "Test Match"]
[Site "Chess.com"]
[Date "2024.01.15"]
[Result "1-0"]
[White "Alice"]
[Black "Bob"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *`;

const withPgnScript = (pgn: string): void => {
  const script = document.createElement('script');
  script.type = 'application/json';
  script.textContent = pgn;
  document.body.appendChild(script);
};

describe('extractPgn', () => {
  it('finds a PGN embedded in a script tag', () => {
    withPgnScript(PGN);
    expect(extractPgn(document)).toBe(PGN);
    document.body.innerHTML = '';
  });

  it('finds a PGN inside JSON-LD game data', () => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@type': 'Game',
      pgn: PGN,
    });
    document.body.appendChild(script);
    expect(extractPgn(document)).toBe(PGN);
    document.body.innerHTML = '';
  });

  it('finds PGN nested under a game object in JSON-LD', () => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ game: { pgn: PGN } });
    document.body.appendChild(script);
    expect(extractPgn(document)).toBe(PGN);
    document.body.innerHTML = '';
  });

  it('skips invalid JSON-LD and non-PGN values', () => {
    const bad = document.createElement('script');
    bad.type = 'application/ld+json';
    bad.textContent = '{not json';
    document.body.appendChild(bad);
    const nonPgn = document.createElement('script');
    nonPgn.type = 'application/ld+json';
    nonPgn.textContent = JSON.stringify({ pgn: 'not a pgn' });
    document.body.appendChild(nonPgn);
    expect(extractPgn(document)).toBeUndefined();
    document.body.innerHTML = '';
  });

  it('returns undefined when no PGN is present', () => {
    document.body.innerHTML = '<div>no game here</div>';
    expect(extractPgn(document)).toBeUndefined();
  });
});

describe('extractGameMetadata', () => {
  it('parses event, date, result and fen headers', () => {
    const pgn = `[Event "T"]\n[Date "2024.02.01"]\n[Result "0-1"]\n[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"]\n\n1. *`;
    expect(extractGameMetadata(pgn)).toEqual({
      event: 'T',
      date: '2024.02.01',
      result: '0-1',
      fen: '8/8/8/8/8/8/8/K6k w - - 0 1',
    });
  });

  it('returns undefined fields for missing headers', () => {
    expect(extractGameMetadata('1. e4 *')).toEqual({
      fen: undefined,
      event: undefined,
      date: undefined,
      result: undefined,
    });
  });
});
