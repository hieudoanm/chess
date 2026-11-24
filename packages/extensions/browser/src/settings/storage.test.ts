import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, FEATURE_IDS } from './defaults';
import {
  loadSettings,
  mergeWithDefaults,
  resetSettings,
  saveSettings,
  type KeyValueStorage,
} from './storage';

const fakeStorage = (
  initial: Record<string, unknown> = {}
): KeyValueStorage & { data: Record<string, unknown> } => {
  const data: Record<string, unknown> = { ...initial };
  return {
    data,
    get: (_keys, cb) =>
      cb({ 'chessUnlocked.settings': data['chessUnlocked.settings'] }),
    set: (items, cb) => {
      Object.assign(data, items);
      cb?.();
    },
    remove: (keys, cb) => {
      for (const key of keys) delete data[key];
      cb?.();
    },
  };
};

describe('mergeWithDefaults', () => {
  it('returns defaults for non-object input', () => {
    expect(mergeWithDefaults(null)).toEqual(DEFAULT_SETTINGS);
    expect(mergeWithDefaults('x')).toEqual(DEFAULT_SETTINGS);
    expect(mergeWithDefaults(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it('merges partial settings and ignores invalid values', () => {
    const merged = mergeWithDefaults({
      enabled: false,
      strategy: 'navigation',
      openInNewTab: false,
      transferContext: false,
      features: { insights: false, bogus: true },
    });
    expect(merged.enabled).toBe(false);
    expect(merged.strategy).toBe('navigation');
    expect(merged.openInNewTab).toBe(false);
    expect(merged.transferContext).toBe(false);
    expect(merged.features.insights).toBe(false);
    expect(merged.features['unlimited-puzzles']).toBe(true);
    expect('bogus' in merged.features).toBe(false);
  });

  it('keeps defaults for invalid strategy', () => {
    expect(mergeWithDefaults({ strategy: 'weird' }).strategy).toBe('button');
  });
});

describe('storage', () => {
  it('loads defaults when storage is empty', async () => {
    const area = fakeStorage();
    expect(await loadSettings(area)).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and reloads settings', async () => {
    const area = fakeStorage();
    const settings = {
      ...DEFAULT_SETTINGS,
      features: { ...DEFAULT_SETTINGS.features, insights: false },
    };
    await saveSettings(settings, area);
    const loaded = await loadSettings(area);
    expect(loaded.features.insights).toBe(false);
    expect(loaded.enabled).toBe(true);
  });

  it('resets to defaults', async () => {
    const area = fakeStorage({
      'chessUnlocked.settings': { enabled: false },
    });
    await resetSettings(area);
    expect(await loadSettings(area)).toEqual(DEFAULT_SETTINGS);
  });

  it('covers all feature ids in defaults', () => {
    expect(Object.keys(DEFAULT_SETTINGS.features).sort()).toEqual(
      [...FEATURE_IDS].sort()
    );
  });
});
