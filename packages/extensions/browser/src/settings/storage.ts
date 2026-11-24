import { SETTINGS_STORAGE_KEY } from '../shared/constants';
import type { FeatureId, Settings } from '../shared/types';
import { DEFAULT_SETTINGS, FEATURE_IDS } from './defaults';

export interface KeyValueStorage {
  get(keys: string[], callback: (items: Record<string, unknown>) => void): void;
  set(items: Record<string, unknown>, callback?: () => void): void;
  remove(keys: string[], callback?: () => void): void;
}

const defaultArea = (): KeyValueStorage =>
  chrome.storage.sync as unknown as KeyValueStorage;

const isFeatureId = (value: string): value is FeatureId =>
  (FEATURE_IDS as string[]).includes(value);

export const mergeWithDefaults = (raw: unknown): Settings => {
  const base: Settings = {
    ...DEFAULT_SETTINGS,
    features: { ...DEFAULT_SETTINGS.features },
  };
  if (typeof raw !== 'object' || raw === null) return base;
  const partial = raw as Partial<Settings>;
  if (typeof partial.enabled === 'boolean') base.enabled = partial.enabled;
  if (partial.strategy === 'button' || partial.strategy === 'navigation') {
    base.strategy = partial.strategy;
  }
  if (typeof partial.openInNewTab === 'boolean') {
    base.openInNewTab = partial.openInNewTab;
  }
  if (typeof partial.transferContext === 'boolean') {
    base.transferContext = partial.transferContext;
  }
  if (typeof partial.features === 'object' && partial.features !== null) {
    for (const [key, value] of Object.entries(partial.features)) {
      if (isFeatureId(key) && typeof value === 'boolean') {
        base.features[key] = value;
      }
    }
  }
  return base;
};

export const loadSettings = (
  area: KeyValueStorage = defaultArea()
): Promise<Settings> =>
  new Promise((resolve) => {
    area.get([SETTINGS_STORAGE_KEY], (items) => {
      resolve(mergeWithDefaults(items[SETTINGS_STORAGE_KEY]));
    });
  });

export const saveSettings = (
  settings: Settings,
  area: KeyValueStorage = defaultArea()
): Promise<void> =>
  new Promise((resolve, reject) => {
    area.set({ [SETTINGS_STORAGE_KEY]: settings }, () => {
      const error =
        typeof chrome !== 'undefined' ? chrome.runtime?.lastError : null;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });

export const resetSettings = (
  area: KeyValueStorage = defaultArea()
): Promise<void> =>
  new Promise((resolve) => {
    area.remove([SETTINGS_STORAGE_KEY], () => resolve());
  });
