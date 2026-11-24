# Contributing

Thanks for contributing to **Tourney**, a hybrid app that ships as a web app
(browser), desktop app (Tauri), and mobile app (Tauri Mobile).

## Getting Started

1. **Prerequisites**: Node.js (see `.nvmrc` at the repo root) and `pnpm`.
2. **Install dependencies** from the workspace root:

   ```bash
   pnpm install
   ```

3. **Run this app**:

   ```bash
   pnpm dev --filter=@hieudoanm.github.io/tourney
   ```

## Development Commands

| Task       | Command                                               |
| ---------- | ----------------------------------------------------- |
| Dev server | `pnpm dev --filter=@hieudoanm.github.io/tourney`      |
| Build      | `pnpm build --filter=@hieudoanm.github.io/tourney`    |
| Lint       | `pnpm lint --filter=@hieudoanm.github.io/tourney`     |
| Format     | `pnpm format --filter=@hieudoanm.github.io/tourney`   |
| Unit tests | `pnpm test --filter=@hieudoanm.github.io/tourney`     |
| E2E tests  | `pnpm test:e2e --filter=@hieudoanm.github.io/tourney` |

Run `lint`, `format`, `test`, and `test:e2e` before pushing — CI enforces all of
them.

## Coding Conventions

The conventions below come from the repository-wide `AGENTS.md`. Follow them for
every change.

### General

1. **Explicit types over implicit** — annotate function signatures and exported
   symbols. A signature tells the reader more than a body.
2. **Flat over deeply nested** — short functions, minimal indentation, guard
   clauses (`if (!value) return`).
3. **Self-documenting identifiers** — `getUserById(id)` needs no comment;
   `processData(x)` does.
4. **DRY** — when a pattern repeats, centralize it. Duplication is how bugs get
   missed.
5. **Small, focused files** — functions ≤ 30 lines, files ≤ 200 lines.
6. **Explicit error handling** — check errors and fail loudly; never let
   failures silently propagate.
7. **Test names as documentation** — `test("returns 404 when user not found")`.
8. **Consistent imports** — group by origin: stdlib, third-party, internal.
9. **Pure functions with explicit dependencies** — accept inputs, return
   outputs; no global/singleton state.
10. **Conventional layouts** — `src/`, `components/`, `lib/`, `e2e/`.

### TypeScript

1. Use arrow functions for all function declarations and component exports —
   `const fn = () => {}`, not `function fn() {}`.
2. Use `const` over `let` when a value is never reassigned.
3. Use `strict: true` in `tsconfig.json`.
4. Prefer `interface` over `type` for object shapes; use `type` for unions,
   intersections, and primitives.
5. Use `as const` for literal types; use branded types for domain primitives.
6. Use `satisfies` over raw casts — `const config = {...} satisfies Config`.
7. Use `never` in exhaustive checks — `default: const _exhaustive: never = x;`.
8. Use `Readonly<T>` and `Partial<T>` to mark immutability.
9. Favour `zod` (or `io-ts`) for runtime validation at the boundary.
10. Explicitly type return values on exported functions.

### React

1. Prefer function components with hooks; never nest hooks inside conditionals
   or loops.
2. Extract custom hooks (`useX`) for reusable logic.
3. Use `useReducer` for complex state; colocate state with its consumers.
4. Use a stable `key` prop in lists — never array indices.
5. Memoise sparingly (`useMemo`/`useCallback`/`React.memo`) — profile first.
6. Run in `React.StrictMode` during development.

### Next.js

1. Use the App Router (`app/`) and prefer Server Components by default.
2. Mark files `"use client"` only when they need interactivity or hooks.
3. Use flat routes + `useSearchParams()` instead of dynamic segments where
   possible.
4. Use `loading.tsx`, `error.tsx`, `not-found.tsx` file conventions for
   fallbacks.
5. Use `next/link` for client-side navigation.

### Styling

1. Use Tailwind utility classes; compose, don't write custom CSS.
2. Use DaisyUI component classes (`btn`, `card`, `badge`, `input`).
3. Dark theme is the default (`data-theme="night"`).
4. `prettier-plugin-tailwindcss` sorts classes — keep class order consistent.
5. Use `react-icons` Feather (`Fi`) set for icons.

### Atomic Design

Structure components as atoms -> molecules -> organisms -> templates:

- `atoms/` — smallest building blocks (Button, Badge, Input)
- `molecules/` — combinations of atoms (Card, Modal, Form)
- `organisms/` — complex sections (Header, Sidebar, Bracket)
- `templates/` — page-level layouts (TournamentTemplate, SettingsTemplate)

## Testing Conventions

### Unit tests (Jest)

1. Test behaviour, not implementation.
2. Use Arrange-Act-Assert.
3. Keep tests isolated — each test manages its own state.
4. Cover boundary conditions and error cases alongside happy paths.
5. Break tests into small per-file suites — one `*.test.ts` / `*.test.tsx` per
   unit (component, page, hook, util, provider) colocated in a `__tests__/`
   directory; never merge multiple units into one file. App pages are tested
   under `src/app/__tests__/` with a `*.test.tsx` matching each page, and pages
   in route groups (`(app)`, `(info)`) colocate `__tests__/page.test.tsx` in the
   same folder. Use `it.each` for data-driven tests.
6. Maintain ≥90% coverage on statements, branches, functions, and lines —
   enforced by `coverageThreshold` in `jest.config.ts`; run
   `pnpm exec jest --coverageReporters=text` to view per-file coverage.

### E2E tests (Playwright)

1. Use `locator`/`getByRole`/`getByText` over raw CSS/XPath.
2. Mock network via `page.route(...)` so tests don't need external services.
3. Use `test.beforeEach` for shared setup.
4. Assert on user-visible state (`toBeVisible`, `toHaveText`).
5. Cover every page-level flow (`pnpm test:e2e`).

## Before You Push

1. `pnpm lint --filter=@hieudoanm.github.io/tourney`
2. `pnpm format --filter=@hieudoanm.github.io/tourney`
3. `pnpm test --filter=@hieudoanm.github.io/tourney`
4. `pnpm test:e2e --filter=@hieudoanm.github.io/tourney`
5. `pnpm build --filter=@hieudoanm.github.io/tourney`
