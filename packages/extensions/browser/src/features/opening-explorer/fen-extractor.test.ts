// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { extractFen, isFen, normalizeFen } from './fen-extractor';

const FEN = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';

describe('isFen', () => {
  it('accepts full and partial FENs', () => {
    expect(isFen(FEN)).toBe(true);
    expect(isFen('8/8/8/8/8/8/8/K6k w - - 0 1')).toBe(true);
    expect(isFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w')).toBe(true);
  });

  it('rejects non-FEN text', () => {
    expect(isFen('hello world')).toBe(false);
    expect(isFen('')).toBe(false);
    expect(isFen('1. e4 e5')).toBe(false);
  });
});

describe('normalizeFen', () => {
  it('collapses whitespace and pads missing fields', () => {
    expect(normalizeFen('8/8/8/8/8/8/8/K6k   w   - - 0 1')).toBe(
      '8/8/8/8/8/8/8/K6k w - - 0 1'
    );
    expect(normalizeFen('8/8/8/8/8/8/8/K6k w - -')).toBe(
      '8/8/8/8/8/8/8/K6k w - -'
    );
  });
});

describe('extractFen', () => {
  it('reads a data-fen attribute', () => {
    document.body.innerHTML = `<div data-fen="${FEN}"></div>`;
    expect(extractFen(document)).toBe(FEN);
  });

  it('reads a data-position attribute', () => {
    document.body.innerHTML = `<div data-position="${FEN}"></div>`;
    expect(extractFen(document)).toBe(FEN);
  });

  it('returns undefined when nothing matches', () => {
    document.body.innerHTML = '<div>nothing</div>';
    expect(extractFen(document)).toBeUndefined();
  });

  it('ignores attributes that are not FENs and reads text content', () => {
    document.body.innerHTML = `<div data-fen="">${FEN}</div>`;
    expect(extractFen(document)).toBe(FEN);
  });

  it('handles semicolon-separated attribute values', () => {
    document.body.innerHTML = `<div data-position="${FEN};extra"></div>`;
    expect(extractFen(document)).toBe(FEN);
  });
});
