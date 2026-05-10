# UOW-04 Tech Stack Decisions

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: NFR Requirements

## Stack Posture

UOW-04 continues the existing TypeScript, NestJS, Next.js, Prisma, PostgreSQL, Zod, and `fast-check` stack. No new dependency family is introduced at NFR Requirements stage. A distributed workflow engine, separate search database, external cache, or PDF/email implementation dependency is not justified for first-scope UOW-04.

## Decisions

| Decision ID | Decision |
|---|---|
| UOW04-STACK-001 | Use TypeScript for shared domain contracts, API code, frontend code, and tests. |
| UOW04-STACK-002 | Use NestJS for UOW-04 API controllers, application services, authorization integration, and transaction orchestration. |
| UOW04-STACK-003 | Use Next.js and React for UOW-04 staff and homeowner-safe invoice screens. |
| UOW04-STACK-004 | Use Prisma with PostgreSQL for UOW-04 persistence, migrations, constraints, and indexed queries. |
| UOW04-STACK-005 | Use Zod for request schemas and shared input validation. |
| UOW04-STACK-006 | Use shared TypeScript domain validators for lifecycle, duplicate prevention, issuance, manual line, and calculation validation. |
| UOW04-STACK-007 | Use existing UOW-01 authorization, approval, audit, safe-error, support-intent, and logging contracts. |
| UOW04-STACK-008 | Use existing UOW-02 billable validation and master-data read contracts. |
| UOW04-STACK-009 | Use existing UOW-03 typed resolution DTOs for rate, cycle, due date, rounding, charge type, numbering, and template metadata. |
| UOW04-STACK-010 | Use `fast-check` for UOW-04 property-based tests. |

## Database Decisions

| Area | Decision |
|---|---|
| Invoice persistence | Use typed PostgreSQL tables for invoices, invoice lines, batches, exceptions, snapshots, number assignments, lifecycle actions, open-amount input facts, and support intents. |
| Duplicate prevention | Use database-backed unique constraints or indexes for recurring invoice duplicate keys, with explicit replacement or reissue workflow paths. |
| Numbering concurrency | Use PostgreSQL transaction controls and row-level or advisory locking where needed for issued invoice number assignment. |
| Query performance | Use indexes for lifecycle/status, billing period, property/account, responsible homeowner, batch, and issued invoice number lookups. |
| Snapshot metadata | Use structured columns for core facts and bounded JSON only for snapshot metadata that does not justify separate typed columns. |
| Search | Do not add a separate search engine for first-scope invoice lists. |

## Calculation Decisions

| Area | Decision |
|---|---|
| Decimal behavior | Use decimal-safe helpers and integer minor units or validated decimal representations. |
| Floating point | Do not use JavaScript floating point for invoice amount calculation. |
| Snapshot references | Preserve UOW-03 rate, lot area, rounding rules, and configuration version references on issued snapshots. |
| Totals | Enforce invoice total equals line totals after configured rounding behavior. |

## Reliability Decisions

| Area | Decision |
|---|---|
| Recurring generation | Staff-triggered generation supports up to 2,000 candidates in 60 seconds under normal conditions. |
| Retry safety | Recurring generation retries must not create duplicate invoices. |
| Issuance | Single-invoice issuance targets p95 under 2 seconds and returns per-invoice results for batch issuance. |
| Fail-closed behavior | Missing or ambiguous UOW-02/UOW-03 source facts block invoice creation or issuance. |
| Support intents | Document/email intent failure must not roll back valid issued invoices. |

## Security Decisions

| Area | Decision |
|---|---|
| Authorization | Backend route and object/scope authorization are mandatory for all reads and mutations. |
| Homeowner isolation | Homeowners can read only invoices tied to their authorized billing accounts, properties, or homeowner profile. |
| Board access | Board Member access is read-only and PII-minimized. |
| Approval | Issued void and reissue actions require Treasurer approval through UOW-01. |
| Logging | Structured logs may include safe identifiers, counts, and status but must exclude full PII, full invoice payloads, payment-like details, and recipient payloads. |

## Frontend Decisions

| Area | Decision |
|---|---|
| Accessibility | UOW-04 forms and tables are WCAG 2.2 AA-oriented. |
| Workflow usability | Batch review and issue workflows are keyboard-accessible and provide safe validation summaries. |
| Testability | Components use stable `data-testid` values. |
| Editing model | Normal staff workflows use structured forms and tables, not JSON-only editing. |
| Status display | UI separates UOW-04 lifecycle status from payment-derived status. |

## Rejected Alternatives

| Alternative | Reason Rejected |
|---|---|
| Distributed workflow engine for invoice generation | First-scope batch volume and frequency do not justify a new dependency family. |
| Separate invoice search database | Indexed PostgreSQL queries are sufficient for first-scope invoice review and detail screens. |
| JSON-only invoice persistence | Financial source records require typed constraints, indexes, and durable relationships. |
| Frontend-only authorization controls | Fails Security Baseline and homeowner isolation requirements. |
| Synchronous PDF rendering or SMTP delivery in UOW-04 | Violates UOW-04 boundary; UOW-08 owns rendering, storage, delivery, and retries. |
| JavaScript floating-point invoice calculation | Unsafe for financial amount calculation and violates precision requirements. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Stack decisions preserve backend authorization, audit, approval, safe logging, object isolation, and support-service boundaries. |
| Property-Based Testing | Compliant | Stack decisions retain `fast-check` for UOW-04 financial and lifecycle invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
