# Project: Chess Unlocked

## Overview

Build an open-source browser extension that replaces Chess.com's paid features
with equivalent free functionality provided by Lichess.org.

The extension should act as a compatibility layer between Chess.com and Lichess.
It should detect Chess.com pages, identify relevant features and UI elements,
and replace or enhance them with direct links to their Lichess equivalents.

**Core philosophy:**

- Use Chess.com for playing chess.
- Use Lichess for analysis, training, statistics and learning.
- Replace paid workflows with free alternatives wherever a strong functional
  match exists.
- Avoid building another simple PGN importer.
- Prioritise seamless integration into the existing Chess.com interface.

## 1. Technology stack

Use:

- TypeScript
- WebExtensions API
- Manifest V3 for Chromium browsers
- Firefox compatibility
- Vite for development and bundling
- pnpm for package management
- Vitest for unit testing

Requirements:

- Strict TypeScript.
- No `any`.
- Modular architecture.
- No unnecessary dependencies.
- No backend required for the initial release.
- Respect browser extension security restrictions.
- Follow Chrome and Firefox extension guidelines.

## 2. Core functionality

### A. Chess.com interface detection

Implement a content-script system that:

- Detects Chess.com pages and their current page types.
- Identifies relevant buttons, navigation items, menus and premium feature entry
  points.
- Detects dynamically rendered elements.
- Supports Chess.com's single-page navigation.
- Uses MutationObserver where appropriate.
- Avoids modifying unrelated Chess.com functionality.
- Handles DOM changes gracefully.

Use resilient selectors and isolate Chess.com-specific selectors in dedicated
modules.

### B. Feature replacement system

Create a configurable feature mapping system.

Each replacement should contain:

- Feature identifier.
- Chess.com source page or UI selector.
- Original feature name.
- Lichess destination.
- Replacement label.
- Optional game or position extraction function.
- Replacement strategy.
- Availability status.

Support three strategies:

1. Button replacement: replace the original Chess.com button with a Lichess
   alternative.
2. Navigation interception: intercept relevant navigation and redirect to
   Lichess.
3. UI enhancement: inject additional actions without removing existing
   functionality.

Preserve the original Chess.com interface wherever possible.

## 3. Feature mapping

Only implement features with strong functional equivalents.

### Gold replacements

| Chess.com feature | Lichess destination          |
| ----------------- | ---------------------------- |
| Unlimited Puzzles | https://lichess.org/training |
| Puzzle Rush       | https://lichess.org/storm    |
| Puzzle Battle     | https://lichess.org/racer    |
| Opening Explorer  | https://lichess.org/opening  |
| Endgame Practice  | https://lichess.org/practice |

Implementation requirements:

- Replace puzzle navigation actions with Lichess alternatives.
- Transfer FEN or puzzle position when supported.
- Preserve relevant opening positions when opening the Lichess Explorer.
- Provide appropriate contextual links rather than redirecting every Chess.com
  page indiscriminately.
- For endgame exercises, map only when a meaningful equivalent can be
  identified.

### Platinum replacements

| Chess.com feature     | Lichess destination          |
| --------------------- | ---------------------------- |
| Game Review           | https://lichess.org/analysis |
| Computer Analysis     | https://lichess.org/analysis |
| Unlimited Game Review | https://lichess.org/analysis |

Implementation requirements:

- Extract completed games in PGN format.
- Extract game metadata where available.
- Open the corresponding Lichess analysis page.
- Preserve the move sequence and result.
- Provide a fallback when PGN extraction fails.
- Support live game completion and archived games.
- Avoid duplicate imports where possible.

### Diamond replacements

| Chess.com feature   | Lichess destination          |
| ------------------- | ---------------------------- |
| Insights            | https://lichess.org/insights |
| Advanced Statistics | https://lichess.org/insights |
| Coach explanations  | https://lichess.org/analysis |

Important:

- Do not claim that Lichess provides identical personalised coaching.
- Use Lichess engine analysis as an alternative for move evaluation.
- Do not invent functionality that Lichess does not support.
- Preserve access to original Chess.com features where no meaningful alternative
  exists.

## 4. Context-aware Lichess integration

This is the most important differentiator.

Do not simply redirect users to the Lichess homepage.

Extract contextual information from Chess.com whenever possible:

- FEN.
- PGN.
- Current position.
- Move sequence.
- Opening position.
- Game result.
- Player names.
- Game identifier.

Use the information to construct the most appropriate Lichess destination.

Examples:

- Game Review → import PGN into Lichess analysis.
- Opening Explorer → open the current position in the Lichess Explorer.
- Puzzle → open the corresponding position in Lichess analysis or training when
  supported.
- Endgame Practice → open a matching Lichess practice resource.
- Insights → open the user's Lichess Insights page.

Use official Lichess APIs and documented URL formats where applicable.

Do not depend on undocumented private APIs.

## 5. Extension settings

Create an options page with:

- Enable/disable individual replacements.
- Enable/disable all replacements.
- Choose between button replacement and navigation interception.
- Configure whether external links open in the current tab or a new tab.
- Enable or disable contextual PGN/FEN transfer.
- Restore original Chess.com buttons.
- Reset settings to defaults.

Use browser storage for preferences.

## 6. User experience

Design a minimal, polished interface.

Requirements:

