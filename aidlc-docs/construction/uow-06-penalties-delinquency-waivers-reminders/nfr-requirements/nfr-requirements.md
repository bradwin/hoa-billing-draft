# UOW-06 NFR Requirements

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: NFR Requirements

## Scope

UOW-06 NFRs cover overdue evaluation, aging classification, recurring non-compounding penalties, penalty waivers, delinquency facts, reminder eligibility, reminder intents, and penalty-side or waiver-side balance-impact facts. UOW-06 creates financially material source records, so date determinism, duplicate prevention, transactionality, auditability, immutability, and deterministic arithmetic are higher priority than convenience shortcuts.

## Volume And Scalability

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-SCALE-001 | First-scope volume assumes up to 25 operational users and up to 2,000 properties. |
| UOW06-NFR-SCALE-002 | UOW-06 must support monthly penalty and reminder runs with low-to-moderate daily staff review. |
| UOW06-NFR-SCALE-003 | Staff overdue, aging, penalty, waiver, delinquency, and reminder views must use pagination, filters, and server-side sorting. |
| UOW06-NFR-SCALE-004 | UOW-06 must not require distributed collections or event-streaming infrastructure for MVP. |

## Performance

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-PERF-001 | Overdue and aging protected list/detail queries must complete within p95 500 ms for first-scope data. |
| UOW06-NFR-PERF-002 | List/detail queries must use pagination, filters, server-side sorting, and indexed evaluation fields. |
| UOW06-NFR-PERF-003 | Browser screens must not load full overdue, aging, penalty, waiver, reminder, or delinquency history without pagination. |
| UOW06-NFR-PERF-004 | Monthly penalty candidate generation for up to 2,000 properties must complete within p95 30 seconds as a reviewed run or background-capable operation. |
| UOW06-NFR-PERF-005 | Penalty candidate generation must produce per-candidate success and error detail. |

## Transactionality And Consistency

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-TXN-001 | Applying a selected valid penalty candidate must transactionally create the penalty source record, balance-impact fact, and audit references where practical. |
| UOW06-NFR-TXN-002 | A single penalty application must not leave partial record sets. |
| UOW06-NFR-TXN-003 | Waiver approval must transactionally create the waiver source record, waiver balance-impact fact, approval linkage, and audit references where practical. |
| UOW06-NFR-TXN-004 | Reminder intent creation must persist eligibility snapshot, reminder scope, suppression result where applicable, support-intent reference, and audit references where practical. |
| UOW06-NFR-TXN-005 | Applied penalties and approved waivers must create new linked source records and must not mutate original financial source records in place. |

## Concurrency

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-CONCURRENCY-001 | PostgreSQL transactions, unique constraints or indexes, and row-level or advisory locks must prevent duplicate penalty source records under concurrent requests. |
| UOW06-NFR-CONCURRENCY-002 | Duplicate penalty constraints must account for invoice, responsible billing account, penalty charge type, penalty period, and duplicate-blocking statuses. |
| UOW06-NFR-CONCURRENCY-003 | Waiver approval must be idempotent by approval request and target penalty source record and must not create duplicate waiver impacts under concurrent or replayed requests. |
| UOW06-NFR-CONCURRENCY-004 | Reminder intent creation must prevent duplicate intents for the same reminder scope and reminder period under concurrent requests. |
| UOW06-NFR-CONCURRENCY-005 | Penalty reissue or correction workflows must revalidate prior source record status inside the transaction. |

## Availability And Fail-Closed Behavior

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-AVAIL-001 | If UOW-03 grace-period, penalty charge rule, charge type, rounding, or suppression configuration facts are missing or ambiguous, UOW-06 must fail closed for the affected operation. |
| UOW06-NFR-AVAIL-002 | If UOW-04 issued invoice, due date, invoice status, or invoice scope facts are missing or ambiguous, UOW-06 must fail closed. |
| UOW06-NFR-AVAIL-003 | If UOW-05 payment, allocation, credit, reversal, correction, or balance-impact facts are missing or ambiguous, UOW-06 must not finalize overdue evaluation, apply penalties, approve waivers, or create reminder intents against those facts. |
| UOW06-NFR-AVAIL-004 | Failures must return safe reason-coded errors suitable for staff correction without exposing sensitive internals. |

## Date And Time Determinism

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-DATE-001 | All overdue, aging, penalty, waiver, and reminder decisions must use explicit `evaluationDate` or waiver effective date. |
| UOW06-NFR-DATE-002 | The server clock must not be used as a financial control date. |
| UOW06-NFR-DATE-003 | Penalty period keys must be normalized using the HOA business timezone. |
| UOW06-NFR-DATE-004 | First overdue date and aging day-count semantics must be implemented exactly as defined in Functional Design. |
| UOW06-NFR-DATE-005 | Scheduled jobs must pass the job business date explicitly to UOW-06 services. |

## Precision And Determinism

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-PRECISION-001 | Penalty basis, penalty amount, waiver amount, delinquent amount, and balance-impact facts must use decimal-safe helpers, integer minor units, or validated decimal representations. |
| UOW06-NFR-PRECISION-002 | JavaScript floating point must not be used for UOW-06 financial amount logic. |
| UOW06-NFR-PRECISION-003 | Penalty basis must deterministically exclude prior penalties, waivers, reminder fees, and penalty-on-penalty amounts. |
| UOW06-NFR-PRECISION-004 | Waiver balance-impact facts must be deterministic and reproducible from source records. |

