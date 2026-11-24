import type { PageType } from '../shared/types';

const matches = (pathname: string, ...parts: string[]): boolean =>
  parts.some((part) => pathname.includes(part));

export const detectPageType = (url: string): PageType => {
  let pathname: string;
  try {
    pathname = new URL(url).pathname.toLowerCase();
  } catch {
    return 'other';
  }
  if (matches(pathname, '/puzzle-rush', '/puzzles/rush')) return 'puzzle-rush';
  if (matches(pathname, '/puzzle-battle', '/puzzles/battle')) {
    return 'puzzle-battle';
  }
  if (matches(pathname, '/puzzles')) return 'puzzles';
  if (matches(pathname, '/opening')) return 'opening-explorer';
  if (matches(pathname, '/endgame')) return 'endgame-practice';
  if (matches(pathname, '/analysis') || matches(pathname, '/review')) {
    return 'game-review';
  }
  if (matches(pathname, '/games/archive') || matches(pathname, '/game/')) {
    return 'game-archive';
  }
  if (
    matches(pathname, '/play/computer') ||
    matches(pathname, '/play/online')
  ) {
    return 'live-game';
  }
  if (matches(pathname, '/stats')) return 'stats';
  if (pathname === '/') return 'home';
  return 'other';
};
