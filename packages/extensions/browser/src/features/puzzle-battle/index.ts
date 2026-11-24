import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'puzzle-battle',
  name: 'Puzzle Battle',
  pageTypes: ['puzzle-battle'],
  anchor: FEATURE_ANCHORS['puzzle-battle'],
  lichessPath: '/racer',
  label: 'Racer',
  strategy: 'button',
  extract: 'none',
};
