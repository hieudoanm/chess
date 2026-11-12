# AGENTS.md — packages/landing

Next.js 16 (App Router) static-export landing page + Tailwind CSS v4 + DaisyUI
5, deployed to GitHub Pages at `https://hieudoanm.github.io/chess/` (project
site — `basePath: "/chess"`, `assetPrefix` likewise in production).

## Commands

```bash
pnpm install
pnpm run dev      # dev server (basePath applies)
pnpm run build    # static export → out/ (uploaded to Pages by CI)
pnpm run lint
```

## Structure

- `src/app/layout.tsx` — metadata, fonts, and the global `Navbar`/`Footer` (all
  content passed as props).
- `src/app/page.tsx` — page content as data passed to the shared components.
- `src/components/molecules/` — shared components (`Navbar`, `Hero`, `Features`,
  `CTA`, `Footer`, `SectionHead`, `Terminal`). These files are **byte-identical
  across all `hieudoanm/*/packages/landing` repos** — do not fork them; pass
  content via props instead.
- `src/app/globals.css` — Tailwind v4 imports + the custom DaisyUI `chess` light
  theme.
- `public/` — `favicon.ico`, `favicon.svg`, `logo.*`, `og.png`, `robots.txt`,
  `sitemap.xml`, `humans.txt`, served under `/chess/` in production.

## Conventions

- Keep `output: "export"` in `next.config.ts` — the site must build to static
  HTML in `out/`; no server features or API routes.
- `basePath`/`assetPrefix` are `/chess` in production builds; `next/link` and
  metadata get it automatically, raw `<img src>` paths must include it (see the
  `LOGO` constant in `layout.tsx`).
- Theme is light-only via `data-theme="chess"` on `<html>`; accent colours
  differ per repo but every theme is light.
- Fonts: Inter via `next/font`; mono stack for terminal/code only.
- Design follows the "AI unslop" rules: no filler badges, monospace only for
  code/commands, real CLI output in demos.
- Terminal output in demos must reflect real `chess` output — regenerate it from
  an actual run if the CLI output format changes.
