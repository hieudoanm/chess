# SML — Screen Designs

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

## Home (`/`)

- Hero: heading "Simple Machine Learning", sub "Upload a CSV, choose a
  supervised model, download ONNX."
- Primary CTA: "Train a model" → `/jobs/new`. Secondary: "View jobs" → `/jobs`.
- Below the fold: a three-card feature grid (CSV upload, supervised models, ONNX
  export) and a three-step "How it works" strip, then a closing CTA band.

## New job (`/jobs/new`)

Wizard (one page, three cards) with a `steps` indicator:

1. **Dataset** — file drop, then a column preview table (name, inferred dtype,
   sample values).
2. **Mapping** — feature-column checkboxes, label select, task select
   (classification / regression).
3. **Model** — algorithm select, optional export checkboxes (`pickle`, `joblib`,
   `Keras` when the catalogue allows), Start training.

States: uploading, validation-error (CSV only, size limit), network-error,
unexpected-error. Success navigates to `/jobs/{jobId}`. Advancing is disabled
until each step is valid.

## Job status (`/jobs/[jobId]`)

- `steps` for the lifecycle (queued → validating → training → evaluating →
  exporting → completed), with a failed state that highlights the error.
- Status summary cards (status, algorithm, created).
- Metrics as a definition list (`<dl>`) on completed.
- Download links per artefact; ONNX emphasised (`btn-primary`). Links are only
  interactive once artefacts exist.
- Error alert on failed, using `error.message`.
- Polls every second and stops on a terminal status (`completed` / `failed`);
  the status region is `aria-live="polite"`.

## Jobs (`/jobs`)

- Table: created, status badge, task, algorithm, actions (open).
- Empty: "No jobs yet" + CTA.
- Loading: spinner. Error: alert with retry (network-error state).
