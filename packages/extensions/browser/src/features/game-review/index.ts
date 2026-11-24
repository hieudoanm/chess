import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'game-review',
  name: 'Game Review',
  pageTypes: ['game-review', 'game-archive', 'live-game'],
  anchor: FEATURE_ANCHORS['game-review'],
  lichessPath: '/analysis',
  label: 'Analysis',
  strategy: 'button',
  extract: 'pgn',
};
