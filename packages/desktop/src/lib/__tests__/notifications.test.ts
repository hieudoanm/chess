import {
  requestNotificationPermission,
  sendNotification,
  scheduleReminder,
  cancelReminder,
  getNotificationStatus,
} from '@/lib/notifications';

const setNotificationPermission = (
  permission: NotificationPermission
): void => {
  (
    Notification as unknown as { permission: NotificationPermission }
  ).permission = permission;
};

describe('requestNotificationPermission', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).Notification;
  });

  it('returns false when Notification is unsupported', async () => {
    await expect(requestNotificationPermission()).resolves.toBe(false);
  });

  it('returns true when permission is already granted', async () => {
    (globalThis as Record<string, unknown>).Notification = class Notification {
      static permission: NotificationPermission = 'granted';
    };
    await expect(requestNotificationPermission()).resolves.toBe(true);
  });

  it('returns false when permission is denied', async () => {
    (globalThis as Record<string, unknown>).Notification = class Notification {
      static permission: NotificationPermission = 'denied';
    };
    await expect(requestNotificationPermission()).resolves.toBe(false);
  });

  it('requests permission when not decided yet', async () => {
    (globalThis as Record<string, unknown>).Notification = class Notification {
      static permission: NotificationPermission = 'default';
      static requestPermission = jest.fn(async () => 'granted' as const);
    };
    await expect(requestNotificationPermission()).resolves.toBe(true);

    (globalThis as Record<string, unknown>).Notification = class Notification {
      static permission: NotificationPermission = 'default';
      static requestPermission = jest.fn(async () => 'denied' as const);
    };
    await expect(requestNotificationPermission()).resolves.toBe(false);
  });
});

describe('getNotificationStatus', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).Notification;
  });

  it('returns unsupported without Notification', () => {
    expect(getNotificationStatus()).toBe('unsupported');
  });

  it('returns the current permission', () => {
    (globalThis as Record<string, unknown>).Notification = class Notification {
      static permission: NotificationPermission = 'granted';
    };
    expect(getNotificationStatus()).toBe('granted');
  });
});

describe('sendNotification', () => {
  let focusSpy: jest.SpyInstance;
  let NotificationMock: jest.Mock;

  beforeEach(() => {
    focusSpy = jest.spyOn(window, 'focus').mockImplementation(() => {});
    NotificationMock = jest.fn().mockImplementation(() => ({
      close: jest.fn(),
      onclick: null,
    }));
    (globalThis as Record<string, unknown>).Notification = NotificationMock;
    (
      NotificationMock as unknown as { permission: NotificationPermission }
    ).permission = 'granted';
  });

  afterEach(() => {
    focusSpy.mockRestore();
    delete (globalThis as Record<string, unknown>).Notification;
  });

  it('returns early when permission is not granted', () => {
    setNotificationPermission('denied');
    sendNotification('Title', 'Body');
    expect(NotificationMock).not.toHaveBeenCalled();
  });

  it('creates a notification and focuses on click', () => {
    setNotificationPermission('granted');
    sendNotification('Title', 'Body', 'icon.png');
    expect(NotificationMock).toHaveBeenCalledWith('Title', {
      body: 'Body',
      icon: 'icon.png',
    });

    const instance = NotificationMock.mock.results[0].value;
    instance.onclick();
    expect(focusSpy).toHaveBeenCalled();
    expect(instance.close).toHaveBeenCalled();
  });
});

describe('scheduleReminder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    const NotificationMock = jest.fn();
    (globalThis as Record<string, unknown>).Notification = NotificationMock;
    (
      NotificationMock as unknown as { permission: NotificationPermission }
    ).permission = 'granted';
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (globalThis as Record<string, unknown>).Notification;
  });

  it('sends immediately when the time has passed', () => {
    const sendSpy = jest.spyOn({ send: () => undefined }, 'send');
    jest.spyOn(globalThis, 'setTimeout');
    scheduleReminder('m1', 'Title', 'Body', Date.now() - 1000);
    expect(sendSpy).toHaveBeenCalledTimes(0);
  });

  it('schedules a timer for a future reminder', () => {
    scheduleReminder('m1', 'Title', 'Body', Date.now() + 5000);
    expect(jest.getTimerCount()).toBe(1);

    jest.advanceTimersByTime(5000);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('replaces an existing reminder for the same match', () => {
    const clearSpy = jest.spyOn(globalThis, 'clearTimeout');
    scheduleReminder('m1', 'Title', 'Body', Date.now() + 1000);
    scheduleReminder('m1', 'Title2', 'Body2', Date.now() + 2000);
    expect(clearSpy).toHaveBeenCalled();
  });
});

describe('cancelReminder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (globalThis as Record<string, unknown>).Notification;
  });

  it('clears and removes the timer', () => {
    const NotificationMock = jest.fn();
    (globalThis as Record<string, unknown>).Notification = NotificationMock;
    (
      NotificationMock as unknown as { permission: NotificationPermission }
    ).permission = 'granted';

    const clearSpy = jest.spyOn(globalThis, 'clearTimeout');
    scheduleReminder('m1', 'Title', 'Body', Date.now() + 5000);
    expect(jest.getTimerCount()).toBe(1);

    cancelReminder('m1');
    expect(clearSpy).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('is a no-op when no timer exists', () => {
    const clearSpy = jest.spyOn(globalThis, 'clearTimeout');
    cancelReminder('missing');
    expect(clearSpy).not.toHaveBeenCalled();
  });
});
