# UOW-05 Tech Stack Decisions

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: NFR Requirements

## Decision Summary

UOW-05 continues the existing TypeScript modular monorepo stack. No separate payment microservice, search engine, event streaming platform, or raw-SQL-only rewrite is introduced for MVP. The chosen stack is sufficient for the first-scope HOA volume and keeps financial correctness inside the established transaction, validation, audit, and approval patterns.

## Stack Decisions

| Area | Decision | Rationale |
|---|---|---|
| API runtime | NestJS in `apps/api` | Matches UOW-01 through UOW-04 and supports guarded routes, services, modules, and dependency injection. |
| Database | PostgreSQL | Required for transactional posting, row-level/advisory locking, unique receipt numbers, duplicate guards, and durable source records. |
| ORM | Prisma | Matches existing code generation posture and supports typed models, transactions, and schema-managed migrations. |
| Shared contracts | TypeScript shared package | Keeps payment, allocation, credit, receipt, reversal, correction, and error contracts consistent across API and web. |
| Request validation | Zod schemas plus shared domain validators | Preserves existing validation style and enables API and frontend reuse. |
| Frontend | Next.js in `apps/web` | Matches existing protected shell and supports staff/homeowner UOW-05 workflows. |
| Tests | Jest and `fast-check` | Provides example tests and PBT coverage for financial invariants. |
| Audit and approval | UOW-01 contracts | Keeps reversal, correction, duplicate override, and sensitive mutation governance centralized. |
| Support services | UOW-01 support contracts, UOW-08 concrete implementation later | Keeps proof storage, receipt PDF rendering, email delivery, retries, and downloads out of UOW-05. |

## Database Posture

| Decision | Detail |
|---|---|
| Typed source-record tables | Payment proofs, payments, allocations, credits, credit applications, receipts, receipt snapshots, reversals, corrections, balance-impact facts, and support intents should be structured tables. |
| Indexing | Index proof/payment/receipt statuses, billing account links, property links, homeowner links, invoice links, duplicate-risk fields, receipt numbers, reversal links, and correction source links. |
| Uniqueness | Enforce unique receipt numbers and one effective reversal per posted payment. |
| JSON usage | Use JSON only for bounded snapshot metadata where structured columns are not justified. |
| Transactions | Posting, receipt numbering, allocation, credit creation/application, reversal, and correction writes require explicit transactional boundaries. |

## Precision Posture

| Decision | Detail |
|---|---|
| Amount representation | Use integer minor units or validated decimal strings through shared helpers. |
| Arithmetic | Use decimal-safe helper functions for allocation totals, credit remainder, reversal facts, and correction amounts. |
| Prohibited approach | Do not use JavaScript floating point for financial amount logic. |

## Security Posture

| Decision | Detail |
|---|---|
| Authorization | Backend route, role, and object/scope checks are mandatory for all UOW-05 reads and mutations. |
| Homeowner isolation | Homeowners see only records tied to their authorized billing accounts, properties, homeowner profile, or submitted proofs. |
| Board Member access | Read-only and PII-minimized. |
| Approval controls | Treasurer approval is required for reversal and correction actions where the business rules require approval. |
| Safe logging | Logs must omit full PII, full proof payloads, attachment contents, payment account details, and recipient payloads. |

## Reliability Posture

| Decision | Detail |
|---|---|
| Fail-closed validation | Missing or ambiguous UOW-02, UOW-03, or UOW-04 facts block posting, allocation, receipt creation, credit application, reversal, and correction. |
| Support intent isolation | Support failures do not roll back valid posted payments. |
| Backup/restore | UOW-05 durable source records must be covered by encrypted backup and restore controls. |
| Retention | Posted financial records and audit-linked facts are retained immutably according to platform retention posture. |

## Alternatives Rejected

| Alternative | Reason Rejected |
|---|---|
| Separate payment microservice immediately | Adds distributed consistency and operational complexity without first-scope need. |
| Event streaming as primary payment backbone | Not required for low-to-moderate HOA volume and increases reconciliation risk for MVP. |
| Raw SQL for all UOW-05 work | Prisma plus targeted transaction/locking patterns is sufficient; raw SQL can be reserved later for narrow constraints if needed. |
| JSON-only payment storage | Weakens queryability, constraints, duplicate detection, and audit-grade source-record integrity. |
| Direct file/PDF/email implementation in UOW-05 | Violates support boundary; UOW-08 owns concrete storage, rendering, delivery, and retries. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Stack decisions preserve backend authorization, safe logging, audit, approvals, support boundaries, and immutable financial retention. |
| Property-Based Testing | Compliant | Stack decisions include Jest and `fast-check` for UOW-05 financial invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
