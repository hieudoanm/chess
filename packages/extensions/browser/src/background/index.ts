import { EXTENSION_NAME, EXTENSION_VERSION } from '../shared/constants';
import {
  checkLichessStatus,
  type LichessStatus,
} from '../integrations/lichess/api';
import { loadSettings, saveSettings, resetSettings } from '../settings/storage';
import type { Settings } from '../shared/types';
import { mergeWithDefaults } from '../settings/storage';

interface StatusMessage {
  type: 'chess-unlocked:get-status';
}

interface SaveMessage {
  type: 'chess-unlocked:save-settings';
  settings: Partial<Settings>;
}

interface ResetMessage {
  type: 'chess-unlocked:reset-settings';
}

type Message = StatusMessage | SaveMessage | ResetMessage;

const isMessage = (value: unknown): value is Message =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { type?: unknown }).type === 'string';

const getStatus = async () => {
  const [settings, lichess] = await Promise.all([
    loadSettings(),
    checkLichessStatus(),
  ]);
  return {
    name: EXTENSION_NAME,
    version: EXTENSION_VERSION,
    settings,
    lichess: lichess satisfies LichessStatus,
  };
};

const handleMessage = async (message: Message): Promise<unknown> => {
  switch (message.type) {
    case 'chess-unlocked:get-status':
      return getStatus();
    case 'chess-unlocked:save-settings': {
      const current = await loadSettings();
      const next = mergeWithDefaults({ ...current, ...message.settings });
      await saveSettings(next);
      return { ok: true };
    }
    case 'chess-unlocked:reset-settings':
      await resetSettings();
      return { ok: true };
    default:
      return { ok: false };
  }
};

chrome.runtime.onMessage.addListener((raw, _sender, sendResponse) => {
  if (!isMessage(raw)) return false;
  void handleMessage(raw).then(sendResponse);
  return true;
});
