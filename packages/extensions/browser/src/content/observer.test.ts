// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { startDomObserver, startSpaWatcher } from './observer';

describe('startDomObserver', () => {
  it('debounces childList mutations into a single callback', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const observer = startDomObserver(callback, 50);
    document.body.appendChild(document.createElement('div'));
    document.body.appendChild(document.createElement('div'));
    expect(callback).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);
    observer.disconnect();
    vi.useRealTimers();
  });
});

describe('startSpaWatcher', () => {
  it('fires when the URL changes', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const interval = startSpaWatcher(callback, 50);
    await vi.advanceTimersByTimeAsync(60);
    expect(callback).not.toHaveBeenCalled();
    window.history.pushState({}, '', '/puzzles');
    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);
    clearInterval(interval);
    vi.useRealTimers();
  });
});
