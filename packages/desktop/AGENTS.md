# Chess

Tournament management app — create, manage, and track competitions across
multiple formats.

## Documentation

Reference docs live in `docs/`:

| Doc                    | Covers                                                         |
| ---------------------- | -------------------------------------------------------------- |
| `docs/ARCHITECTURE.md` | Tech stack, directory structure, routing, state management     |
| `docs/ROADMAP.md`      | Phased feature roadmap with progress tracking                  |
| `docs/FEATURES.md`     | Business/technical feature catalogue, UX for mobile guidelines |
| `docs/CONTRIBUTING.md` | Setup, dev commands, coding and testing conventions            |
| `docs/PACKAGING.md`    | Packaging checklist per platform                               |
| `docs/DOWNLOADS.md`    | Download links per platform                                    |

## Key Conventions

1. **Arrow functions** — `const Component: FC<Props> = ({ prop }) => (...)`
2. **Explicit types** — All props, state, and return types annotated
3. **Path aliases** — `@/*` maps to `src/*`
4. **DaisyUI classes** — Use DaisyUI utility classes over raw Tailwind where
   possible
5. **Dark theme default** — `data-theme="night"` on `<html>`
6. **Prettier** — Run `pnpm run format` before commit (includes
   `prettier-plugin-tailwindcss`)
7. **Atomic design** — Components organized by size: atoms → molecules →
   organisms → templates
8. **Console logging** — `console.log('[Chess]', ...)` in development, stripped
   in production via `compiler.removeConsole`
9. **Mock delay** — Simulate network latency with `NEXT_PUBLIC_MOCK_DELAY`
   (default 800ms)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` (resolved from this file's directory; in
monorepos the `next` package may not be visible from the repo root) before
writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at
`node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a
diff only re-creates the uncommitted change; committing it with your work keeps
the tree clean.

<!-- END:nextjs-agent-rules -->
