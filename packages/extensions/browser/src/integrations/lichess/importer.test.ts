import { describe, expect, it } from 'vitest';
import { planFeatureUrl, planGameImport } from './importer';

const FEN = '8/8/8/8/8/8/4k3/4K3 w - - 0 1';
const PGN = '[Event "Test"]\n\n1. e4 e5 2. Nf3 *';

describe('planGameImport', () => {
  it('prefers the FEN analysis URL', () => {
    const plan = planGameImport({ fen: FEN, pgn: PGN });
    expect(plan.url).toContain('/analysis/8/8/8');
    expect(plan.pgn).toBeUndefined();
  });

  it('falls back to paste URL with PGN when no FEN', () => {
    const plan = planGameImport({ pgn: PGN });
    expect(plan.url).toBe('https://lichess.org/paste');
    expect(plan.pgn).toBe(PGN);
  });

  it('returns the base analysis URL when no context', () => {
    expect(planGameImport({}).url).toBe('https://lichess.org/analysis');
  });
});

describe('planFeatureUrl', () => {
  it('uses the hub URL when transferContext is off', () => {
    const plan = planFeatureUrl('/analysis', { fen: FEN }, false);
    expect(plan.url).toBe('https://lichess.org/analysis');
  });

  it('uses the hub URL for non-analysis paths even with context', () => {
    const plan = planFeatureUrl('/training', { fen: FEN }, true);
    expect(plan.url).toBe('https://lichess.org/training');
  });

  it('delegates /analysis to planGameImport when transferContext is on', () => {
    const plan = planFeatureUrl('/analysis', { fen: FEN }, true);
    expect(plan.url).toContain('/analysis/8/8/8');
  });

  it('returns the path itself for unknown paths', () => {
    expect(planFeatureUrl('/unknown', {}, true).url).toBe('/unknown');
  });
});
