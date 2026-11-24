// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { log, warn } from './logger';

describe('logger', () => {
  it('prefixes log and warn output', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    log('hello');
    warn('careful');
    expect(logSpy).toHaveBeenCalledWith('[Chess Unlocked]', 'hello');
    expect(warnSpy).toHaveBeenCalledWith('[Chess Unlocked]', 'careful');
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
