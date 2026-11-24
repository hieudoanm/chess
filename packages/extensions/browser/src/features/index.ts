import type { FeatureMapping, PageType } from '../shared/types';
import { mapping as unlimitedPuzzles } from './puzzles';
import { mapping as puzzleRush } from './puzzle-rush';
import { mapping as puzzleBattle } from './puzzle-battle';
import { mapping as openingExplorer } from './opening-explorer';
import { mapping as endgamePractice } from './endgame';
import { mapping as gameReview } from './game-review';
import { mapping as computerAnalysis } from './analysis';
import { mapping as insights } from './insights';

export const FEATURE_MAPPINGS: FeatureMapping[] = [
  unlimitedPuzzles,
  puzzleRush,
  puzzleBattle,
  openingExplorer,
  endgamePractice,
  gameReview,
  computerAnalysis,
  insights,
];

export const getMappingsForPage = (pageType: PageType): FeatureMapping[] =>
  FEATURE_MAPPINGS.filter((mapping) => mapping.pageTypes.includes(pageType));
