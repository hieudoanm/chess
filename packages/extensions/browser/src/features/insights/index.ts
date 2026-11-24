import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'insights',
  name: 'Insights',
  pageTypes: ['stats'],
  anchor: FEATURE_ANCHORS.insights,
  lichessPath: '/insights',
  label: 'Insights',
  strategy: 'button',
  extract: 'none',
};
