import type {
  BestOf,
  MatchScoringRule,
  Tiebreaker,
  TournamentFormat,
  TournamentTemplate,
} from '@/types';

const STORAGE_KEY = 'tourney-templates';

export interface TemplateDraft {
  name: string;
  description: string;
  format: TournamentFormat;
  maxParticipants: number;
  bestOf?: BestOf;
  scoringRule?: MatchScoringRule;
  thirdPlacePlayoff?: boolean;
  tiebreakers?: Tiebreaker[];
}

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getTemplates = (): TournamentTemplate[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTemplate = (template: TemplateDraft): TournamentTemplate => {
  const templates = getTemplates();
  const created: TournamentTemplate = {
    ...template,
    id: generateId(),
    createdAt: Date.now(),
  };
  const next = [created, ...templates];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return created;
};

export const deleteTemplate = (id: string): TournamentTemplate[] => {
  const next = getTemplates().filter((t) => t.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
