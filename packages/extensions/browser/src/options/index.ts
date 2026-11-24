import type { Settings } from '../shared/types';
import { FEATURE_IDS } from '../settings/defaults';
import { FEATURE_MAPPINGS } from '../features';

interface StatusResponse {
  name: string;
  version: string;
  settings: Settings;
  lichess: { ok: boolean; message: string };
}

const send = <T>(message: unknown): Promise<T> =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: T) => {
      resolve(response);
    });
  });

const FEATURE_LABELS: Record<string, string> = Object.fromEntries(
  FEATURE_MAPPINGS.map((m) => [m.id, `${m.name} → ${m.lichessPath}`])
);

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app');

const render = (status: StatusResponse): void => {
  const s = status.settings;
  app.innerHTML = `
    <h1>${status.name}</h1>
    <p class="muted">v${status.version} — Chess.com ↔ Lichess compatibility layer</p>

    <section class="card">
      <label class="switch">
        <input type="checkbox" id="enabled" ${s.enabled ? 'checked' : ''} />
        <span>Enable Chess Unlocked</span>
      </label>
    </section>

    <section class="card">
      <h2>Replacements</h2>
      <ul class="features">
        ${FEATURE_IDS.map(
          (id) => `
          <li>
            <label>
              <input type="checkbox" data-feature="${id}" ${
                s.features[id] ? 'checked' : ''
              } ${s.enabled ? '' : 'disabled'} />
              ${FEATURE_LABELS[id]}
            </label>
          </li>`
        ).join('')}
      </ul>
    </section>

    <section class="card">
      <h2>Behaviour</h2>
      <label class="row">
        <span>Replacement style</span>
        <select id="strategy" ${s.enabled ? '' : 'disabled'}>
          <option value="button" ${s.strategy === 'button' ? 'selected' : ''}>Button</option>
          <option value="navigation" ${s.strategy === 'navigation' ? 'selected' : ''}>Navigation interception</option>
        </select>
      </label>
      <label class="row">
        <span>Open links</span>
        <select id="openInNewTab" ${s.enabled ? '' : 'disabled'}>
          <option value="true" ${s.openInNewTab ? 'selected' : ''}>New tab</option>
          <option value="false" ${!s.openInNewTab ? 'selected' : ''}>Current tab</option>
        </select>
      </label>
      <label class="switch">
        <input type="checkbox" id="transferContext" ${
          s.transferContext ? 'checked' : ''
        } ${s.enabled ? '' : 'disabled'} />
        <span>Transfer PGN/FEN context to Lichess</span>
      </label>
    </section>

    <section class="card">
      <h2>Reset</h2>
      <p class="muted">Restore original Chess.com buttons and default settings.</p>
      <button id="reset" type="button" class="danger">Reset to defaults</button>
    </section>

    <p class="muted status">${status.lichess.ok ? 'Lichess: online' : `Lichess: ${status.lichess.message}`}</p>
  `;

  const persist = (patch: Partial<Settings>): void => {
    void send({ type: 'chess-unlocked:save-settings', settings: patch });
  };

  app
    .querySelector<HTMLInputElement>('#enabled')
    ?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      persist({ enabled: checked });
      render({ ...status, settings: { ...s, enabled: checked } });
    });

  app
    .querySelectorAll<HTMLInputElement>('input[data-feature]')
    .forEach((input) => {
      input.addEventListener('change', () => {
        const features = { ...s.features };
        features[input.dataset.feature as keyof Settings['features']] =
          input.checked;
        persist({ features });
      });
    });

  app
    .querySelector<HTMLSelectElement>('#strategy')
    ?.addEventListener('change', (e) => {
      persist({
        strategy: (e.target as HTMLSelectElement).value as Settings['strategy'],
      });
    });

  app
    .querySelector<HTMLSelectElement>('#openInNewTab')
    ?.addEventListener('change', (e) => {
      persist({
        openInNewTab: (e.target as HTMLSelectElement).value === 'true',
      });
    });

  app
    .querySelector<HTMLInputElement>('#transferContext')
    ?.addEventListener('change', (e) => {
      persist({ transferContext: (e.target as HTMLInputElement).checked });
    });

  app.querySelector('#reset')?.addEventListener('click', () => {
    void send({ type: 'chess-unlocked:reset-settings' }).then(() => {
      location.reload();
    });
  });
};

void send<StatusResponse>({ type: 'chess-unlocked:get-status' }).then(render);
