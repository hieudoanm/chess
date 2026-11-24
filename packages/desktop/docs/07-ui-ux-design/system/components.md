# SML — Components

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

**DaisyUI first, Tailwind second, custom CSS last.** Wrap DaisyUI class strings
in small typed components so pages never copy them. The wrappers live in
[`packages/frontend/src/components/ui`](../../../packages/frontend/src/components/ui).

| Component        | Wrapper         | DaisyUI                                                 | Notes                                                                                                                                                                          |
| ---------------- | --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button           | `Button`        | `btn`, `btn-<variant>`, `btn-sm` / `btn-lg`             | `primary`, `secondary`, `accent`, `neutral`, `outline`, `ghost`, `success`, `warning`, `error`; `isLoading` renders an inner `loading loading-spinner` and disables the button |
| File drop        | `FileDrop`      | `border-2 border-dashed`                                | CSV only; validates extension and size before emitting                                                                                                                         |
| Status badge     | `StatusBadge`   | `badge badge-warning` / `badge-success` / `badge-error` | Text label, never colour alone                                                                                                                                                 |
| Alert            | `ApiAlert`      | `alert alert-error` etc.                                | Envelope message; optional title and dismiss; `NetworkErrorAlert` adds a retry action                                                                                          |
| Select           | —               | `select select-bordered w-full`                         | Algorithm, label, task                                                                                                                                                         |
| Checkbox         | —               | `checkbox checkbox-sm`                                  | Feature columns, extra export formats                                                                                                                                          |
| Card             | —               | `card bg-base-100 shadow`                               | Sections                                                                                                                                                                       |
| Stepper          | —               | `steps`                                                 | Job lifecycle / wizard                                                                                                                                                         |
| Loading          | —               | `loading loading-spinner`                               | Buttons and page-level waits                                                                                                                                                   |
| Table            | —               | `table`                                                 | Column preview, jobs history, metrics                                                                                                                                          |
| Theme controller | `Navbar` toggle | `data-theme` on `<html>`                                | Light/dark, persisted                                                                                                                                                          |

Rules:

1. Prefer a wrapper over a bare class string.
2. A button in a loading state keeps its label and shows the spinner beside it;
   it does not become a spinner itself.
3. A disabled download renders as a non-interactive element, not a link with
   `pointer-events-none`.
