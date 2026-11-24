import type { LichessContext, LinkTarget } from '../../shared/types';
import {
  analysisUrl,
  endgameUrl,
  insightsUrl,
  openingUrl,
  pasteUrl,
  racerUrl,
  stormUrl,
  trainingUrl,
} from './urls';

export interface ImportPlan {
  url: string;
  pgn?: string;
}

const PATH_BUILDERS: Record<string, () => string> = {
  '/training': trainingUrl,
  '/storm': stormUrl,
  '/racer': racerUrl,
  '/opening': openingUrl,
  '/practice': endgameUrl,
  '/insights': insightsUrl,
  '/analysis': analysisUrl,
};

export const planGameImport = (context: LichessContext): ImportPlan => {
  if (context.fen) {
    return { url: analysisUrl(context.fen) };
  }
  if (context.pgn) {
    return { url: pasteUrl(), pgn: context.pgn };
  }
  return { url: analysisUrl() };
};

export const planFeatureUrl = (
  lichessPath: string,
  context: LichessContext,
  transferContext: boolean
): ImportPlan => {
  if (!transferContext) {
    return { url: PATH_BUILDERS[lichessPath]?.() ?? `${lichessPath}` };
  }
  if (lichessPath === '/analysis') {
    return planGameImport(context);
  }
  return { url: PATH_BUILDERS[lichessPath]?.() ?? lichessPath };
};

export const copyPgnToClipboard = async (pgn: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(pgn);
    return true;
  } catch {
    return false;
  }
};

export const openLichess = (
  url: string,
  target: LinkTarget,
  pgn?: string
): void => {
  if (pgn) {
    void copyPgnToClipboard(pgn);
  }
  window.open(url, target === 'new-tab' ? '_blank' : '_self');
};
