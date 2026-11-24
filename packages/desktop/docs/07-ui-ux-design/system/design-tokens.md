# SML — Design Tokens

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

All values below are mirrored by:

- the DaisyUI themes `sml-light` / `sml-dark` in
  [`packages/frontend/src/styles/globals.css`](../../../packages/frontend/src/styles/globals.css),
  and
- the `@theme` / `[data-theme]` blocks in the
  [prototypes](../prototypes/README.md).

Change a token here, then change it in both places.

## Brand

Product name: **Simple Machine Learning** (short: **SML**). Wordmark in the UI
navbar; no third-party AutoML marks. See [`brand/README.md`](../brand/README.md)
for the marks themselves.

## Colour

Tokens are exposed to Tailwind as `--color-<name>`, so `--color-text-primary` is
the utility `text-text-primary`. DaisyUI semantic tokens (`primary`, `base-100`,
…) are also available as `btn-primary`, `bg-base-100`, and so on.

### Semantic (DaisyUI)

| Token               | Light     | Dark      | Use                             |
| ------------------- | --------- | --------- | ------------------------------- |
| `base-100`          | `#FFFFFF` | `#0F172A` | Surface                         |
| `base-200`          | `#F1F5F9` | `#1E293B` | Raised surface / default button |
| `base-300`          | `#CBD5E1` | `#334155` | Borders                         |
| `base-content`      | `#0F172A` | `#E2E8F0` | Text on base                    |
| `primary`           | `#2563EB` | `#60A5FA` | Train CTA                       |
| `primary-content`   | `#FFFFFF` | `#0B1120` | Text on primary                 |
| `secondary`         | `#64748B` | `#94A3B8` | Secondary actions               |
| `secondary-content` | `#FFFFFF` | `#0B1120` | Text on secondary               |
| `accent`            | `#0D9488` | `#2DD4BF` | ONNX / success emphasis         |
| `accent-content`    | `#FFFFFF` | `#0B1120` | Text on accent                  |
| `neutral`           | `#0F172A` | `#1E293B` | Neutral surfaces                |
| `neutral-content`   | `#FFFFFF` | `#E2E8F0` | Text on neutral                 |
| `info`              | `#3B82F6` | `#60A5FA` | Informational                   |
| `info-content`      | `#FFFFFF` | `#0B1120` | Text on info                    |
| `success`           | `#10B981` | `#34D399` | Completed                       |
| `success-content`   | `#FFFFFF` | `#0B1120` | Text on success                 |
| `warning`           | `#F59E0B` | `#FBBF24` | Queued / in progress            |
| `warning-content`   | `#78350F` | `#0B1120` | Text on warning                 |
| `error`             | `#EF4444` | `#F87171` | Failed / validation             |
| `error-content`     | `#FFFFFF` | `#0B1120` | Text on error                   |

### SML extended

| Token                       | Light                 | Dark                  | Use                        |
| --------------------------- | --------------------- | --------------------- | -------------------------- |
| `background`                | `#FFFFFF`             | `#0B1120`             | Page background            |
| `background-secondary`      | `#F8FAFC`             | `#0F172A`             | Alternating section        |
| `surface`                   | `#FFFFFF`             | `#0F172A`             | Card surface               |
| `surface-raised`            | `#F8FAFC`             | `#1E293B`             | Inset / icon surface       |
| `border`                    | `#E2E8F0`             | `#334155`             | Default border             |
| `border-light`              | `#F1F5F9`             | `#1E293B`             | Subtle divider             |
| `border-strong`             | `#94A3B8`             | `#475569`             | Emphasised border          |
| `text-primary`              | `#0F172A`             | `#E2E8F0`             | Body text                  |
| `text-secondary`            | `#64748B`             | `#94A3B8`             | Secondary text             |
| `text-tertiary`             | `#94A3B8`             | `#64748B`             | Helper text                |
| `text-inverse`              | `#FFFFFF`             | `#0B1120`             | Text on dark / light block |
| `primary-hover`             | `#1D4ED8`             | `#93C5FD`             | Primary hover              |
| `primary-active`            | `#1E40AF`             | `#2563EB`             | Primary active             |
| `primary-muted`             | `#EFF6FF`             | `#172554`             | Primary tint               |
| `success-bg` / `success-fg` | `#D1FAE5` / `#047857` | `#064E3B` / `#34D399` | Success badge              |
| `warning-bg` / `warning-fg` | `#FEF3C7` / `#92400E` | `#451A03` / `#FCD34D` | Warning badge              |
| `error-bg` / `error-fg`     | `#FEE2E2` / `#B91C1C` | `#450A0A` / `#FCA5A5` | Error badge                |
| `info-bg` / `info-fg`       | `#DBEAFE` / `#1D4ED8` | `#1E3A8A` / `#93C5FD` | Info badge                 |
| `focus-ring`                | `#2563EB`             | `#60A5FA`             | `:focus-visible` outline   |

Rules:

1. Do not use raw hex in components when a semantic class exists.
2. Status colours are always used as a pair (`bg-<x>-bg` with `text-<x>-fg`) so
   contrast holds.
3. Keep the `light` and `dark` values in step — every token has both.

## Typography

- Sans: **Inter** (the product and brand typeface), loaded with `next/font` and
  exposed as `--font-sans` / `font-sans`, with a system sans-serif fallback.
- Monospace: **JetBrains Mono**, loaded with `next/font` and exposed as
  `--font-mono` / `font-mono`, for hashes, job ids, dtypes, and metrics at
  `text-sm`.

Scale: `text-xs` helper, `text-sm` body, `text-xl` / `text-2xl` section
headings, `text-3xl` page/hero headings.

## Spacing

Use the Tailwind scale: page padding `p-4 md:p-8`, card `p-6`, stack `gap-4`.

## Radius and shadow

Use DaisyUI defaults (`rounded-box`, `shadow`, `shadow-sm`). Cards for upload,
mapping, and metrics. Radius is configured once in the themes
(`--radius-selector`, `--radius-field`, `--radius-box`).
