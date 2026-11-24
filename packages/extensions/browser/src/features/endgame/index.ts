import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'endgame-practice',
  name: 'Endgame Practice',
  pageTypes: ['endgame-practice'],
  anchor: FEATURE_ANCHORS['endgame-practice'],
  lichessPath: '/practice',
  label: 'Practice',
  strategy: 'button',
  extract: 'fen',
};
