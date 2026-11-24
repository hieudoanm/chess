# Chess Unlocked

A browser extension that replaces Chess.com premium features with free
[Lichess.org](https://lichess.org) alternatives. Use Chess.com for playing; use
Lichess for analysis, training, statistics and learning.

## Feature compatibility

| Chess.com feature                              | Lichess destination    | Context transferred                                             |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| Unlimited Puzzles (Gold)                       | `lichess.org/training` | —                                                               |
| Puzzle Rush (Gold)                             | `lichess.org/storm`    | —                                                               |
| Puzzle Battle (Gold)                           | `lichess.org/racer`    | —                                                               |
| Opening Explorer (Gold)                        | `lichess.org/opening`  | FEN extracted (Lichess explorer has no documented position URL) |
| Endgame Practice (Gold)                        | `lichess.org/practice` | FEN extracted                                                   |
| Game Review / Unlimited Game Review (Platinum) | `lichess.org/analysis` | PGN → `/paste` + clipboard, or FEN → `/analysis/{fen}`          |
| Computer Analysis (Platinum)                   | `lichess.org/analysis` | PGN → `/paste` + clipboard, or FEN → `/analysis/{fen}`          |
| Insights / Advanced Statistics (Diamond)       | `lichess.org/insights` | —                                                               |

Lichess does not provide personalised coaching equivalent to Chess.com Coach;
engine analysis on `lichess.org/analysis` is the supported alternative.

## Install

### Development (load unpacked)

```bash
pnpm install
make build        # produces dist/v2 (Firefox/legacy) and dist/v3 (MV3)
```

- **Chrome / Edge**: `chrome://extensions` → Developer mode → _Load unpacked_ →
  select `dist/v3`.
- **Firefox**: `about:debugging#/runtime/this-firefox` → _Load Temporary Add-on_
  → select `dist/v2/manifest.json` (temporary) or package `.xpi` for a permanent
  install.

### Packaged builds

```bash
make package      # zip + xpi + crx → download/
```

Artifacts: `chess-unlocked-v{2,3}.{zip,xpi,crx}` in `download/`.

## Develop

```bash
pnpm install
pnpm run typecheck   # tsc --noEmit (strict, no any)
pnpm run test        # vitest unit tests
pnpm run lint        # eslint --fix
pnpm run format      # prettier
make build           # full build + assemble
```

### Layout

```
src/
  background/          MV3 service worker / MV2 background page
  content/             content-script entry, SPA watcher, page detection
    dom/               selectors + DOM replacement engine
  features/            one module per Chess.com feature mapping
  integrations/lichess/ urls, status API, PGN/FEN import planner
  settings/            defaults + chrome.storage.sync persistence
  shared/              types, constants, logger
popup.html             extension popup (status + feature toggles)
options.html           settings page
public/manifest/{v2,v3}/manifest.json
public/icons/          PNG icons
```

### Chess.com selectors

Chess.com is a React SPA with unstable hashed class names. Selectors live in
`src/content/dom/selectors.ts` and pair structural CSS (`a[href*="..."]`, roles)
with text-regex fallbacks. When selectors miss, the feature silently does not
render — the extension never breaks the host page. Update `FEATURE_ANCHORS`
there when Chess.com changes its markup.

### Settings

Stored in `chrome.storage.sync` under `chessUnlocked.settings`: `enabled`,
per-feature toggles, `strategy` (`button` vs `navigation`), `openInNewTab`,
`transferContext` (PGN/FEN transfer).

## License

MIT
