# UOW-06 Tech Stack Decisions

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: NFR Requirements

## Technology Posture

UOW-06 continues the existing TypeScript modular monorepo stack. No separate collections microservice, distributed event stream, separate search engine, or raw-SQL-only implementation is introduced for MVP.

| Concern | Decision |
|---|---|
| API framework | Continue NestJS API modules and UOW-01 authorization, audit, approval, support-intent, logging, and safe-error contracts. |
| Persistence | Continue Prisma with PostgreSQL for typed penalty, waiver, reminder, and balance-impact source-record tables. |
| Shared contracts | Continue shared TypeScript domain helpers and Zod request schemas. |
| Frontend | Continue Next.js protected staff and homeowner routes with server-authorized data. |
| Testing | Continue Jest example tests and `fast-check` property-based tests. |
| Decimal handling | Continue decimal-safe helpers, integer minor units, or validated decimal representations; do not use JavaScript floating point for financial amount logic. |

## Database Decisions

| Area | Decision |
|---|---|
| Source records | Model penalties, waiver requests, waivers, reminder eligibility, reminder intents, and balance-impact facts as typed PostgreSQL-backed records. |
| Duplicate penalties | Use indexes or constraints over invoice, responsible billing account, penalty charge type, penalty period, and duplicate-blocking status. |
| Waiver idempotency | Use a stable key based on approval request and target penalty source record to prevent duplicate waiver records and duplicate waiver balance-impact facts. |
| Reminder suppression | Use indexes or constraints over reminder scope and reminder period to prevent duplicate reminder intents. |
| Query performance | Index evaluation dates, billing account, property, invoice, status, penalty period, waiver approval references, and reminder scope/period fields. |
| Snapshots | Use JSON only for bounded calculation, eligibility, suppression, or rule snapshots where structured columns are not justified. |

## Integration Decisions

| Dependency | Decision |
|---|---|
| UOW-01 | Use existing backend authentication, authorization, audit, approval, support-intent, structured logging, and safe-error contracts. |
| UOW-03 | Consume grace-period metadata, charge type, penalty charge rule references, rounding rule references, and reminder suppression configuration primitives. |
| UOW-04 | Consume issued invoice, invoice due date, invoice status, billing account, property, and open-amount input facts. |
| UOW-05 | Consume payment, allocation, credit, reversal, correction, and balance-impact facts for open amount, delinquency, penalty basis, and waiver validation. |
| UOW-07 | Supply source facts for later statements, reports, dashboards, and exports; UOW-06 does not generate report output. |
| UOW-08 | Supply reminder intents only; UOW-08 owns rendering, SMTP delivery, storage, retries, and document download behavior. |

## Validation Decisions

| Layer | Decision |
|---|---|
| Request validation | Use Zod schemas for API request and response validation. |
| Domain validation | Use shared TypeScript validators for overdue boundary dates, aging buckets, penalty basis, duplicate keys, waiver amount limits, idempotency keys, reminder suppression, and balance-impact conservation. |
| Persistence validation | Use PostgreSQL constraints and Prisma model constraints for uniqueness, required references, statuses, and idempotency. |
| Fail-closed behavior | Missing or ambiguous UOW-03, UOW-04, or UOW-05 facts must return safe reason-coded errors and must not create financial source records. |

## Security Decisions

| Area | Decision |
|---|---|
| Authorization | Enforce backend route, role, and object/scope authorization for every read and mutation. |
| Homeowner isolation | Restrict homeowner reads to authorized billing accounts, properties, or homeowner profile records. |
| Board Member access | Keep Board Member access read-only and PII-minimized. |
| Waiver approval | Use UOW-01 approval contracts for Treasurer approval where required. |
| Logging privacy | Log correlation IDs, source IDs, statuses, safe failure codes, and counts; do not log full homeowner PII, full reminder payloads, email recipient payloads, or sensitive contact data. |
| Audit | Audit penalty application, void/reissue, duplicate blocks and overrides, waiver requests and decisions, reminder intent creation, denied access, and support-intent requests. |

## Testing Decisions

| Test Type | Decision |
|---|---|
| Example tests | Cover concrete overdue, aging, penalty, duplicate, waiver, reminder, authorization, and support boundary scenarios. |
| Property-based tests | Use `fast-check` for overdue boundaries, aging bucket classification, duplicate prevention, non-compounding basis exclusion, partial-payment basis, waiver amount limits, waiver idempotency, reminder duplicate suppression, and balance-impact conservation. |
| Accessibility tests | Verify forms and tables expose labels, validation summaries, keyboard paths, and stable `data-testid` values. |
| Boundary tests | Verify UOW-06 does not create invoices, payments, receipts, reports, documents, emails, stored files, retry jobs, imports, or mutable account-balance source-of-truth records. |

## Rejected Options

| Option | Reason Rejected |
|---|---|
| Separate collections microservice for MVP | Adds operational and consistency complexity before first-scope load justifies it. |
| Distributed event streaming for penalty runs | Not required for up to 2,000 properties and monthly runs. |
| Raw SQL for all UOW-06 work | Unnecessary divergence from existing Prisma/PostgreSQL patterns; raw SQL can still be used surgically later if a measured query requires it. |
| JSON-only source records | Weakens constraints, indexing, auditability, and duplicate prevention for financial records. |
| UOW-06 direct SMTP/document handling | Violates UOW-08 boundary and couples financial validity to delivery side effects. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Decisions keep authorization, approval, audit, privacy-minimized logs, safe errors, and support boundaries in the established platform stack. |
| Property-Based Testing | Compliant | Decisions retain `fast-check` and require UOW-06 domain generators and property tests for the identified invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
