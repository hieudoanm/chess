export type PageType =
  | 'game-review'
  | 'live-game'
  | 'game-archive'
  | 'opening-explorer'
  | 'puzzles'
  | 'puzzle-rush'
  | 'puzzle-battle'
  | 'endgame-practice'
  | 'stats'
  | 'home'
  | 'other';

export type FeatureId =
  | 'unlimited-puzzles'
  | 'puzzle-rush'
  | 'puzzle-battle'
  | 'opening-explorer'
  | 'endgame-practice'
  | 'game-review'
  | 'computer-analysis'
  | 'insights';

export type ReplacementStrategy = 'button' | 'navigation' | 'enhancement';
export type LinkTarget = 'current' | 'new-tab';

export interface AnchorSpec {
  css: string[];
  text?: RegExp;
}

export interface FeatureMapping {
  id: FeatureId;
  name: string;
  pageTypes: PageType[];
  anchor: AnchorSpec;
  lichessPath: string;
  label: string;
  strategy: ReplacementStrategy;
  extract?: 'fen' | 'pgn' | 'none';
}

export interface LichessContext {
  fen?: string;
  pgn?: string;
  url?: string;
  title?: string;
}

export interface Settings {
  enabled: boolean;
  features: Record<FeatureId, boolean>;
  strategy: 'button' | 'navigation';
  openInNewTab: boolean;
  transferContext: boolean;
}
