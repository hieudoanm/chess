# Roadmap

> No sign-in / sign-up required. All data stored locally in IndexedDB. Works
> offline. Export anytime to CSV or SQLite.

## Phase 1 — Core UI (Foundation)

- [x] Project setup (Next.js, TypeScript, Tailwind, DaisyUI)
- [x] IndexedDB data layer (tournaments, participants, matches)
- [x] Dashboard page with tournament list
- [x] Create tournament form (name, format, dates)
- [x] Tournament detail page (overview tab)
- [x] Basic navigation (bottom nav, breadcrumbs)
- [x] Settings page with theme switcher
- [x] Profile page (local stats, no auth)
- [x] Version page

## Phase 2 — Tournament Formats (Core Logic)

- [x] Single Elimination bracket generation
- [x] Double Elimination bracket generation
- [x] Round Robin schedule generation
- [x] Swiss System pairing algorithm
- [x] Group Stage + Knockout flow
- [x] Automatic group-to-knockout advancement (top 2 per group via standings)
- [x] League standings calculation
- [x] Format-specific tournament detail views

## Phase 3 — Bracket & Matches (Visualization)

- [x] Interactive bracket component
- [x] Match detail page with score entry
- [x] Bracket navigation (rounds, matches)
- [x] Auto-advance winners
- [x] Match scheduling with calendar view
- [x] Reschedule matches (drag-and-drop)
- [x] Bracket export (PNG, PDF)

## Phase 4 — Standings & Rankings (Data)

- [x] Standings table component
- [x] Points calculation per format
- [x] Tiebreaker rules (head-to-head, goal difference)
- [x] Live standings updates
- [x] Historical standings snapshots
- [x] Participant stats (wins, losses, draws)
- [x] Leaderboard across tournaments

## Phase 5 — Participants & Management (Organization)

- [x] Participant registration flow (no account needed)
- [x] Seeding system (manual, rating-based, random)
- [x] Group assignment for Group Stage
- [x] Team/player profiles
- [x] Tournament templates (save/load configurations)
- [x] Batch import participants (CSV)
- [x] Tournament cloning

## Phase 6 — Export & Data Portability

- [x] Export tournaments to CSV (participants, matches, standings)
- [x] Export tournaments to SQLite database
- [x] Import from CSV (participants, matches)
- [ ] Import from SQLite
- [x] Full backup/restore (all data as JSON)
- [x] Share tournament as portable file

## Phase 7 — Advanced Features (Intelligence)

- [x] Smart scheduling (minimize conflicts)
- [x] Predictive standings (simulate remaining matches)
- [x] Tournament analytics (average match duration, upsets)
- [ ] Notification system (match reminders, results)
- [ ] Share tournament (public link, embed)
- [ ] Live score updates (WebSocket simulation)

## Phase 8 — Platform & Integration (Ecosystem)

- [x] Tauri desktop app
- [ ] Android APK
- [ ] iOS build
- [ ] Push notifications
- [ ] Calendar integration (Google Calendar, Apple Calendar)
- [x] PWA support (installable, offline-first)

## Phase 9 — Match depth & rules

- [x] Best-of-N matches (bo3/bo5) with set-by-set score entry
- [x] Format match scoring rules (2-0/2-1 sets, penalty shootouts)
- [ ] Golden goal scoring rule
- [x] Walkover / forfeit handling (advance opponent, blank scores)
- [x] Third-place play-off toggle (single elimination, group-stage knockout)
- [ ] Score correction with automatic recalculation of standings/bracket
- [x] Tiebreaker priority list configurable per tournament

## Phase 10 — Ratings & player stats

- [ ] Elo/Glicko rating updates after each match (seed from initial ratings)
- [ ] In-match events: scorers, assists, cards, MVP — per-participant stats
      beyond W/L/D
- [ ] Player of the tournament / top scorer leaderboards
- [ ] Head-to-head records between participants

## Phase 11 — Live & venue logistics

- [ ] Spectator live view (auto-refresh via BroadcastChannel, no backend)
- [ ] Fullscreen presenter mode for projector screens
- [ ] Venue/table assignment with capacity + floor-plan view
- [ ] "Now playing / next on table X" live board
- [ ] Schedule conflict view and auto-assign tables

## Phase 12 — Communication & admin

- [ ] Announcements board per tournament
- [ ] Participant contact export (email/phone CSV)
- [ ] Referee/umpire assignment per match
- [ ] Penalty points and card registry per participant
- [ ] Audit log of score changes
- [ ] Admin handoff via local PIN/QR (still no accounts)

## Phase 13 — Formats & UX polish

- [ ] Reseeding between bracket rounds; seed drag-reorder
- [ ] Custom advancement rules (e.g. top-2-of-4 × 4 groups config)
- [ ] Home & away aggregate (multi-leg) league fixtures
- [ ] ICS/calendar file export (cloud calendar sync stays in Phase 8)
- [ ] Tournament theming (colors, logo) + participant emoji/logo avatars
- [ ] Undo/redo for score entries; keyboard bracket navigation
- [ ] Printable tournament program (schedule + venues + participants) PDF
