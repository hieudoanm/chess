import { describe, expect, it, vi } from 'vitest';
import { checkLichessStatus } from './api';

describe('checkLichessStatus', () => {
  it('returns ok on a valid status response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ uptime: 12345 }),
      })
    );
    const status = await checkLichessStatus();
    expect(status.ok).toBe(true);
    expect(status.message).toBe('Online');
    vi.unstubAllGlobals();
  });

  it('returns not ok on HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 })
    );
    const status = await checkLichessStatus();
    expect(status.ok).toBe(false);
    expect(status.message).toBe('HTTP 503');
    vi.unstubAllGlobals();
  });

  it('returns not ok when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    const status = await checkLichessStatus();
    expect(status.ok).toBe(false);
    expect(status.message).toBe('Unreachable');
    vi.unstubAllGlobals();
  });
});
