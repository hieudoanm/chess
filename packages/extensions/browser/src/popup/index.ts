import { detectPageType } from '../content/navigation';
import type { PageType } from '../shared/types';
import type { FeatureId, Settings } from '../shared/types';
import { FEATURE_IDS } from '../settings/defaults';
import { FEATURE_MAPPINGS } from '../features';
import { log } from '../shared/logger';

interface StatusResponse {
  name: string;
  version: string;
  settings: Settings;
  lichess: { ok: boolean; message: string };
}

const send = <T>(message: unknown): Promise<T> =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: T) => {
      if (chrome.runtime.lastError) {
        log('background error', chrome.runtime.lastError.message);
      }
      resolve(response);
    });
  });

const FEATURE_LABELS: Record<FeatureId, string> = Object.fromEntries(
  FEATURE_MAPPINGS.map((m) => [m.id, m.name])
) as Record<FeatureId, string>;

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app');

const render = (status: StatusResponse, pageType: PageType): void => {
  const enabledCount = FEATURE_IDS.filter(
    (id) => status.settings.features[id]
  ).length;
  const lichessBadge = status.lichess.ok
    ? '<span class="badge ok">Lichess online</span>'
    : `<span class="badge err">Lichess ${status.lichess.message}</span>`;

  app.innerHTML = `
    <header>
      <h1>${status.name}</h1>
      <p class="muted">v${status.version}</p>
      ${lichessBadge}
    </header>
    <section>
      <div class="row"><span>Status</span><strong>${
        status.settings.enabled ? 'Enabled' : 'Disabled'
      }</strong></div>
      <div class="row"><span>Replacements</span><strong>${enabledCount}/${FEATURE_IDS.length} enabled</strong></div>
      <div class="row"><span>Page</span><strong>${pageType}</strong></div>
    </section>
    <section>
      <h2>Replacements</h2>
      <ul class="features">
        ${FEATURE_IDS.map(
          (id) => `
          <li>
            <label>
              <input type="checkbox" data-feature="${id}" ${
                status.settings.features[id] ? 'checked' : ''
              } ${status.settings.enabled ? '' : 'disabled'} />
              ${FEATURE_LABELS[id]}
            </label>
          </li>`
        ).join('')}
      </ul>
    </section>
    <footer>
      <button id="open-options" type="button">Open settings</button>
    </footer>
  `;

  app
    .querySelectorAll<HTMLInputElement>('input[data-feature]')
    .forEach((input) => {
      input.addEventListener('change', () => {
        const features = { ...status.settings.features };
        features[input.dataset.feature as FeatureId] = input.checked;
        void send({
          type: 'chess-unlocked:save-settings',
          settings: { features },
        });
      });
    });
  app.querySelector('#open-options')?.addEventListener('click', () => {
    void chrome.runtime.openOptionsPage();
  });
};

const init = async (): Promise<void> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const pageType: PageType = tab?.url ? detectPageType(tab.url) : 'other';
  const status = await send<StatusResponse>({
    type: 'chess-unlocked:get-status',
  });
  render(status, pageType);
};

void init();
