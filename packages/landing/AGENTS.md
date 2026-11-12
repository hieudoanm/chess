# AGENTS.md - packages/landing

## Overview

Static marketing/landing page for chess. A single `index.html` +
`styles.css` — no framework, no build step, no JavaScript except a tiny
year-injection snippet. Deployed to GitHub Pages as-is.

## Conventions

- **Fonts:** Inter (sans) loaded via the Google Fonts `<link>` in `index.html`; mono stack `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace`. Tokens: `--font-sans` / `--font-mono`. Do not add other typefaces.

- Keep it dependency-free: edit `index.html`/`styles.css` directly.
- Asset URLs are relative (`logo.svg`, `favicon.svg`, `og-image.png`) so the
  page works under the `/chess/` Pages base path and from `file://`.
  The directory is flat — no asset subdirectories.
- Light theme only; terminal mockups stay dark via their own colour tokens —
  no theme toggle, no JS theming.
- Design follows the "AI unslop" rules: no filler badges, monospace only for
  code/commands, one accent colour, consistent radii/spacing, real CLI
  output instead of illustrations.
- Keep it a landing page — no API routes, no play UI.
- Terminal output in demos must reflect real `chess` output — regenerate it
  from an actual run if the CLI output format changes.

## Commands

There are none — serve statically:

```bash
python3 -m http.server 8000 -d packages/landing
```

## Footer

The footer follows the shared contract: `© {year} {repo-name}` (lowercase
repo name, dynamic year via `<span id="year">` + the year script), a
one-line tagline/license descriptor, and a right-aligned `<nav
aria-label="Footer">` with exactly two links — `GitHub` (repo root) and
`README` (`<repo>#readme`), both `target="_blank" rel="noreferrer"`.

## Features & CTA sections

`#features` and `#install` follow the shared template: centered
`.section-head` (h2 + one supporting paragraph), a `.grid-3` card grid
(`article.card` = `.card-icon` + h3 + p), and a closing CTA section on the
alt background (`.section-alt`, `.container-narrow`) ending in a
`.cta-row` with a primary `btn-lg` action plus at most one ghost button.
