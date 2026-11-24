// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyPgnToClipboard, openLichess } from './importer';

describe('copyPgnToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when clipboard write succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    expect(await copyPgnToClipboard('1. e4 *')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('1. e4 *');
  });

  it('returns false when clipboard is unavailable', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    expect(await copyPgnToClipboard('1. e4 *')).toBe(false);
  });
});

describe('openLichess', () => {
  it('opens the URL in a new tab and copies the PGN', () => {
    const open = vi.fn();
    vi.stubGlobal('window', { ...window, open });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    openLichess('https://lichess.org/paste', 'new-tab', '1. e4 *');
    expect(open).toHaveBeenCalledWith('https://lichess.org/paste', '_blank');
    expect(writeText).toHaveBeenCalledWith('1. e4 *');
  });
});
