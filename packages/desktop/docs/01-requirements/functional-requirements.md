# Functional Requirements

This document specifies the functional requirements for Simple Machine Learning
(SML), organised by capability. Each requirement carries a unique ID (`FR-###`),
a description, and a priority. IDs are grouped by capability block and are
intentionally sparse; gaps are reserved for future requirements within that
capability.

## Dataset Upload

| ID     | Requirement                                                                                       | Priority |
| ------ | ------------------------------------------------------------------------------------------------- | -------- |
| FR-001 | The system shall accept a CSV file upload with a header row.                                      | Must     |
| FR-002 | The system shall reject files that are empty, lack a header, or exceed the documented size limit. | Must     |
| FR-003 | The system shall persist the uploaded bytes on the artefact volume under a generated identifier.  | Must     |
| FR-004 | The system shall compute a SHA-256 content hash of the uploaded file.                             | Must     |
| FR-005 | The system shall infer column names and sample dtypes from the header and first N rows.           | Must     |
| FR-006 | The system shall return a `datasetId`, hash, column preview, row count estimate, and `createdAt`. | Must     |

**Acceptance criteria:**

- Upload endpoint: `POST /api/v1/datasets` (`multipart/form-data`, field
  `file`).
- On success, returns `201 Created` with
  `{ datasetId, sha256, filename, byteSize, columns[], rowCount, createdAt }`.
- On empty or invalid CSV, returns `400 Bad Request` with `VALIDATION_ERROR`.
- On oversized file, returns `413 Payload Too Large` with `UPLOAD_TOO_LARGE`.
- Stored path is never taken from the original filename; original name is
  metadata only.

**Rationale:** Upload is the entry point. Hashing enables reuse detection and
reproducibility. Generated paths prevent traversal.

**See also:** [`US-001`](../03-user-stories/US-001.md),
[`FEATURE-01`](../02-features/FEATURE-01-Dataset-Upload.md).

---

## Column Mapping

| ID     | Requirement                                                                                             | Priority |
| ------ | ------------------------------------------------------------------------------------------------------- | -------- |
| FR-010 | The system shall allow the user to select one or more feature columns as **X**.                         | Must     |
| FR-011 | The system shall require exactly one label column as **Y**.                                             | Must     |
| FR-012 | The system shall reject mappings where Y is also included in X.                                         | Must     |
| FR-013 | The system shall reject unknown column names (not present in the dataset header).                       | Must     |
| FR-014 | The system shall persist the mapping with the subsequent training job.                                  | Must     |
| FR-015 | The system shall require Y to be numeric for regression and categorical or discrete for classification. | Must     |

**Acceptance criteria:**

- Mapping is submitted with `POST /api/v1/jobs` as
  `{ datasetId, featureColumns, labelColumn, taskType, algorithmId, ... }`.
- Invalid mapping returns `400` with `INVALID_COLUMN_MAP` and field-level
  details.
- Regression with a non-numeric Y returns `400` with `INVALID_LABEL_TYPE`.

**Rationale:** Explicit X/Y mapping avoids silent wrong-target training.

**See also:** [`US-002`](../03-user-stories/US-002.md),
[`FEATURE-02`](../02-features/FEATURE-02-Column-Mapping.md).

---

## Model Selection

| ID     | Requirement                                                                                        | Priority |
| ------ | -------------------------------------------------------------------------------------------------- | -------- |
| FR-020 | The system shall expose a catalogue of allow-listed supervised algorithms.                         | Must     |
| FR-021 | The catalogue shall distinguish `classification` and `regression`.                                 | Must     |
| FR-022 | P0 algorithms shall be scikit-learn estimators that can export ONNX.                               | Must     |
| FR-023 | P1 algorithms may include TensorFlow/Keras models that export ONNX (and optional `.keras`).        | Should   |
| FR-024 | The system shall reject unknown `algorithmId` values.                                              | Must     |
| FR-025 | The system shall reject an algorithm that does not match the declared `taskType`.                  | Must     |
| FR-026 | The system shall apply documented default hyperparameters when the client omits `hyperparameters`. | Must     |

**Acceptance criteria:**

- Catalogue endpoint: `GET /api/v1/algorithms`.
- Each entry:
  `{ algorithmId, taskType, family, defaultHyperparameters, exports[] }` where
  `exports` always includes `onnx`.
- Unknown or mismatched algorithm returns `400` with `UNKNOWN_ALGORITHM` or
  `TASK_ALGORITHM_MISMATCH`.

**P0 sklearn catalogue (minimum):**

| algorithmId                    | taskType       |
| ------------------------------ | -------------- |
| `logistic_regression`          | classification |
| `random_forest_classifier`     | classification |
| `gradient_boosting_classifier` | classification |
| `linear_regression`            | regression     |
| `ridge_regression`             | regression     |
| `random_forest_regressor`      | regression     |

**P1 additions:** `svm_classifier`, `mlp_classifier`, `mlp_regressor`,
`keras_classifier`, `keras_regressor`.

**See also:** [`US-003`](../03-user-stories/US-003.md),
[`FEATURE-03`](../02-features/FEATURE-03-Model-Selection.md).

---

## Training Jobs

