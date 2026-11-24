# Architecture

## Goals

- Hybrid app that runs as a **web app** (browser), **desktop app** (Tauri), and
  **mobile app** (Tauri Mobile)
- Static export for offline-first PWA support
- Atomic design system for reusable UI
- Type-safe throughout with strict TypeScript

## Tech Stack

| Layer       | Technology                         |
| ----------- | ---------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack) |
| Language    | TypeScript 6 (strict)              |
| Styling     | Tailwind CSS 4 + DaisyUI 5         |
| Icons       | react-icons (Fi set)               |
| Desktop     | Tauri 2                            |
| Testing     | Jest + Playwright                  |
| Linting     | ESLint 10 + Prettier               |
| Package Mgr | pnpm                               |
| Data        | Mock data with IndexedDB           |

## Directory Structure

```txt
src/
├── app/                    # App Router pages and layouts
│   ├── about/
│   ├── bracket/
│   ├── create/
│   ├── match/
│   ├── matches/
│   ├── participants/
│   ├── settings/
│   ├── profile/
│   ├── standings/
│   ├── tournament/
│   └── version/
├── components/
│   ├── atoms/              # Smallest building blocks
│   ├── molecules/          # Groups of atoms
│   ├── organisms/          # Complex UI sections
│   └── templates/          # Page-level layouts
├── data/                   # Mock data, seed data
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, helpers
├── providers/              # React Context providers
├── styles/                 # globals.css (Tailwind + DaisyUI)
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Application Layers

```txt
┌─────────────────────────────────────────┐
│  App Router (src/app/)                  │  Routes, layouts, error boundaries
├─────────────────────────────────────────┤
│  Templates (components/templates/)      │  Page-level layout shells
├─────────────────────────────────────────┤
│  Organisms (components/organisms/)      │  Sidebar, BracketView, StandingsTable
├─────────────────────────────────────────┤
│  Molecules (components/molecules/)      │  MatchCard, TournamentCard, ScoreEntry
├─────────────────────────────────────────┤
│  Atoms (components/atoms/)              │  StatusBadge, FormatTag, SeedChip, etc.
├─────────────────────────────────────────┤
│  Providers (providers/)                 │  DataProvider, ToastProvider
├─────────────────────────────────────────┤
│  Styles (styles/)                       │  Tailwind base layer, CSS variables
└─────────────────────────────────────────┘
```

## Routing

| Route           | Page              | Client | Description                                   |
| --------------- | ----------------- | ------ | --------------------------------------------- |
| `/`             | `page.tsx`        | Yes    | Dashboard — tournament list, search           |
| `/create`       | Create Tournament | Yes    | Name, format, participants, rules             |
| `/tournament`   | Tournament Detail | Yes    | Overview, bracket/standings (via `?id=`)      |
| `/bracket`      | Bracket View      | Yes    | Visual bracket for elimination (via `?id=`)   |
| `/standings`    | Standings         | Yes    | Rankings, points, win/loss (via `?id=`)       |
| `/matches`      | Match List        | Yes    | All matches, results, scheduling (via `?id=`) |
| `/participants` | Participants      | Yes    | Team/player list, seeding (via `?id=`)        |
| `/match`        | Match Detail      | Yes    | Score entry, match history (via `?id=`)       |
| `/settings`     | Settings          | Yes    | Theme, notifications, default format          |
| `/profile`      | Profile           | Yes    | User info, tournament history                 |
| `/version`      | Version           | Yes    | Build version display                         |

Pass entity IDs via `useSearchParams()` — e.g. `/tournament?id=123`.

## Rendering Strategy

- **Static export** (`output: 'export'` in `next.config.ts`) — all pages
  rendered at build time
- **Client Components** marked with `"use client"` — all pages require IndexedDB
  access and interactive bracket rendering
- No server actions, no API routes — pure static with local persistence

## State Management

- **IndexedDB** via `idb` for persistent state — tournaments, participants,
  matches, settings stored offline-first
- **Local state** with `useState` / `useReducer` — component-scoped UI state
- **DataProvider** context wraps the app — manages data access layer
- **Optimistic UI** — score entries apply instantly, persist in background

## Styling

- **Tailwind CSS 4** with `@tailwindcss/postcss` plugin
- **DaisyUI 5** for component classes (`btn`, `card`, `modal`, `badge`, etc.)
- **32 DaisyUI themes** — dark mode default (`data-theme="night"`)
- **Global base styles** in `src/styles/globals.css`
- **Framer Motion** for page transitions (fade + slide, `AnimatePresence`)

## Performance

- Static export means zero server runtime — CDN-deployable
- Turbopack for fast dev builds
- `removeConsole` strips `console.*` in production
- Service worker for offline caching and score submission queueing
- PWA manifest for installability
- Mock delay via `NEXT_PUBLIC_MOCK_DELAY` (default 800ms)
