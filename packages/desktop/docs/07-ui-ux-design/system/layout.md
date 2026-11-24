# SML — Layout

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

## Shell

- Top navbar (sticky): the SML [mark](../brand/README.md) plus wordmark linking
  home, links **Home** / **New job** / **Jobs**, and a theme toggle.
- Main: `max-w-5xl mx-auto` for forms and detail; `max-w-6xl` for the history
  table.
- Footer: local-only disclaimer ("Not a production AutoML service").

## Breakpoints

| Name    | Width    | Layout                                                                       |
| ------- | -------- | ---------------------------------------------------------------------------- |
| mobile  | < 768    | Single column, stacked mapping, collapsing navbar with dropdown              |
| tablet  | 768–1023 | Two-column mapping where possible                                            |
| desktop | ≥ 1024   | Upload → mapping → model wizard with the history/preview table at full width |

## Navigation

App Router routes:

- `/` — Home
- `/jobs/new` — New job wizard
- `/jobs` — Jobs history
- `/jobs/[jobId]` — Job status

The navbar uses a DaisyUI `navbar` layout: inline links at `md` and above, and a
dropdown menu below `md`.

## Theme

`<html data-theme>` is set to `sml-light` or `sml-dark`. An inline script
applies the stored theme (or `prefers-color-scheme`) before first paint to avoid
a flash; the toggle persists the choice to `localStorage` under `sml-theme`.