| ID     | Requirement                                                                                                                    | Priority |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| FR-030 | The system shall create a training job from a dataset, mapping, task type, and algorithm.                                      | Must     |
| FR-031 | The system shall return `202 Accepted` with `jobId` and status `queued` without blocking on fit.                               | Must     |
| FR-032 | The system shall run validation, fit, evaluation, and export on a worker process.                                              | Must     |
| FR-033 | Job status shall progress through `queued`, `validating`, `training`, `evaluating`, `exporting`, then `completed` or `failed`. | Must     |
| FR-034 | The system shall split data into train and test using a documented ratio and seed (default 0.2, seed 42).                      | Must     |
| FR-035 | Classification jobs shall return accuracy, precision, recall, and f1 (macro).                                                  | Must     |
| FR-036 | Regression jobs shall return rmse, mae, and r2.                                                                                | Must     |
| FR-037 | The system shall persist library versions used for the job.                                                                    | Must     |
| FR-038 | The system shall expose `GET /api/v1/jobs/{jobId}` for polling.                                                                | Must     |
| FR-039 | Failed jobs shall store a stable error code and a human-readable message (no stack traces in the UI).                          | Must     |
| FR-040 | The system shall reject a second mutation of a terminal job (no restart-in-place).                                             | Must     |

**Acceptance criteria:**

- `POST /api/v1/jobs` returns
  `{ jobId, status: "queued", datasetId, algorithmId, createdAt }`.
- Polling returns current `status`, optional `metrics`, optional `artefacts`,
  optional `error`.
- Terminal states: `completed`, `failed`.
- Duplicate create of a _new_ job is allowed (training is not idempotent on
  payload); clients may send `Idempotency-Key` to avoid double-submit from the
  UI.

**Rationale:** Fit can take seconds to minutes. Polling matches the local-only
topology without introducing Kafka.

**See also:** [`US-004`](../03-user-stories/US-004.md),
[`US-005`](../03-user-stories/US-005.md),
[`FEATURE-04`](../02-features/FEATURE-04-Training-Job.md).

---

## Model Export

| ID     | Requirement                                                                                     | Priority |
| ------ | ----------------------------------------------------------------------------------------------- | -------- |
| FR-050 | A successful job shall always write an ONNX file and an artefact row with `format = onnx`.      | Must     |
| FR-051 | The ONNX file shall load with the pinned ONNX runtime used in tests.                            | Must     |
| FR-052 | Sklearn jobs may write an optional `.pkl` when `exports` includes `pkl`.                        | Should   |
| FR-053 | Sklearn jobs may write an optional `.joblib` when `exports` includes `joblib`.                  | Should   |
| FR-054 | Keras jobs may write an optional `.keras` when `exports` includes `keras`.                      | Should   |
| FR-055 | `GET /api/v1/jobs/{jobId}/artefacts/{artefactId}` shall stream the file as an attachment.       | Must     |
| FR-056 | Artefact download for a missing or failed job shall return `404`.                               | Must     |
| FR-057 | The system shall never expose filesystem paths in API responses; only artefact ids and formats. | Must     |

**Acceptance criteria:**

- Completed job payload lists artefacts as
  `{ artefactId, format, filename, byteSize }`.
- `format` is one of `onnx`, `pkl`, `joblib`, `keras`.
- ONNX is present whenever `status = completed`.
- Optional formats are omitted (not null placeholders) when not produced.

**See also:** [`US-006`](../03-user-stories/US-006.md),
[`US-007`](../03-user-stories/US-007.md),
[`FEATURE-05`](../02-features/FEATURE-05-Model-Export.md).

---

## Job History

| ID     | Requirement                                                                              | Priority |
| ------ | ---------------------------------------------------------------------------------------- | -------- |
| FR-060 | The system shall list training jobs newest first.                                        | Must     |
| FR-061 | The list shall support limit/offset or cursor pagination (default 20, max 100).          | Must     |
| FR-062 | Each list item shall include jobId, status, algorithmId, taskType, createdAt, updatedAt. | Must     |
| FR-063 | The system shall allow deleting a job and its artefact files (local cleanup).            | Should   |

**Acceptance criteria:**

- `GET /api/v1/jobs?limit=&cursor=`
- `DELETE /api/v1/jobs/{jobId}` returns `204` and removes DB rows and files.

**See also:** [`US-009`](../03-user-stories/US-009.md),
[`FEATURE-06`](../02-features/FEATURE-06-Job-History.md).

---

## Health

| ID     | Requirement                                                                | Priority |
| ------ | -------------------------------------------------------------------------- | -------- |
| FR-070 | The backend shall serve `GET /healthz` (liveness) at the process root.     | Must     |
| FR-071 | The backend shall serve `GET /readyz` that checks PostgreSQL connectivity. | Must     |
| FR-072 | Compose healthchecks shall gate frontend, backend, and postgres readiness. | Must     |

**See also:** [`US-012`](../03-user-stories/US-012.md).

---

## Requirements Traceability

| Requirement | User Story             | Feature | Architecture           | Test                |
| ----------- | ---------------------- | ------- | ---------------------- | ------------------- |
| FR-001..006 | US-001, US-010         | F-001   | Backend upload, volume | test_dataset_upload |
| FR-010..015 | US-002                 | F-002   | Job create validation  | test_column_map     |
| FR-020..026 | US-003                 | F-003   | Algorithm catalogue    | test_algorithms     |
| FR-030..040 | US-004, US-005, US-011 | F-004   | Worker                 | test_train_job      |
| FR-050..056 | US-006, US-007         | F-005   | ONNX export            | test_onnx_export    |
| FR-060..063 | US-008, US-009         | F-006   | PostgreSQL jobs        | test_job_history    |
| FR-070..072 | US-012                 | —       | Compose                | test_health         |

**Cross-references:**

- Features: [`02-features.md`](../02-features.md)
- User stories: [`03-user-stories.md`](../03-user-stories.md)
- Architecture: [`04-architecture.md`](../04-architecture.md)
- API: [`06-api-specification.md`](../06-api-specification.md)
