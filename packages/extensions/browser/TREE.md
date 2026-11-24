# TREE — packages/extensions/browser

Chess Unlocked — MV2/MV3 WebExtension replacing Chess.com premium features with
Lichess.org equivalents. Built with Vite + TypeScript.

```
packages/extensions/browser/
├── AGENTS.md                  # spec
├── README.md
├── Makefile                   # build/package/lint/test/typecheck/clean
├── package.json               # chess-browser
├── tsconfig.json              # strict TS, types: ["chrome"]
├── vite.config.ts             # ENTRY=content|background|ui builds
├── vitest.config.ts           # 80% coverage thresholds
├── eslint.config.mts          # flat config + webextensions globals
├── popup.html                 # popup entry (→ src/popup/index.ts)
├── options.html               # options entry (→ src/options/index.ts)
├── public/
│   ├── manifest/v2/manifest.json
│   ├── manifest/v3/manifest.json
│   └── icons/                 # 16/32/48/128 png + svg
├── src/
│   ├── background/index.ts    # runtime messaging + Lichess status
│   ├── content/
│   │   ├── index.ts           # init, scan loop, settings listener
│   │   ├── navigation.ts      # URL → PageType detection
│   │   ├── observer.ts        # MutationObserver + SPA URL watcher
│   │   └── dom/
│   │       ├── selectors.ts   # documented Chess.com selectors
│   │       └── replacements.ts# anchor find, link inject, strategies
│   ├── features/
│   │   ├── index.ts           # FEATURE_MAPPINGS registry
│   │   ├── puzzles/ puzzle-rush/ puzzle-battle/
│   │   ├── opening-explorer/{index,fen-extractor}.ts
│   │   ├── endgame/
│   │   ├── insights/
│   │   ├── analysis/          # computer-analysis mapping
│   │   └── game-review/{index,pgn-extractor}.ts
│   ├── integrations/lichess/
│   │   ├── urls.ts            # documented lichess.org URL builders
│   │   ├── api.ts             # /api/status health check
│   │   └── importer.ts        # PGN/FEN → ImportPlan, clipboard, open
│   ├── settings/{defaults,storage}.ts
│   ├── shared/{types,constants,logger}.ts
│   ├── popup/index.ts
│   └── options/index.ts
├── .build/                    # vite intermediates (gitignored)
├── dist/v2 dist/v3            # assembled extensions (gitignored)
└── download/                  # chess-unlocked-v{2,3}.{zip,xpi,crx}
```
