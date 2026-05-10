# UOW-06 NFR Design Patterns

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: NFR Design

## Purpose

This design translates UOW-06 NFR Requirements into implementation patterns for date control, overdue and aging evaluation, penalty runs, penalty application, duplicate prevention, waiver idempotency, reminder suppression, fail-closed validation, decimal-safe calculation, authorization, observability, frontend accessibility, and property-based testing.

## Date Control Pattern

| Aspect | Design |
|---|---|
| Financial date input | Commands and queries that evaluate overdue, aging, penalties, waivers, or reminders require explicit `evaluationDate` or waiver effective date. |
| Timezone | Normalize dates and period keys using the HOA business timezone. |
| First overdue date | Compute as the first calendar date after `dueDate + resolvedGracePeriodDays`. |
| Aging day count | For overdue invoices, compute `evaluationDate - firstOverdueDate + 1` in whole HOA business-calendar days. |
| Prohibition | Server clock is not a financial control date. |

The DateControlPolicy is a shared dependency of overdue evaluation, aging classification, penalty candidate generation, penalty application, waiver validation, and reminder eligibility.

## Overdue And Aging Query Pattern

| Aspect | Design |
|---|---|
| Query model | Server-side paginated query model for overdue and aging list/detail screens. |
| Source facts | Resolve UOW-04 invoice facts and UOW-05 payment, allocation, credit, reversal, correction, waiver, and balance-impact facts. |
| Fields | Return first overdue date, aging day count, bucket key, delinquent amount, and safe source references. |
| Performance | Use indexed evaluation, billing account, property, invoice, and status fields. |
| Prohibition | Browser must not load all records or calculate authoritative aging locally. |

The query model is derived from source facts. It must not persist one mutable delinquency flag as the source of truth.

## Penalty Run Pattern

| Aspect | Design |
|---|---|
| Run model | Reviewed PenaltyRun generates deterministic candidates before financial records are applied. |
| Candidate inputs | Invoice facts, open amount facts, evaluation date, first overdue date, period key, UOW-03 rule references, basis amount, excluded amounts, and calculated amount. |
| Candidate output | Per-candidate success, warning, or blocking error detail. |
| Execution posture | Supports background-capable candidate generation for monthly runs. |
| Application boundary | Candidate generation does not create applied penalty source records. |

This pattern separates reviewable eligibility from financial mutation. Staff can inspect candidates and blocking issues before applying selected valid penalties.

## Penalty Application Transaction Pattern

| Step | Design |
|---|---|
| Revalidation | Revalidate eligibility, duplicate-blocking status, rule references, basis amount, amount calculation, and actor authorization. |
| Transaction boundary | One penalty application transaction per penalty source record. |
| Writes | Create penalty source record, penalty-side balance-impact fact, and audit references where practical. |
| Batch behavior | Batch apply executes selected candidates with per-candidate results. |
| Partial failure | Do not commit partial financial source records for a failed penalty. |

This pattern avoids batch-wide rollback for unrelated penalty candidates while preserving atomicity for each applied penalty.

## Duplicate Penalty Guard Pattern

| Aspect | Design |
|---|---|
| Duplicate key | Invoice, responsible billing account, penalty charge type, and penalty period. |
| Blocking statuses | `Draft`, `Applied`, and `Reissued`. |
| Historical status | `Voided` remains in history but does not block linked correction or reissue. |
| Guard layers | Service guard plus database-backed partial unique or indexed constraint. |
| Replacement | Correction or reissue requires actor, reason, prior source record, replacement record where applicable, audit, and correlation ID. |

The duplicate guard is mandatory. Reports must not be used as the first line of defense against duplicate penalties.

## Waiver Idempotency Pattern

| Aspect | Design |
|---|---|
| Command | Approval-backed waiver command. |
| Idempotency key | Stable key from approval request and target penalty source record. |
| Persistence | Unique persistence constraint on idempotency key. |
| Replay behavior | Reprocessing the same approved waiver command returns or references the existing waiver source record. |
| Financial impact | Duplicate waiver balance-impact facts are prohibited. |

Waiver approval must not directly update the original penalty source record. It creates linked waiver source records and balance-impact facts.

## Reminder Suppression And Intent Pattern

