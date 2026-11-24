import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'puzzle-rush',
  name: 'Puzzle Rush',
  pageTypes: ['puzzle-rush'],
  anchor: FEATURE_ANCHORS['puzzle-rush'],
  lichessPath: '/storm',
  label: 'Storm',
  strategy: 'button',
  extract: 'none',
};
