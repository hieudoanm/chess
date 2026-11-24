import { describe, expect, it } from 'vitest';
import { detectPageType } from './navigation';

const url = (path: string): string => `https://www.chess.com${path}`;

describe('detectPageType', () => {
  it('detects the home page', () => {
    expect(detectPageType(url('/'))).toBe('home');
  });

  it('detects puzzle pages before generic puzzles', () => {
    expect(detectPageType(url('/puzzles/rush'))).toBe('puzzle-rush');
    expect(detectPageType(url('/puzzles/battle'))).toBe('puzzle-battle');
    expect(detectPageType(url('/puzzles'))).toBe('puzzles');
    expect(detectPageType(url('/puzzles/daily'))).toBe('puzzles');
  });

  it('detects opening explorer and endgame pages', () => {
    expect(detectPageType(url('/openings'))).toBe('opening-explorer');
    expect(detectPageType(url('/endgame-trainer'))).toBe('endgame-practice');
  });

  it('detects review and analysis pages', () => {
    expect(detectPageType(url('/game/review/123456'))).toBe('game-review');
    expect(detectPageType(url('/analysis'))).toBe('game-review');
  });

  it('detects archive and live game pages', () => {
    expect(detectPageType(url('/games/archive'))).toBe('game-archive');
    expect(detectPageType(url('/play/online/12345'))).toBe('live-game');
    expect(detectPageType(url('/play/computer'))).toBe('live-game');
  });

  it('detects stats pages', () => {
    expect(detectPageType(url('/stats'))).toBe('stats');
  });

  it('returns other for unknown paths and invalid URLs', () => {
    expect(detectPageType(url('/members'))).toBe('other');
    expect(detectPageType('not a url')).toBe('other');
  });
});
