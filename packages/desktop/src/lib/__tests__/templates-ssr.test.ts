/** @jest-environment node */
import { getTemplates } from '@/lib/templates';

describe('templates (server)', () => {
  it('returns an empty list outside the browser', () => {
    expect(typeof window).toBe('undefined');
    expect(getTemplates()).toEqual([]);
  });
});
