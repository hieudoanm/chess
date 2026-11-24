import type { FeatureId } from '../../shared/types';

/**
 * Chess.com-specific selectors.
 *
 * Chess.com is a React SPA with hashed class names that change often, so every
 * feature declares:
 *   1. `css` — stable-ish structural selectors (hrefs, roles, data attributes).
 *   2. `text` — a regex matched against link/button text as a fallback.
 * If both miss, the feature simply does not render (fail-safe, no errors).
 */

export const NAV_CONTAINER =
  'nav, [role="navigation"], header, [class*="navbar" i], [class*="menu" i]';

export const CANDIDATE_ELEMENTS =
  'a, button, [role="button"], [role="link"], [role="menuitem"]';

export const PREMIUM_BADGES =
  '[class*="premium" i], [class*="member-badge" i], [class*="gold" i]';

/** Chess.com board / position sources used for FEN extraction. */
export const FEN_CANDIDATES = [
  '[data-fen]',
  '[data-position]',
  'script[type="application/json"][data-chess-position]',
];

/** Chess.com embedded game data used for PGN extraction. */
export const PGN_CANDIDATES = [
  'script[type="application/ld+json"]',
  'script:not([src])',
  'textarea[readonly]',
];

export interface FeatureAnchor {
  css: string[];
  text?: RegExp;
}

export const FEATURE_ANCHORS: Record<FeatureId, FeatureAnchor> = {
  'unlimited-puzzles': {
    css: ['a[href*="/puzzles"]', 'a[href$="/puzzles"]'],
    text: /puzzles?/i,
  },
  'puzzle-rush': {
    css: ['a[href*="puzzle-rush"]'],
    text: /puzzle rush|rush/i,
  },
  'puzzle-battle': {
    css: ['a[href*="puzzle-battle"]'],
    text: /puzzle battle|battle/i,
  },
  'opening-explorer': {
    css: ['a[href*="/opening"]'],
    text: /opening/i,
  },
  'endgame-practice': {
    css: ['a[href*="endgame"]'],
    text: /endgame/i,
  },
  'game-review': {
    css: ['a[href*="/review"], a[href*="/analysis"]'],
    text: /game review|review|analysis/i,
  },
  'computer-analysis': {
    css: ['a[href*="/analysis"]'],
    text: /computer|engine analysis|analysis/i,
  },
  insights: {
    css: ['a[href*="/stats"], a[href*="/insights"]'],
    text: /insights|stats/i,
  },
};
