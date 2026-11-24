// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../../settings/defaults';
import type { FeatureMapping, Settings } from '../../shared/types';
import {
  applyMapping,
  applyReplacements,
  clearReplacements,
  findAnchor,
} from './replacements';
import { FEATURE_ANCHORS } from './selectors';

const settings = (overrides: Partial<Settings> = {}): Settings => ({
  ...DEFAULT_SETTINGS,
  features: { ...DEFAULT_SETTINGS.features },
  ...overrides,
});

const puzzleMapping: FeatureMapping = {
  id: 'unlimited-puzzles',
  name: 'Unlimited Puzzles',
  pageTypes: ['puzzles'],
  anchor: FEATURE_ANCHORS['unlimited-puzzles'],
  lichessPath: '/training',
  label: 'Training',
  strategy: 'button',
  extract: 'none',
};

beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

describe('findAnchor', () => {
  it('finds an anchor by css selector', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    expect(findAnchor(FEATURE_ANCHORS['unlimited-puzzles'], document)).toBe(
      document.querySelector('a')
    );
  });

  it('falls back to text matching inside nav', () => {
    document.body.innerHTML = '<nav><a href="/x">Play Puzzles Daily</a></nav>';
    expect(
      findAnchor(FEATURE_ANCHORS['unlimited-puzzles'], document)
    ).not.toBeNull();
  });

  it('returns null when nothing matches', () => {
    document.body.innerHTML = '<nav><a href="/home">Home</a></nav>';
    expect(findAnchor(FEATURE_ANCHORS.insights, document)).toBeNull();
  });
});

describe('applyMapping', () => {
  it('injects a Lichess link for a button strategy', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    const result = applyMapping(document, puzzleMapping, settings());
    expect(result).not.toBeNull();
    const link = document.querySelector<HTMLAnchorElement>(
      'a.chess-unlocked-link'
    );
    expect(link?.href).toContain('lichess.org/training');
    expect(link?.target).toBe('_blank');
    expect(link?.textContent).toContain('Lichess Training');
  });

  it('does nothing when the feature is disabled', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    const s = settings();
    s.features['unlimited-puzzles'] = false;
    expect(applyMapping(document, puzzleMapping, s)).toBeNull();
    expect(document.querySelector('.chess-unlocked-link')).toBeNull();
  });

  it('does nothing when globally disabled', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    expect(
      applyMapping(document, puzzleMapping, settings({ enabled: false }))
    ).toBeNull();
  });

  it('prevents duplicate links', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    applyMapping(document, puzzleMapping, settings());
    expect(applyMapping(document, puzzleMapping, settings())).toBeNull();
    expect(document.querySelectorAll('.chess-unlocked-link')).toHaveLength(1);
  });

  it('intercepts navigation strategy clicks', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    const navMapping: FeatureMapping = {
      ...puzzleMapping,
      strategy: 'navigation',
    };
    applyMapping(document, navMapping, settings());
    const anchor = document.querySelector<HTMLElement>('a[href="/puzzles"]');
    expect(anchor?.hasAttribute('data-chess-unlocked-feature')).toBe(true);

    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    anchor?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('lichess.org/training'),
      '_blank',
      'noopener'
    );
    open.mockRestore();
  });

  it('enhancement strategy adds a link without marking the anchor', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    const enhMapping: FeatureMapping = {
      ...puzzleMapping,
      strategy: 'enhancement',
    };
    applyMapping(document, enhMapping, settings());
    const anchor = document.querySelector<HTMLElement>('a[href="/puzzles"]');
    expect(anchor?.hasAttribute('data-chess-unlocked-feature')).toBe(false);
    expect(document.querySelector('.chess-unlocked-link')).not.toBeNull();
  });

  it('respects openInNewTab=false', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    applyMapping(document, puzzleMapping, settings({ openInNewTab: false }));
    const link = document.querySelector<HTMLAnchorElement>(
      'a.chess-unlocked-link'
    );
    expect(link?.target).toBe('_self');
  });

  it('copies PGN and intercepts click for pgn-based features', async () => {
    const pgn =
      '[Event "Test Match"]\n[Site "Chess.com"]\n[Date "2024.01.01"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *';
    const script = document.createElement('script');
    script.type = 'application/json';
    script.textContent = pgn;
    document.body.appendChild(script);
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<nav><a href="/game/review/1">Review</a></nav>'
    );
    const reviewMapping: FeatureMapping = {
      id: 'game-review',
      name: 'Game Review',
      pageTypes: ['game-review'],
      anchor: FEATURE_ANCHORS['game-review'],
      lichessPath: '/analysis',
      label: 'Analysis',
      strategy: 'button',
      extract: 'pgn',
    };
    applyMapping(document, reviewMapping, settings());
    const link = document.querySelector<HTMLAnchorElement>(
      'a.chess-unlocked-link'
    );
    expect(link?.href).toContain('lichess.org/paste');

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link?.dispatchEvent(event);
    await Promise.resolve();
    expect(event.defaultPrevented).toBe(true);
    expect(writeText).toHaveBeenCalledWith(pgn);
    expect(open).toHaveBeenCalledWith('https://lichess.org/paste', '_blank');
    open.mockRestore();
  });
});

describe('applyReplacements / clearReplacements', () => {
  it('applies multiple mappings and clears them', () => {
    document.body.innerHTML =
      '<nav><a href="/puzzles">Puzzles</a><a href="/stats">Stats</a></nav>';
    const insightsMapping: FeatureMapping = {
      id: 'insights',
      name: 'Insights',
      pageTypes: ['stats'],
      anchor: FEATURE_ANCHORS.insights,
      lichessPath: '/insights',
      label: 'Insights',
      strategy: 'button',
      extract: 'none',
    };
    const applied = applyReplacements(
      document,
      [puzzleMapping, insightsMapping],
      settings()
    );
    expect(applied).toHaveLength(2);
    expect(document.querySelectorAll('.chess-unlocked-link')).toHaveLength(2);

    clearReplacements(document);
    expect(document.querySelectorAll('.chess-unlocked-link')).toHaveLength(0);
    expect(document.querySelector('[data-chess-unlocked-feature]')).toBeNull();
  });

  it('returns empty when disabled', () => {
    document.body.innerHTML = '<nav><a href="/puzzles">Puzzles</a></nav>';
    expect(
      applyReplacements(document, [puzzleMapping], settings({ enabled: false }))
    ).toHaveLength(0);
  });
});
