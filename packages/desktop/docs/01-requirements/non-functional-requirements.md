# Non-Functional Requirements

This document specifies the non-functional requirements (NFRs) for Simple
Machine Learning (SML). Each requirement carries a unique ID (`NFR-###`), a
description, and a target.

## Performance

| ID      | Requirement                                                                                                                  | Target |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| NFR-001 | Dataset upload validation and persist shall complete within 2 s (p95) for files ≤ 10 MiB.                                    | 2 s    |
| NFR-002 | `POST /api/v1/jobs` shall return within 300 ms (p95) after validation.                                                       | 300 ms |
| NFR-003 | `GET /api/v1/jobs/{jobId}` shall complete within 100 ms (p95).                                                               | 100 ms |
| NFR-004 | Sklearn P0 fits on the bundled sample CSV (≤ 5k rows, ≤ 20 features) shall complete within 60 s (p95) on a developer laptop. | 60 s   |
| NFR-005 | ONNX export for P0 sklearn models on the sample CSV shall complete within 15 s (p95).                                        | 15 s   |

**Rationale:** Job _acceptance_ is fast because training is asynchronous. Fit
time is bounded only for the documented sample; larger user CSVs may take longer
and must still update status.

**See also:** [`04-architecture.md`](../04-architecture.md),
[`06-api-specification.md`](../06-api-specification.md).

---

## Availability

| ID      | Requirement                                                                                         | Target |
| ------- | --------------------------------------------------------------------------------------------------- | ------ |
| NFR-010 | Local Compose shall start all three services to healthy within 90 s on a typical developer machine. | 90 s   |
| NFR-011 | Backend `/readyz` shall fail when PostgreSQL is unreachable.                                        | Must   |
| NFR-012 | A single-node Postgres is sufficient; multi-AZ is out of scope.                                     | Local  |

**Environment scoping:** All availability NFRs describe the **local Docker
Compose** profile. There is no production cloud profile in this release.

**See also:** [`11-deployment.md`](../11-deployment.md).

---

## Correctness and Durability

| ID      | Requirement                                                                                                          | Target |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------ |
| NFR-020 | Every `completed` job shall have exactly one ONNX artefact row and file.                                             | Must   |
| NFR-021 | Metrics JSON shall match the job `taskType` (classification vs regression).                                          | Must   |
| NFR-022 | Dataset bytes and artefact files shall survive container restart (named volumes).                                    | Must   |
| NFR-023 | Job rows shall be written before the worker starts fit (crash leaves `queued`/`validating`, never a silent success). | Must   |
| NFR-024 | SQL migrations shall be versioned and replayable.                                                                    | Must   |

**See also:** [`05-data-model.md`](../05-data-model.md).

---

## Security

| ID      | Requirement                                                                                     | Target |
| ------- | ----------------------------------------------------------------------------------------------- | ------ |
| NFR-030 | Upload body size shall be capped (default 10 MiB, configurable).                                | 10 MiB |
| NFR-031 | Stored filenames shall be generated UUIDs; user filenames are metadata only.                    | Must   |
| NFR-032 | Artefact download shall authorise by `jobId` + `artefactId` existence only (local single-user). | Must   |
| NFR-033 | Secrets shall not be committed; `.env.example` holds placeholders.                              | Must   |
| NFR-034 | CORS shall be restricted to the known frontend origin.                                          | Must   |
| NFR-035 | The API shall not unpickle user-supplied model files.                                           | Must   |
| NFR-036 | Algorithm ids shall be allow-listed; no dynamic `import` of user code.                          | Must   |

**Rationale:** Local-only does not justify path traversal, unbounded uploads, or
pickle of untrusted bytes.

**See also:**
[`04-architecture.md`](../04-architecture.md#9-security-boundaries).

---

## Scalability

| ID      | Requirement                                                               | Target |
| ------- | ------------------------------------------------------------------------- | ------ |
| NFR-040 | The local stack shall support one training worker (serial jobs) for MVP.  | 1      |
| NFR-041 | Concurrent job creates may queue; the worker processes one fit at a time. | Must   |

**Rationale:** Serial training keeps CPU/RAM predictable on a laptop. Horizontal
scale is a non-goal.

---

## Observability

| ID      | Requirement                                                         | Target |
| ------- | ------------------------------------------------------------------- | ------ |
| NFR-050 | Backend logs shall be structured JSON with `requestId` and `jobId`. | Must   |
| NFR-051 | Dataset row values shall not be logged at info level.               | Must   |
| NFR-052 | Job state transitions shall be logged (from → to).                  | Must   |

---

## Usability

| ID      | Requirement                                                                         | Target |
| ------- | ----------------------------------------------------------------------------------- | ------ |
| NFR-060 | Validation errors shall name the field and the rule that failed.                    | Must   |
| NFR-061 | The UI shall poll job status at a bounded interval (default 1 s, stop on terminal). | Must   |
| NFR-062 | Screens shall meet WCAG 2.1 AA for contrast and keyboard access.                    | AA     |

---

## Portability

| ID      | Requirement                                                      | Target |
| ------- | ---------------------------------------------------------------- | ------ |
| NFR-070 | ONNX opset and exporter versions shall be pinned and documented. | Must   |
| NFR-071 | A completed ONNX file shall load in the CI ONNX Runtime version. | Must   |

---

## Requirements Traceability

| NFR          | Architecture       | Test                   |
| ------------ | ------------------ | ---------------------- |
| NFR-001..005 | API + worker       | test_perf_bounds       |
| NFR-010..012 | Compose            | test_compose_health    |
| NFR-020..024 | Postgres + volume  | test_onnx_required     |
| NFR-030..036 | Upload + catalogue | test_upload_limits     |
| NFR-040..041 | Worker concurrency | test_serial_worker     |
| NFR-050..052 | Logging            | test_log_redaction     |
| NFR-070..071 | Exporters          | test_onnx_runtime_load |
