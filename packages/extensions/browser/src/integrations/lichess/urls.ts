import { LICHHESS_BASE } from '../../shared/constants';

export const trainingUrl = (): string => `${LICHHESS_BASE}/training`;
export const stormUrl = (): string => `${LICHHESS_BASE}/storm`;
export const racerUrl = (): string => `${LICHHESS_BASE}/racer`;
export const openingUrl = (): string => `${LICHHESS_BASE}/opening`;
export const endgameUrl = (): string => `${LICHHESS_BASE}/practice`;
export const insightsUrl = (): string => `${LICHHESS_BASE}/insights`;
export const pasteUrl = (): string => `${LICHHESS_BASE}/paste`;
export const analysisBaseUrl = (): string => `${LICHHESS_BASE}/analysis`;

export const fenToPath = (fen: string): string =>
  encodeURIComponent(fen.trim()).replace(/%20/g, '_').replace(/%2F/g, '/');

export const analysisUrl = (fen?: string): string =>
  fen ? `${analysisBaseUrl()}/${fenToPath(fen)}` : analysisBaseUrl();
