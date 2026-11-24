import { generateId, delay, formatDate, formatFileSize } from '@/lib/utils';

describe('generateId', () => {
  it('returns a timestamp-prefixed id', () => {
    expect(generateId()).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('returns distinct ids', () => {
    expect(generateId()).not.toBe(generateId());
  });
});

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.NEXT_PUBLIC_MOCK_DELAY;
  });

  it('resolves after the given milliseconds', async () => {
    const promise = delay(120);
    const callback = jest.fn();
    promise.then(callback);

    jest.advanceTimersByTime(119);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await promise;
    expect(callback).toHaveBeenCalled();
  });

  it('uses NEXT_PUBLIC_MOCK_DELAY when ms is omitted', async () => {
    process.env.NEXT_PUBLIC_MOCK_DELAY = '250';
    const promise = delay();
    jest.advanceTimersByTime(250);
    await promise;
  });

  it('falls back to 800 when env value is falsy', async () => {
    process.env.NEXT_PUBLIC_MOCK_DELAY = '0';
    const promise = delay();
    jest.advanceTimersByTime(799);
    jest.advanceTimersByTime(1);
    await promise;
  });
});

describe('formatDate', () => {
  it('formats a timestamp', () => {
    const timestamp = new Date('2024-03-15T12:00:00Z').getTime();
    const formatted = formatDate(timestamp);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('Mar');
  });
});

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1.0 KB'],
    [1536, '1.5 KB'],
    [1048576, '1.0 MB'],
    [1073741824, '1.0 GB'],
    [1099511627776, '1.0 TB'],
  ])('formats %d bytes', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
