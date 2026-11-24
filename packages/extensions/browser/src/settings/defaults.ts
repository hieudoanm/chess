import type { FeatureId, Settings } from '../shared/types';

export const FEATURE_IDS: FeatureId[] = [
  'unlimited-puzzles',
  'puzzle-rush',
  'puzzle-battle',
  'opening-explorer',
  'endgame-practice',
  'game-review',
  'computer-analysis',
  'insights',
];

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  features: {
    'unlimited-puzzles': true,
    'puzzle-rush': true,
    'puzzle-battle': true,
    'opening-explorer': true,
    'endgame-practice': true,
    'game-review': true,
    'computer-analysis': true,
    insights: true,
  },
  strategy: 'button',
  openInNewTab: true,
  transferContext: true,
};