- Preserve Chess.com's existing visual hierarchy.
- Use native-looking replacement buttons.
- Clearly indicate when an action opens Lichess.
- Avoid excessive notifications.
- Provide useful fallback messages.
- Ensure keyboard accessibility.
- Support light and dark interfaces.
- Avoid obstructing Chess.com gameplay.

Add a small extension settings panel with:

- Extension status.
- Enabled replacements.
- Current Chess.com page type.
- Lichess connection status where applicable.

## 7. Architecture

Use a modular structure similar to:

src/ background/ index.ts content/ index.ts observer.ts navigation.ts dom/
selectors.ts replacements.ts features/ game-review/ index.ts pgn-extractor.ts
opening-explorer/ index.ts fen-extractor.ts puzzles/ index.ts puzzle-rush/
index.ts puzzle-battle/ index.ts endgame/ index.ts insights/ index.ts analysis/
index.ts integrations/ lichess/ urls.ts api.ts importer.ts settings/ defaults.ts
storage.ts shared/ types.ts constants.ts logger.ts popup/ options/

Keep feature-specific logic independent.

Avoid implementing all replacements in a single content script.

## 8. Reliability and testing

Implement tests for:

- Chess.com page detection.
- Feature mapping.
- PGN extraction.
- FEN extraction.
- Lichess URL construction.
- Settings persistence.
- Dynamic DOM replacement.
- SPA navigation.
- Duplicate button prevention.
- Fallback behaviour.

Test on:

- Chess.com game review pages.
- Chess.com live game pages.
- Chess.com game archive.
- Chess.com opening explorer.
- Chess.com puzzles.
- Chess.com puzzle rush.
- Chess.com puzzle battle.
- Chess.com statistics pages.

Do not assume selectors are stable. Isolate and document selectors.

## 9. Development priorities

### Phase 1: Foundation

- Browser extension scaffolding.
- Chess.com page detection.
- Dynamic DOM observation.
- Feature mapping architecture.
- Settings and feature toggles.

### Phase 2: High-value replacements

1. Opening Explorer.
2. Game Review.
3. Puzzle navigation.
4. Puzzle Rush.
5. Puzzle Battle.
6. Insights.
7. Endgame Practice.

### Phase 3: Contextual integration

- PGN extraction.
- FEN extraction.
- Position-aware Lichess navigation.
- Game archive support.
- Improved import workflow.

### Phase 4: Polish

- Options page.
- Error handling.
- Cross-browser testing.
- Documentation.
- Release packaging.

## 10. Scope restrictions

Do not implement:

- Chess.com account bypasses.
- Subscription circumvention.
- Automated gameplay or move assistance during live games.
- Unrelated cosmetic modifications.
- Features without a meaningful Lichess equivalent.
- An alternative video course library.
- A new chess engine when Stockfish already meets the requirement.
- A backend service unless genuinely necessary.

Do not claim to replace a paid feature unless the alternative has been verified.

## 11. Deliverables

Produce:

1. Complete working browser extension.
2. Clean modular TypeScript source code.
3. Manifest files for supported browsers.
4. Automated tests.
5. README with installation and development instructions.
6. Feature compatibility matrix.
7. Documented Chess.com selectors and fallback strategies.
8. Build scripts and release instructions.

## Final objective

Create a reliable browser extension that makes Chess.com a better interface for
accessing the free Lichess ecosystem.

The extension should go beyond transferring games: it should identify
Chess.com's premium feature entry points and offer relevant, contextual Lichess
alternatives directly from the original interface.

Prioritise correctness, maintainability and strong feature equivalence over the
number of supported replacements.

## Repository layout & commands

Built with Vite (not raw tsc like `vectors`): `ENTRY=content|background` produce
IIFE bundles, default entry builds the popup/options MPA into `.build/ui/`.
`make build` assembles both variants; `make package` adds zip/xpi/crx to
`download/` (same artifact convention as `omni`/`vectors`).

```bash
pnpm install
make build          # vite x3 + assemble dist/v2 + dist/v3
make package        # + chess-unlocked-v{2,3}.{zip,xpi,crx}
pnpm run typecheck  # tsc --noEmit (strict, no any)
pnpm run test       # vitest, 80% coverage thresholds
pnpm run lint       # eslint --fix (use lint:check in CI)
pnpm run format     # prettier
```

- Feature mappings live in `src/features/<name>/index.ts` and are aggregated in
  `src/features/index.ts`; each declares `pageTypes`, an `anchor` spec (CSS +
  optional text regex — see `src/content/dom/selectors.ts`), a `lichessPath`, a
  `strategy` (`button` | `navigation` | `enhancement`) and an optional `extract`
  mode (`fen` | `pgn` | `none`).
- PGN extraction lives in `src/features/game-review/pgn-extractor.ts`, FEN
  extraction in `src/features/opening-explorer/fen-extractor.ts`; other features
  import them for context transfer.
- Lichess URLs are built only in `src/integrations/lichess/urls.ts` — use the
  verified `/analysis/{fen}` format (spaces→`_`, `/` kept literal) and `/paste`
  for PGN import; do not invent URL params.
- Settings persist via `chrome.storage.sync` under `chessUnlocked.settings`; the
  options page and popup talk to the background worker through
  `chess-unlocked:*` runtime messages.
- `dist/v3` is the Chromium MV3 build; `dist/v2` is the Firefox/legacy MV2
  build. `web-ext lint` on v3 reports expected Firefox-incompat errors; v2
  should stay at 0 errors.