| Aspect | Design |
|---|---|
| Eligibility | ReminderEligibility service evaluates overdue amount, contact path, suppression rules, duplicate period, and reminder scope. |
| Suppression source | Use configured suppression rules when available. |
| MVP defaults | Suppress duplicate reminders for the same scope and period and suppress when no authorized notification contact path exists. |
| Intent persistence | Persist eligibility snapshot and reminder intent through UOW-01 support contracts. |
| Boundary | UOW-08 owns rendering, SMTP delivery, storage, retries, and downloads. |

UOW-06 must not send email directly. Reminder intent failure must not mutate penalty or waiver source records.

## Fail-Closed Validation Pattern

| Dependency | Validation |
|---|---|
| UOW-03 | Resolve grace-period, penalty charge, charge type, rounding, aging bucket, and suppression configuration primitives. |
| UOW-04 | Resolve issued invoice, due date, invoice status, billing account, property, and invoice scope facts. |
| UOW-05 | Resolve payment, allocation, credit, reversal, correction, waiver, and balance-impact facts required for open amount and delinquency derivation. |

The validation gateway returns typed success or safe failure codes. Overdue finalization, penalty application, waiver approval, and reminder intent creation are blocked when required source facts are unresolved or ambiguous.

## Decimal And Amount Pattern

| Aspect | Design |
|---|---|
| Calculation policy | Central penalty calculation policy for basis, exclusions, penalty amount, waiver amount, delinquent amount, and balance-impact facts. |
| Representation | Integer minor units or validated decimal representations. |
| Prohibition | No JavaScript floating point for financial amount logic. |
| Determinism | Penalty basis excludes prior penalties, waivers, reminder fees, and penalty-on-penalty amounts. Waiver impacts are reproducible from source records. |

## Security And Authorization Pattern

| Aspect | Design |
|---|---|
| Actor context | Use UOW-01 actor context for every command and query. |
| Route guards | Protect all UOW-06 API routes. |
| Object policy | Enforce penalty, waiver, delinquency, reminder, billing account, property, homeowner, and invoice scope checks server-side. |
| Approvals | Treasurer approval checks for waiver commands where required. |
| PII minimization | Board Member reads are read-only and PII-minimized. |
| Denials | Return safe denials and emit audit/security events. |

## Observability And Logging Pattern

| Signal | Design |
|---|---|
| Evaluation | Overdue evaluation, aging classification, candidate generation count and duration. |
| Penalty | Applied, voided, reissued, duplicate-blocked, and failed penalty events. |
| Waiver | Requested, approved, rejected, idempotent replay, and failed waiver events. |
| Reminder | Eligible, suppressed, intent-created, and support intent events. |
| Security | Denied access and unsafe attempt events. |

Logs use safe identifiers and redacted payloads. Full homeowner PII, full reminder payloads, email recipient payloads, sensitive contact data, and complete delinquency payloads must not be logged.

## Frontend NFR Pattern

| Aspect | Design |
|---|---|
| Data loading | Server-authorized data only. |
| Lists | Paginated tables with filters and server-side sorting. |
| Accessibility | Keyboard-accessible overdue, aging, penalty, waiver, delinquency, and reminder workflows. |
| Validation | Safe validation summaries distinguish blocking errors, duplicate warnings, approval requirements, suppression reasons, and safe failure reasons. |
| Testability | Stable `data-testid` values from Functional Design. |
| State clarity | Penalty, waiver, aging, delinquency, and reminder states are visually distinct. |
| Prohibition | Normal staff workflows must not use JSON-only editing. |

## PBT Design Pattern

| Property Area | Design |
|---|---|
| Generators | Centralized `fast-check` generators for evaluation dates, aging bucket definitions, penalty basis facts, duplicate keys, waiver commands, reminder scopes, and balance-impact facts. |
| State models | Model overdue evaluation, aging classification, penalty application, waiver approval, reminder suppression, and source-record transitions. |
| Replay | Capture failing seeds for regression tests. |
| Shrinking | Use shrinkable domain generators to minimize date and financial counterexamples. |
| Invariants | Overdue boundaries, aging bucket membership, duplicate penalty prevention, non-compounding basis exclusion, partial-payment basis, waiver limits, waiver idempotency, reminder duplicate suppression, and balance-impact conservation. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Design patterns require backend authorization, object/scope checks, approvals, audit/security events, safe logging, PII minimization, and support boundaries. |
| Property-Based Testing | Compliant | PBT pattern defines central generators, state models, seed replay, shrinking, and UOW-06 date and financial invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
