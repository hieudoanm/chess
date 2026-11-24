export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (
  title: string,
  body: string,
  icon?: string
): void => {
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, { body, icon });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

const reminderTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const scheduleReminder = (
  matchId: string,
  title: string,
  body: string,
  at: number
): void => {
  const existing = reminderTimers.get(matchId);
  if (existing) {
    clearTimeout(existing);
  }

  const delay = at - Date.now();
  if (delay <= 0) {
    sendNotification(title, body);
    return;
  }

  const timer = setTimeout(() => {
    sendNotification(title, body);
    reminderTimers.delete(matchId);
  }, delay);

  reminderTimers.set(matchId, timer);
};

export const cancelReminder = (matchId: string): void => {
  const timer = reminderTimers.get(matchId);
  if (timer) {
    clearTimeout(timer);
    reminderTimers.delete(matchId);
  }
};

export const getNotificationStatus = ():
  NotificationPermission | 'unsupported' => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};
