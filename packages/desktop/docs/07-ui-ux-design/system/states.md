# SML — States

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

## Global states

See [`FEATURE-08`](../../02-features/FEATURE-08-UI-States-Global.md). Every
screen implements:

| State            | Treatment                                               |
| ---------------- | ------------------------------------------------------- |
| loading          | DaisyUI `loading` spinner or `skeleton`; disable submit |
| empty            | Illustrated empty state + CTA                           |
| validation-error | Field-level `text-error` + summary alert                |
| network-error    | `ApiAlert` with retry                                   |
| unexpected-error | `ApiAlert`; never dump the raw exception                |
| success          | Inline confirmation or toast, then navigate             |

## Job states

| Job status | Badge   | User copy                |
| ---------- | ------- | ------------------------ |
| queued     | warning | Waiting for worker       |
| validating | warning | Checking CSV and mapping |
| training   | warning | Fitting model            |
| evaluating | warning | Scoring hold-out split   |
| exporting  | warning | Writing ONNX             |
| completed  | success | Ready to download        |
| failed     | error   | Use `error.message`      |

Polling uses TanStack Query `refetchInterval`, which stops on a terminal status.
