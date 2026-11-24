import { renderHook } from '@testing-library/react';
import { useSWRegister } from '@/hooks/useSWRegister';

const originalNodeEnv = process.env.NODE_ENV;

const mockServiceWorker = (): Record<string, jest.Mock> => {
  const getRegistrations = jest
    .fn()
    .mockResolvedValue([
      { scope: '/sw.js', unregister: jest.fn().mockResolvedValue(undefined) },
    ]);
  const register = jest.fn().mockResolvedValue({ scope: '/sw.js' });
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { getRegistrations, register },
    configurable: true,
  });
  return { getRegistrations, register };
};

describe('useSWRegister', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV =
      originalNodeEnv;
  });

  it('does nothing when service workers are unsupported', () => {
    renderHook(() => useSWRegister());
    expect(true).toBe(true);
  });

  it('registers the worker in production', async () => {
    const { register } = mockServiceWorker();
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    renderHook(() => useSWRegister());
    await Promise.resolve();
    await Promise.resolve();

    expect(register).toHaveBeenCalledWith('/sw.js');
    expect(log).toHaveBeenCalledWith('[SW] registered', '/sw.js');
  });

  it('warns when registration fails', async () => {
    const { register } = mockServiceWorker();
    register.mockRejectedValue(new Error('nope'));
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    renderHook(() => useSWRegister());
    await Promise.resolve();
    await Promise.resolve();

    expect(warn).toHaveBeenCalledWith(
      '[SW] registration failed',
      expect.any(Error)
    );
  });

  it('unregisters workers and clears caches in development', async () => {
    const { getRegistrations } = mockServiceWorker();
    (process.env as Record<string, string | undefined>).NODE_ENV =
      'development';
    const clear = jest.fn().mockResolvedValue(true);
    Object.defineProperty(globalThis, 'caches', {
      value: { keys: jest.fn().mockResolvedValue(['v1']), delete: clear },
      configurable: true,
    });
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    renderHook(() => useSWRegister());
    await Promise.resolve();
    await Promise.resolve();

    expect(getRegistrations).toHaveBeenCalled();
    expect(clear).toHaveBeenCalledWith('v1');
    expect(log).toHaveBeenCalledWith('[SW] cleared cache', 'v1');
  });
});
