import { describe, expect, it } from 'vitest';
import { FEATURE_IDS } from '../settings/defaults';
import type { FeatureId } from '../shared/types';
import { FEATURE_MAPPINGS, getMappingsForPage } from './index';

describe('feature registry', () => {
  it('has one mapping per feature id', () => {
    const ids = FEATURE_MAPPINGS.map((m) => m.id).sort();
    expect(ids).toEqual([...FEATURE_IDS].sort());
  });

  it('every mapping declares a non-empty anchor', () => {
    for (const mapping of FEATURE_MAPPINGS) {
      expect(mapping.anchor.css.length).toBeGreaterThan(0);
      expect(mapping.lichessPath).toMatch(/^\//);
    }
  });

  it('filters mappings by page type', () => {
    const puzzleMappings = getMappingsForPage('puzzles');
    expect(puzzleMappings.map((m) => m.id)).toEqual(['unlimited-puzzles']);
    expect(getMappingsForPage('puzzle-rush').map((m) => m.id)).toEqual([
      'puzzle-rush',
    ]);
    expect(getMappingsForPage('other')).toHaveLength(0);
  });

  it('game-review mapping covers review, archive and live pages', () => {
    const ids = getMappingsForPage('game-archive').map(
      (m) => m.id as FeatureId
    );
    expect(ids).toContain('game-review');
  });
});
