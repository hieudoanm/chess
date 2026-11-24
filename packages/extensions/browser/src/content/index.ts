import { log, warn } from '../shared/logger';
import type { PageType } from '../shared/types';
import { loadSettings } from '../settings/storage';
import type { Settings } from '../shared/types';
import { getMappingsForPage } from '../features';
import { detectPageType } from './navigation';
import { applyReplacements } from './dom/replacements';
import { startDomObserver, startSpaWatcher } from './observer';

let settings: Settings | null = null;
let currentPageType: PageType = 'other';

const refreshSettings = async (): Promise<void> => {
  try {
    settings = await loadSettings();
  } catch (error) {
    warn('Failed to load settings', error);
    settings = null;
  }
};

const scan = (): void => {
  if (!settings) return;
  currentPageType = detectPageType(window.location.href);
  const mappings = getMappingsForPage(currentPageType);
  applyReplacements(document, mappings, settings);
};

const rescan = (): void => {
  void refreshSettings().then(scan);
};

export const getCurrentPageType = (): PageType => currentPageType;

const init = async (): Promise<void> => {
  await refreshSettings();
  scan();
  startDomObserver(() => scan());
  startSpaWatcher(rescan);
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && 'chessUnlocked.settings' in changes) {
        void refreshSettings().then(scan);
      }
    });
  }
  log('initialized on', currentPageType);
};

if (typeof document !== 'undefined') {
  void init();
}
