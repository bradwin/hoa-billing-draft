# UOW-06 NFR Requirements Plan

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: NFR Requirements, Planning
- **Current Gate**: Waiting for NFR Requirements approval

## Purpose

Define the non-functional requirements and technology stack decisions for UOW-06 before NFR Design, Infrastructure Design, and Code Generation. UOW-06 creates financially material penalty, waiver, aging, delinquency, and reminder source facts. Ambiguity in date control, penalty duplicate prevention, non-compounding arithmetic, waiver idempotency, reminder suppression, auditability, and authorization is dangerous and must be resolved before implementation.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/business-logic-model.md` | Approved UOW-06 flows, source-record boundaries, penalty logic, waiver logic, reminder intent logic, and PBT candidates. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/business-rules.md` | Approved UOW-06 business rules for overdue, aging, penalties, duplicate prevention, waivers, reminders, access, and PBT. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/domain-entities.md` | UOW-06 overdue, aging, penalty, waiver, balance-impact, reminder eligibility, and reminder intent entities. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/frontend-components.md` | UOW-06 staff and homeowner frontend scope and stable test IDs. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Existing auth, authorization, audit, approval, support-intent, safe-error, logging, and shared kernel foundations. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Grace-period metadata, penalty charge rule references, charge types, and rounding rule references consumed by UOW-06. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/` | Issued invoice source records, due dates, invoice status, and invoice open-amount input facts consumed by UOW-06. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/` | Payment, allocation, credit, reversal, correction, and balance-impact facts consumed by UOW-06. |

## NFR Assessment Scope

### In Scope

- Performance targets for overdue evaluation, aging classification, penalty candidate review, penalty application, waiver review, reminder eligibility, and homeowner-safe delinquency reads.
- Scalability assumptions for first-scope HOA data volume and month-end penalty/reminder spikes.
- Transactional reliability for penalty application, duplicate prevention, waiver approval, balance-impact facts, reminder intent persistence, and audit.
- Concurrency controls for duplicate penalty blocking, penalty reissue, waiver idempotency, and duplicate reminder suppression.
- Availability and fail-closed behavior when UOW-03, UOW-04, or UOW-05 source facts are missing, stale, or ambiguous.
- Security and authorization requirements for staff, Treasurer, Board Member, and homeowner penalty/waiver/delinquency/reminder access.
- PII and financial data minimization for logs, errors, Board Member reads, reminder surfaces, and homeowner-safe views.
- Date/time determinism for `evaluationDate`, HOA business timezone, first overdue date, aging day count, and penalty period keys.
- Decimal precision and deterministic penalty/waiver/balance-impact arithmetic.
- Durability requirements for penalty source records, waiver source records, reminder intents, balance-impact facts, approval references, and audit references.
- Accessibility and usability requirements for staff penalty/waiver/reminder workflows and homeowner delinquency views.
- Observability requirements for overdue evaluation, penalty runs, duplicate blocks, waiver decisions, reminder suppression, denied access, and support intents.
- PBT and example-test requirements for UOW-06 financial and date invariants.

### Out of Scope

- NFR design patterns. These belong to NFR Design.
- Infrastructure topology and deployment mappings. These belong to Infrastructure Design.
- Application code, migrations, API handlers, and tests. These belong to Code Generation.
- Invoice creation, payment posting, statement/report/export generation, concrete file storage, document rendering, SMTP delivery, retry workers, and import processing.

## NFR Requirements Checklist

