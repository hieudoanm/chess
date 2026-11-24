# SML — Responsive Design

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

| Viewport | Width    | Behaviour                                                                 |
| -------- | -------- | ------------------------------------------------------------------------- |
| mobile   | < 768    | Single column; navbar collapses to a dropdown; primary CTAs go full width |
| tablet   | 768–1023 | Two-column cards where they fit                                           |
| desktop  | ≥ 1024   | Full wizard and tables; `max-w-5xl` / `max-w-6xl` content                 |

Rules:

- Preview and history tables scroll horizontally on small screens
  (`overflow-x-auto`).
- Feature-column chips wrap; never require hover to select.
- Primary CTAs are `w-full sm:w-auto`; the paired hero CTAs stack full width on
  mobile.
- The navbar uses the DaisyUI `navbar` layout with a dropdown below `md`.
