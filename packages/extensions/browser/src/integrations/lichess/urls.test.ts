import { describe, expect, it } from 'vitest';
import { analysisBaseUrl, analysisUrl, fenToPath } from './urls';

const FEN = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';

describe('fenToPath', () => {
  it('encodes spaces as underscores and keeps slashes', () => {
    expect(fenToPath(FEN)).toBe(
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR_w_KQkq_-_0_2'
    );
  });

  it('trims surrounding whitespace', () => {
    expect(fenToPath(`  ${FEN}  `)).toBe(fenToPath(FEN));
  });
});

describe('analysisUrl', () => {
  it('returns the base analysis URL without a fen', () => {
    expect(analysisUrl()).toBe(`${analysisBaseUrl()}`);
    expect(analysisUrl(undefined)).toBe('https://lichess.org/analysis');
  });

  it('builds a position URL with a fen', () => {
    expect(analysisUrl(FEN)).toBe(
      `https://lichess.org/analysis/${fenToPath(FEN)}`
    );
  });
});