## Durability And Retention

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-DURABILITY-001 | Penalty source records, waiver requests, waiver source records, reminder eligibility, reminder intents, balance-impact facts, approval references, reasons, and audit references must be durable in PostgreSQL. |
| UOW06-NFR-DURABILITY-002 | UOW-06 source records must be included in encrypted backup and restore controls. |
| UOW06-NFR-DURABILITY-003 | Applied financial records must not be destructively deleted as a normal workflow. |
| UOW06-NFR-DURABILITY-004 | Financial source records, waiver approvals, reasons, actor IDs, timestamps, correlation IDs, duplicate/reissue links, reminder intent references, and audit references must be retained immutably according to platform retention posture. |

## Security And Authorization

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-SEC-001 | All UOW-06 reads and mutations must be protected by backend route, role, and object/scope authorization. |
| UOW06-NFR-SEC-002 | Homeowners may access only penalty, waiver, delinquency, and reminder status tied to their authorized billing accounts, properties, or homeowner profile. |
| UOW06-NFR-SEC-003 | Board Member access must be read-only and PII-minimized. |
| UOW06-NFR-SEC-004 | Waivers requiring Treasurer approval must use UOW-01 approval contracts. |
| UOW06-NFR-SEC-005 | Denied access, duplicate/reissue attempts, waiver requests and decisions, penalty application, reminder intent creation, and sensitive mutations must create audit or security events through UOW-01 contracts. |
| UOW06-NFR-SEC-006 | Frontend filtering or hidden controls must not be treated as authorization. |

## Logging And Privacy

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-LOG-001 | Structured logs may include correlation ID, source record IDs, action, status, safe failure code, counts, duplicate reason codes, and suppression reason codes. |
| UOW06-NFR-LOG-002 | Logs must not include full homeowner PII, full reminder payloads, email recipient payloads, sensitive contact data, or complete delinquency payloads. |
| UOW06-NFR-LOG-003 | Safe errors must avoid leaking authorization details, internal query details, or sensitive homeowner financial data. |

## Reminder Intent Reliability

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-REMINDER-001 | UOW-06 records reminder eligibility and reminder intents through UOW-01 support contracts. |
| UOW06-NFR-REMINDER-002 | Reminder rendering, SMTP delivery, file storage, retries, and document download behavior are owned by UOW-08. |
| UOW06-NFR-REMINDER-003 | Support failure must not mutate penalty or waiver source records. |
| UOW06-NFR-REMINDER-004 | Reminder suppression and intent status must be visible to authorized staff and homeowners without implying UOW-06 performs delivery. |

## Usability And Accessibility

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-UX-001 | UOW-06 frontend forms and tables must be WCAG 2.2 AA-oriented. |
| UOW06-NFR-UX-002 | Overdue review, penalty run, waiver, aging, delinquency, and reminder workflows must be keyboard-accessible. |
| UOW06-NFR-UX-003 | Validation summaries must clearly distinguish blocking errors, duplicate warnings, approval requirements, suppression reasons, and safe failure reasons. |
| UOW06-NFR-UX-004 | Frontend components must use stable `data-testid` values defined by Functional Design. |
| UOW06-NFR-UX-005 | Normal staff workflows must not require JSON-only editing. |
| UOW06-NFR-UX-006 | UI must visibly separate penalty state, waiver state, aging state, delinquency state, and reminder intent state. |

## Observability

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-OBS-001 | UOW-06 must emit metrics or structured events for overdue evaluations, aging classifications, and penalty candidate generation. |
| UOW06-NFR-OBS-002 | UOW-06 must emit metrics or structured events for penalties applied, voided, reissued, and blocked by duplicate checks. |
| UOW06-NFR-OBS-003 | UOW-06 must emit metrics or structured events for waiver requested, approved, rejected, and idempotent replay outcomes. |
| UOW06-NFR-OBS-004 | UOW-06 must emit metrics or structured events for reminder eligible, suppressed, intent-created, denied access, and support intent requests. |
| UOW06-NFR-OBS-005 | Observability data must be privacy-minimized according to logging rules. |

## Testing And PBT

| Requirement ID | Requirement |
|---|---|
| UOW06-NFR-TEST-001 | Example tests must cover overdue evaluation, aging classification, penalty candidate generation, penalty application, duplicate prevention, waiver approval, reminder suppression, reminder intent creation, authorization, and support-intent boundaries. |
| UOW06-NFR-TEST-002 | `fast-check` PBT must cover overdue boundary dates, aging bucket classification, penalty duplicate prevention, non-compounding basis exclusion, partial-payment penalty basis, waiver amount limits, waiver idempotency, reminder duplicate suppression, and balance-impact conservation. |
| UOW06-NFR-TEST-003 | Financial tests must assert that invalid or ambiguous source facts fail closed and do not create partial financial source records. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Requirements define backend authorization, homeowner isolation, PII minimization, approvals, audit/security events, safe logging, safe errors, retention, and support-intent boundaries. |
| Property-Based Testing | Compliant | Requirements mandate PBT for central UOW-06 date, duplicate, financial, waiver, reminder, and balance-impact invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
