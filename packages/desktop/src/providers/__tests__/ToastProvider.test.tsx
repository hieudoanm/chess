import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider, useToast } from '@/providers/ToastProvider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('throws when used outside ToastProvider', () => {
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within ToastProvider'
    );
  });

  it('starts with no toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast with the default info type', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.addToast('hello');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('hello');
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('stores the requested type', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.addToast('oops', 'error');
    });
    expect(result.current.toasts[0].type).toBe('error');
  });

  it('removes a toast by id', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.addToast('one');
      result.current.addToast('two');
    });
    const id = result.current.toasts[0].id;
    act(() => {
      result.current.removeToast(id);
    });
    expect(result.current.toasts.map((t) => t.message)).toEqual(['two']);
  });

  it('auto-dismisses toasts after 3 seconds', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.addToast('transient');
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.toasts).toEqual([]);
  });
});
