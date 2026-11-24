# SML — Accessibility

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

- All interactive elements are keyboard reachable, with a visible
  `:focus-visible` ring.
- The file drop labels its input ("Upload CSV"); the input is not hover-only.
  Validation errors are wired to the input with `aria-describedby`.
- Status badges carry text, not colour alone.
- Errors are associated with their control via `aria-describedby` (and the alert
  is `role="alert"`).
- Contrast meets AA for text on `base-100` in both themes.
- `prefers-reduced-motion: reduce` disables non-essential animation and smooth
  scrolling.
- Download links announce their filename; unavailable artefacts are not
  focusable.
- Page-level waits use a labelled spinner (`role="status"`), not a bare `<div>`.
- Polling updates a dedicated status region with `aria-live="polite"`; the
  metrics table does not churn.
- The theme toggle keeps the stable accessible name "Toggle theme" (also used by
  the e2e suite) and reflects the current theme through its icon; it is not the
  only pointer to theme state.
