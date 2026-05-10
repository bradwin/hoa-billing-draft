# UOW-05 NFR Requirements

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: NFR Requirements

## Scope

UOW-05 NFRs cover homeowner payment proof submission, staff proof review, payment posting, allocation, credits, receipts, reversals, corrections, balance-impact facts, support intents, and payment-side read models. UOW-05 creates financially material source records, so consistency, auditability, immutability, and deterministic arithmetic are higher priority than convenience shortcuts.

## Volume And Scalability

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-SCALE-001 | First-scope volume assumes up to 25 operational users and up to 2,000 properties. |
| UOW05-NFR-SCALE-002 | Payment proof volume is expected to be low-to-moderate daily volume with month-end spikes. |
| UOW05-NFR-SCALE-003 | Staff proof review, payment, receipt, credit, reversal, and correction views must use pagination, filters, and server-side sorting. |
| UOW05-NFR-SCALE-004 | UOW-05 must not require distributed payment-processing infrastructure for MVP. |

## Performance

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-PERF-001 | Homeowner proof metadata submission must complete within p95 1 second under first-scope load, excluding UOW-08 file upload or storage time. |
| UOW05-NFR-PERF-002 | Staff proof, payment, receipt, credit, reversal, and correction list/detail queries must complete within p95 500 ms for first-scope data. |
| UOW05-NFR-PERF-003 | Single-payment posting must complete within p95 2 seconds under first-scope load when source facts are available and valid. |
| UOW05-NFR-PERF-004 | Batch posting may process selected payments with per-payment success and failure results rather than all-or-nothing behavior across the whole batch. |
| UOW05-NFR-PERF-005 | Browser screens must not load full payment history, full receipt history, or full allocation history without pagination. |

## Transactionality And Consistency

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-TXN-001 | Payment posting must transactionally create payment, allocations, credit records where applicable, receipt, receipt number assignment, balance-impact facts, and audit references where practical. |
| UOW05-NFR-TXN-002 | If posting cannot create all required financial source records, the posting operation must fail without partial financial commits. |
| UOW05-NFR-TXN-003 | Allocation and credit application must revalidate eligible open amounts inside the posting or application transaction. |
| UOW05-NFR-TXN-004 | Payment reversal must create linked reversal records and equal-and-opposite balance-impact facts without deleting or overwriting original source records. |
| UOW05-NFR-TXN-005 | Corrections must create new linked source records and must not mutate original financial source records in place. |

## Concurrency

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-CONCURRENCY-001 | PostgreSQL transactions, unique constraints or indexes, and row-level or advisory locks must prevent duplicate posted payments under concurrent requests. |
| UOW05-NFR-CONCURRENCY-002 | Allocation operations must prevent over-allocation when multiple staff actions target the same invoice, line, component, credit, or payment concurrently. |
| UOW05-NFR-CONCURRENCY-003 | Credit application must prevent duplicate or excessive application of the same available credit. |
| UOW05-NFR-CONCURRENCY-004 | Payment reversal must be unique per posted payment and must not allow double reversal under concurrent approval execution. |
| UOW05-NFR-CONCURRENCY-005 | Receipt number assignment must be unique and transactionally protected. |

## Availability And Fail-Closed Behavior

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-AVAIL-001 | If UOW-02 homeowner, property, billing account, or authorization facts are missing or ambiguous, UOW-05 must fail closed. |
| UOW05-NFR-AVAIL-002 | If UOW-03 payment method, receipt numbering, rounding, or template metadata is missing or ambiguous, UOW-05 must fail closed. |
| UOW05-NFR-AVAIL-003 | If UOW-04 issued invoice or open-amount facts are missing or ambiguous, UOW-05 must not allocate, apply credit, reverse, or correct against those facts. |
| UOW05-NFR-AVAIL-004 | Failures must return safe reason-coded errors suitable for staff correction without exposing sensitive internals. |

## Security And Authorization

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-SEC-001 | All UOW-05 reads and mutations must be protected by backend route, role, and object/scope authorization. |
| UOW05-NFR-SEC-002 | Homeowners may access only proofs, payments, credits, receipts, and support-intent status tied to their authorized billing accounts, properties, homeowner profile, or submitted proofs. |
| UOW05-NFR-SEC-003 | Board Member access must be read-only and PII-minimized. Sensitive payment proof details may be masked or omitted unless explicitly permitted. |
| UOW05-NFR-SEC-004 | Reversals and corrections requiring Treasurer approval must use UOW-01 approval contracts. |
| UOW05-NFR-SEC-005 | Denied access, duplicate override attempts, reversal requests, correction requests, and sensitive mutations must create audit or security events through UOW-01 contracts. |
| UOW05-NFR-SEC-006 | Frontend filtering or hidden controls must not be treated as authorization. |

