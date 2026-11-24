# Sports Tourney — Product Specification

Product strategy · Functional requirements · Architecture · Data model ·
Delivery roadmap

> This document is the product-strategy source. The normative implementation set
> is [`00`–`12`](#normative-documents). Where this document and the numbered
> documents disagree on implementation detail, the numbered documents govern.

## Normative documents

| #   | Document                                                 | Governs                                                      |
| --- | -------------------------------------------------------- | ------------------------------------------------------------ |
| 00  | [`00-overview.md`](00-overview.md)                       | Product vision and scope                                     |
| 01  | [`01-requirements.md`](01-requirements.md)               | Functional/non-functional requirements                       |
| 02  | [`02-features.md`](02-features.md)                       | User-visible behaviour                                       |
| 03  | [`03-user-stories.md`](03-user-stories.md)               | User goals and acceptance scenarios                          |
| 04  | [`04-architecture.md`](04-architecture.md)               | Module boundaries, request lifecycle, tenancy                |
| 05  | [`05-data-model.md`](05-data-model.md)                   | Schema, constraints, state transitions                       |
| 06  | [`06-api-specification.md`](06-api-specification.md)     | REST contract, status codes, error envelope                  |
| 07  | [`07-ui-ux-design.md`](07-ui-ux-design.md)               | UI tokens, layout, states, accessibility                     |
| 08  | [`08-tech-stack.md`](08-tech-stack.md)                   | Allowed technologies and dependency policy                   |
| 09  | [`09-testing-strategy.md`](09-testing-strategy.md)       | Test layers, fixtures, acceptance criteria                   |
| 10  | [`10-implementation-plan.md`](10-implementation-plan.md) | Phased delivery plan                                         |
| 11  | [`11-deployment.md`](11-deployment.md)                   | CI, Docker Compose, and cloud deployment                     |
| 12  | [`12-operations.md`](12-operations.md)                   | Operations: backup, monitoring, security, rollback, recovery |

---

## 1. Product vision

Sports Tourney is a hybrid application built with Next.js, Tauri, and
TypeScript, running on web, desktop, and mobile.

## 2. Target users

| Persona   | Primary need                     | Desired outcome                                  |
| --------- | -------------------------------- | ------------------------------------------------ |
| End user  | Use Sports Tourney on any device | Cross-platform access to sports tourney features |
| Developer | Build and extend Sports Tourney  | Reproducible development and deployment          |

## 3. Scope and priorities

- **P0** — Core platform: necessary for the first usable release.
- **P1** — Enhancement: important for a complete experience.

## 4. Functional requirements

See [`01-requirements.md`](01-requirements.md) for the complete FR
specification.

## 5. User journeys

### Journey A — Use Sports Tourney

Goal: complete a core workflow in Sports Tourney.

1. Open Sports Tourney.
2. Select a feature.
3. Complete the task.

Success metric: task completion rate.

## 6. Application structure

| Page     | Purpose           |
| -------- | ----------------- |
| Home     | Landing page      |
| Settings | App preferences   |
| Version  | Build information |

## 7. Technical architecture

See [`04-architecture.md`](04-architecture.md) for module boundaries and request
lifecycle.

## 8. Current implementation status

This snapshot reflects the repository state. It is intentionally separate from
the product vision above.

## 9. Non-functional requirements

See [`01-requirements.md`](01-requirements.md) for the complete NFR
specification.

## 10. Design and UX

See [`07-ui-ux-design.md`](07-ui-ux-design.md) for complete design
specifications.

## 11. Testing strategy

See [`09-testing-strategy.md`](09-testing-strategy.md) for complete testing
strategy.

## 12. Deployment

See [`11-deployment.md`](11-deployment.md) for the complete deployment strategy
and [`12-operations.md`](12-operations.md) for ongoing operations.

## 13. Contributing

See [`12-operations.md`](12-operations.md) for contributor guidelines.

## 14. License

See [LICENSE](LICENSE).
