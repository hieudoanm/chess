# SML — Iconography

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

Use one icon set: **Phosphor** via `react-icons/pi`. Do not mix in hand-rolled
SVGs or Unicode glyphs.

- Sizes are `icon-xs` (16px), `icon-sm` (20px), `icon-md` (24px), `icon-lg`
  (32px), `icon-xl` (48px), defined in
  [`globals.css`](../../../packages/frontend/src/styles/globals.css).
- Decorative icons are `aria-hidden="true"`; the accessible name lives on the
  control.
- Semantic icons (download, error, theme) also have a name on the control.

Suggested set: `PiUpload`, `PiTable`, `PiCpu`, `PiDownload`, `PiCheckCircle`,
`PiWarningCircle`, `PiInfo`, `PiSun`, `PiMoon`.
