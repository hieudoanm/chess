import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'computer-analysis',
  name: 'Computer Analysis',
  pageTypes: ['live-game', 'game-review'],
  anchor: FEATURE_ANCHORS['computer-analysis'],
  lichessPath: '/analysis',
  label: 'Engine',
  strategy: 'enhancement',
  extract: 'pgn',
};
