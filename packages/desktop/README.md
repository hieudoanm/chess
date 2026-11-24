# chess-desktop

Desktop tournament manager for the `chess` platform — create and manage chess
tournaments across all formats (single/double elimination, round robin, groups,
swiss), with participants, matches, standings, brackets, and export/import.

Ported from `hieudoanm.github.io` `sports/tourney`.

## Stack

- Next.js 16 (App Router) static export (`output: "export"`)
- React 19, Tailwind CSS 4, DaisyUI 5
- sql.js — local SQLite in IndexedDB, no backend required
- Tauri 2 — desktop shell (`src-tauri/`)

## Commands

```bash
pnpm install
pnpm run dev        # Next.js dev server on :3000
pnpm run build      # static export → out/ (Tauri frontendDist)
pnpm run tauri      # run the desktop app
pnpm run typecheck  # tsc --noEmit
pnpm run lint       # eslint --fix
pnpm run test       # jest (unit + coverage)
pnpm run test:e2e   # playwright
```

## Structure

- `src/app/(tournament)/` — bracket, create, match, matches, participants,
  standings, tournament pages
- `src/components/` — atoms → molecules → organisms → pages (atomic design)
- `src/lib/` — tournament engine: `formats`, `standings`, `scheduling`,
  `match-rules`, `db`/`sqlite`, `export`/`import`, `bracket-export`
- `src/types/` — shared models
- `src-tauri/` — Tauri 2 shell
- `docs/` — feature/architecture docs carried over from the source app
