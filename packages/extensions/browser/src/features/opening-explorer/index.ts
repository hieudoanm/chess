import { FEATURE_ANCHORS } from '../../content/dom/selectors';
import type { FeatureMapping } from '../../shared/types';

export const mapping: FeatureMapping = {
  id: 'opening-explorer',
  name: 'Opening Explorer',
  pageTypes: ['opening-explorer'],
  anchor: FEATURE_ANCHORS['opening-explorer'],
  lichessPath: '/opening',
  label: 'Explorer',
  strategy: 'button',
  extract: 'fen',
};