## Logging And Privacy

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-LOG-001 | Structured logs may include correlation ID, payment ID, proof ID, receipt ID, action, status, safe failure code, and aggregate counts. |
| UOW05-NFR-LOG-002 | Logs must not include full homeowner PII, full proof payloads, attachment contents, payment account details, complete receipt payloads, or email recipient payloads. |
| UOW05-NFR-LOG-003 | Safe errors must avoid leaking authorization details, internal query details, or sensitive payment evidence. |

## Precision And Determinism

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-PRECISION-001 | UOW-05 financial amount logic must use decimal-safe helpers, integer minor units, or validated decimal representations. |
| UOW05-NFR-PRECISION-002 | JavaScript floating point must not be used for payment, allocation, credit, receipt, reversal, or correction amount logic. |
| UOW05-NFR-PRECISION-003 | Allocation totals plus credit remainder must exactly equal posted payment amount after validated decimal handling. |
| UOW05-NFR-PRECISION-004 | Reversal balance-impact facts must be deterministic and reproducible from source records. |

## Durability And Retention

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-DURABILITY-001 | Payment, allocation, credit, receipt, reversal, correction, balance-impact, snapshot, approval reference, and audit reference records must be durable in PostgreSQL. |
| UOW05-NFR-DURABILITY-002 | UOW-05 source records must be included in encrypted backup and restore controls. |
| UOW05-NFR-DURABILITY-003 | Posted financial records must not be destructively deleted as a normal workflow. |
| UOW05-NFR-DURABILITY-004 | Financial source records, approvals, reasons, actor IDs, timestamps, correlation IDs, and audit references must be retained immutably according to platform retention posture. |

## Support Intent Reliability

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-SUPPORT-001 | UOW-05 records proof attachment references or intents and receipt document/email intents through UOW-01 support contracts. |
| UOW05-NFR-SUPPORT-002 | Proof attachment storage, receipt PDF rendering, file storage, SMTP delivery, retry workers, and document download behavior are owned by UOW-08. |
| UOW05-NFR-SUPPORT-003 | Support intent failure must not roll back a valid posted payment. |
| UOW05-NFR-SUPPORT-004 | Support intent status must be visible to authorized staff and homeowners without implying UOW-05 performs rendering, storage, or delivery. |

## Usability And Accessibility

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-UX-001 | UOW-05 frontend forms and tables must be WCAG 2.2 AA-oriented. |
| UOW05-NFR-UX-002 | Proof review, posting, allocation, credit, receipt, reversal, and correction workflows must be keyboard-accessible. |
| UOW05-NFR-UX-003 | Validation summaries must clearly distinguish blocking errors, duplicate warnings, approval requirements, and safe failure reasons. |
| UOW05-NFR-UX-004 | Frontend components must use stable `data-testid` values defined by Functional Design. |
| UOW05-NFR-UX-005 | Normal staff workflows must not require JSON-only editing. |
| UOW05-NFR-UX-006 | UI must visibly separate proof state, payment state, receipt state, credit state, reversal state, and correction state. |

## Observability

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-OBS-001 | UOW-05 must emit metrics or structured events for proof submitted, reviewed, rejected, cancelled, and posted. |
| UOW05-NFR-OBS-002 | UOW-05 must emit metrics or structured events for duplicate candidates, duplicate overrides, posting failures, allocation failures, and credit application failures. |
| UOW05-NFR-OBS-003 | UOW-05 must emit metrics or structured events for receipt numbering conflicts, reversal and correction requests, reversal and correction decisions, denied access, and support intent requests. |
| UOW05-NFR-OBS-004 | Observability data must be privacy-minimized according to logging rules. |

## Testing And PBT

| Requirement ID | Requirement |
|---|---|
| UOW05-NFR-TEST-001 | Example tests must cover proof state transitions, posting success and failure, duplicate review, automatic allocation, manual allocation, credit creation/application, receipt creation, reversal, correction, authorization, and support intent boundaries. |
| UOW05-NFR-TEST-002 | `fast-check` PBT must cover allocation conservation, open amount limits, credit remainder correctness, reversal restoration, receipt number uniqueness, duplicate payment keys, and source-record immutability. |
| UOW05-NFR-TEST-003 | Financial tests must assert that invalid or ambiguous source facts fail closed and do not create partial financial source records. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Requirements define backend authorization, homeowner isolation, PII minimization, approvals, audit/security events, safe logging, safe errors, retention, and support-intent boundaries. |
| Property-Based Testing | Compliant | Requirements mandate PBT for the central UOW-05 financial invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
