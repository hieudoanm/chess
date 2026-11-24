import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'unlimited-puzzles',
  name: 'Unlimited Puzzles',
  pageTypes: ['puzzles'],
  anchor: FEATURE_ANCHORS['unlimited-puzzles'],
  lichessPath: '/training',
  label: 'Training',
  strategy: 'button',
  extract: 'none',
};