- [x] Read UOW-06 Functional Design artifacts.
- [x] Read NFR Requirements rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-06 NFR risks and stack decisions.
- [x] Create this NFR Requirements plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-requirements/nfr-requirements.md`.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-requirements/tech-stack-decisions.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Requirements completion message.

## Required NFR Requirements Artifacts

After this plan is answered and validated, generate:

- `nfr-requirements.md`
- `tech-stack-decisions.md`

## NFR Requirements Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What first-scope load should UOW-06 assume?

A) Same first-scope HOA posture as prior financial units: up to 25 operational users, up to 2,000 properties, monthly penalty/reminder runs, low-to-moderate daily staff review, and paginated list/detail screens (recommended)
B) Design immediately for multi-tenant national collections scale with distributed streaming
C) Defer load assumptions until Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What performance target should apply to overdue and aging list/detail queries?

A) Protected list/detail queries p95 under 500 ms for first-scope data, with pagination, filters, server-side sorting, indexed evaluation fields, and no full-table browser loads (recommended)
B) Load all overdue and aging history into the browser for staff convenience
C) No target until production data exists
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What performance target should apply to penalty candidate generation?

A) Generate first-scope monthly penalty candidates for up to 2,000 properties within p95 30 seconds as a reviewed run or background-capable operation, with per-candidate success/error detail (recommended)
B) Require synchronous sub-second generation for all properties
C) Allow unlimited runtime with no per-candidate detail
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What performance and reliability target should apply to applying penalties?

A) Applying selected valid penalty candidates must transactionally create penalty source records, balance-impact facts, and audit entries, with per-candidate results and no partial record sets for a single penalty (recommended)
B) Apply penalties best-effort and let staff fix missing balance facts later
C) Apply penalties only as comments with no financial source records
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What concurrency controls should protect duplicate penalties, waivers, and reminders?

A) Use PostgreSQL transactions, unique constraints/indexes, row-level or advisory locking where needed, and revalidation inside the transaction so duplicate penalties, duplicate waiver impacts, and duplicate reminder intents cannot occur under concurrent requests (recommended)
B) Rely on frontend disabling and staff procedures
C) Accept occasional duplicates and correct them in reports
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
How should UOW-06 handle missing or ambiguous UOW-03/UOW-04/UOW-05 source facts?

A) Fail closed with safe reason-coded errors; do not evaluate overdue state as final, apply penalties, approve waivers, or create reminder intents until source facts are valid and resolvable (recommended)
B) Use the closest available fact and warn staff later
C) Create placeholder penalty or reminder records for later cleanup
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What date/time determinism requirement should UOW-06 carry forward?

A) All overdue, aging, penalty, waiver, and reminder decisions use explicit `evaluationDate` or waiver effective date, HOA business timezone, normalized period keys, and documented first-overdue-day semantics; the server clock is not a financial control date (recommended)
B) Use the server clock for all date decisions
C) Allow each workflow to choose its own date semantics later
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What precision and arithmetic requirement should UOW-06 carry forward?

A) Use decimal-safe calculation helpers and integer minor units or validated decimal representations for penalty basis, penalty amount, waiver amount, delinquent amount, and balance-impact facts; never use JavaScript floating point for financial amount logic (recommended)
B) Use JavaScript number and round at display time
C) Store amounts as unvalidated strings
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What durability requirement should apply to UOW-06 financial and reminder source records?

A) Penalty source records, waiver requests, waiver source records, reminder eligibility/intents, balance-impact facts, approval references, reasons, and audit references must be durable in PostgreSQL and included in encrypted backup/restore controls (recommended)
B) Reconstruct penalty and waiver history from logs only
C) Store only current delinquent amount and discard source details
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What security model should UOW-06 use?

A) Backend route, role, object/scope authorization, homeowner isolation, Board Member read-only PII minimization, Treasurer approval for waivers where required, safe errors, and denial audit/security events through UOW-01 contracts (recommended)
B) Frontend role hiding is sufficient
C) Any authenticated staff user can apply penalties and waive them
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
How should sensitive delinquency, reminder, and penalty data be logged?

A) Structured logs may include correlation ID, source record IDs, action, status, safe failure code, counts, and duplicate/suppression reason codes, but must not log full homeowner PII, full reminder payloads, email recipient payloads, or sensitive contact data (recommended)
B) Log full homeowner and reminder payloads for debugging
C) Do not log penalty, waiver, or reminder operations at all
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What database/query approach should UOW-06 use?

A) PostgreSQL with typed source-record tables, indexed evaluation dates, billing account/property/invoice links, penalty period keys, duplicate-blocking statuses, waiver idempotency keys, reminder scope/period keys, and JSON only for bounded snapshots where structured columns are not justified (recommended)
B) Store penalties, waivers, and reminders only as JSON documents in one table
C) Add a separate search engine for delinquency lists immediately
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
How should reminder delivery reliability be handled?

A) UOW-06 records reminder eligibility and reminder intents through UOW-01 support contracts; UOW-08 owns rendering, SMTP delivery, storage, retries, and download behavior, and support failure must not mutate penalty or waiver source records (recommended)
B) UOW-06 directly renders and sends reminder emails synchronously
C) Exclude reminder intent state from UOW-06
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What validation stack should UOW-06 use?

A) Shared TypeScript domain validators plus Zod request schemas, aligned with existing shared-kernel and UOW-03/UOW-04/UOW-05 patterns (recommended)
B) Controller-only validation without shared domain helpers
C) Database constraints only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
What PBT requirement should UOW-06 implement later?

A) `fast-check` PBT for overdue boundary dates, aging bucket classification, penalty duplicate prevention, non-compounding basis exclusion, partial-payment penalty basis, waiver amount limits, waiver idempotency, reminder duplicate suppression, and balance-impact conservation (recommended)
B) PBT only for aging buckets
C) No PBT because staff reviews penalties
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What accessibility/usability requirement should apply to UOW-06 frontend screens?

A) WCAG 2.2 AA-oriented forms/tables, keyboard-accessible overdue review, penalty run, waiver, aging, delinquency, and reminder workflows, clear validation summaries, stable `data-testid` values, no JSON-only normal staff workflow, and visible separation of penalty, waiver, aging, delinquency, and reminder states (recommended)
B) Accessibility deferred until final portal work
C) JSON editor is sufficient for MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 17
What observability signals should UOW-06 produce?

A) Metrics/log events for overdue evaluations, aging classifications, penalty candidate generation, penalty applied/voided/reissued, duplicate penalty blocks, waiver requested/approved/rejected/idempotent replay, reminder eligible/suppressed/intent-created, denied access, and support intent requests (recommended)
B) Only generic API request metrics
C) No UOW-06-specific observability
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 18
What auditability and retention posture should UOW-06 use?

A) Financial source records, waiver approvals, reasons, actor IDs, timestamps, correlation IDs, duplicate/reissue links, reminder intent references, and audit references must be retained immutably according to the platform retention posture; destructive deletion is prohibited for applied financial records (recommended)
B) Allow staff to delete penalty and waiver history after correction
C) Retain only current delinquency flags and discard penalty history
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 19
What tech stack posture should UOW-06 use?

A) Continue the existing TypeScript monorepo stack: NestJS API, Prisma/PostgreSQL, shared TypeScript/Zod contracts, Next.js frontend, Jest and fast-check tests, and UOW-01 audit/approval/support contracts (recommended)
B) Introduce a separate collections microservice for UOW-06 immediately
C) Replace Prisma with raw SQL for all UOW-06 work
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Plan requires backend authorization, homeowner isolation, Board Member PII minimization, approval-backed waivers, denial audit, safe logging, support-intent boundaries, and retention. |
| Property-Based Testing | Compliant for planning | Plan requires PBT for overdue boundaries, aging buckets, duplicate penalties, non-compounding basis, partial payments, waiver limits/idempotency, reminder suppression, and balance-impact conservation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
