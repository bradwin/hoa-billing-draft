# UOW-05 Logical Components

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: NFR Design

## Component Summary

| Component | Responsibility |
|---|---|
| PaymentProofIntake | Submits and validates proof metadata, proof scope, and attachment references/intents. |
| PaymentValidationGateway | Resolves UOW-02, UOW-03, and UOW-04 source facts and returns typed success or safe failure codes. |
| DuplicatePaymentGuard | Evaluates duplicate-risk keys and duplicate override requirements. |
| PaymentPostingCoordinator | Orchestrates one-payment transaction for posting, allocations, credit, receipt, balance facts, and audit. |
| AllocationPolicy | Calculates automatic/manual allocation targets and validates allocation conservation. |
| CreditLedgerService | Creates credits, derives credit availability, and applies credits through linked facts. |
| ReceiptNumberAllocator | Allocates immutable receipt numbers with transactional locking and uniqueness. |
| ReceiptSnapshotWriter | Persists receipt snapshots and source references. |
| ReversalCoordinator | Executes approved payment reversals idempotently through linked reversal facts. |
| FinancialCorrectionService | Creates approved correction source records and balance-impact facts. |
| BalanceImpactPublisher | Writes payment-side balance-impact facts for later derived Account Balance views. |
| SupportIntentAdapter | Records proof attachment references/intents and receipt document/email intents through UOW-01 contracts. |
| AuthorizationPolicy | Enforces route, role, object/scope, homeowner, Board Member, and Treasurer approval rules. |
| AuditAdapter | Writes audit entries for sensitive actions and financial mutations. |
| ObservabilityAdapter | Emits redacted metrics and structured events. |
| FrontendInteraction | Defines server-authorized frontend behavior, validation summaries, accessibility, and stable test IDs. |
| PBTGenerators | Provides `fast-check` generators, state models, seed replay, and invariant checks. |

## Component Responsibilities

### PaymentProofIntake

| Responsibility | Detail |
|---|---|
| Validate proof metadata | Amount, payment date, payment method, reference requirement, homeowner, property, billing account, optional invoice targets. |
| Authorize submission | Uses AuthorizationPolicy and UOW-02 object facts. |
| Create proof | Creates `Submitted` proof records through server API. |
| Capture support reference | Records attachment reference or support intent, without storing files. |
| Emit observability | Emits proof submitted and validation failure events. |

### PaymentValidationGateway

| Dependency | Resolved Facts |
|---|---|
| UOW-02 | Homeowner, property, billing account, authorization scope. |
| UOW-03 | Payment method, proof-channel reference requirement, receipt numbering metadata, decimal/rounding metadata, template references. |
| UOW-04 | Issued invoice source records, invoice status, open-amount input facts, invoice targets. |

The gateway returns typed success or safe failure codes. It is used by proof intake, posting, allocation, credit application, reversal, and correction flows.

### DuplicatePaymentGuard

| Responsibility | Detail |
|---|---|
| Duplicate-risk key | Billing account, payment method, external reference, amount, and payment date. |
| Active proof filter | `Submitted` and `UnderReview`. |
| Posted payment filter | Non-reversed posted payments. |
| Override handling | Requires elevated actor, reviewed candidate IDs, reason, timestamp, correlation ID, and audit. |
| Persistence support | Uses indexed fields to keep review performant. |

### PaymentPostingCoordinator

| Transaction Step | Component |
|---|---|
| Resolve and revalidate facts | PaymentValidationGateway |
| Check duplicate risk | DuplicatePaymentGuard |
| Calculate allocations | AllocationPolicy |
| Create credit remainder | CreditLedgerService |
| Allocate receipt number | ReceiptNumberAllocator |
| Persist receipt snapshot | ReceiptSnapshotWriter |
| Publish balance impacts | BalanceImpactPublisher |
| Record support intents where requested | SupportIntentAdapter |
| Record audit | AuditAdapter |
| Emit metrics/events | ObservabilityAdapter |

The coordinator commits per payment. Batch posting loops over selected payments and returns per-payment results.

### AllocationPolicy

| Responsibility | Detail |
|---|---|
| Automatic ordering | Oldest eligible issued invoices by due date, issue date, then invoice number. |
| Component ordering | Penalties and fees, then dues or regular charges, then other manual charges. |
| Manual validation | Staff actor, reason, target eligibility, nonnegative open amounts, matching totals, audit context. |
| Concurrency safety | Recompute and validate open amounts inside transaction. |
| Conservation | Allocation totals plus credit remainder equals posted payment amount. |

### CreditLedgerService

| Responsibility | Detail |
|---|---|
| Create credit | Creates immutable credit source record for overpayment remainder. |
| Derive availability | Original credit minus linked applications and reversals/corrections. |
| Apply credit | Creates linked credit application record after transaction-time availability validation. |
| Preserve history | Never mutates original credit amount in place. |

### ReceiptNumberAllocator

| Responsibility | Detail |
|---|---|
| Resolve scope | Uses UOW-03 receipt numbering metadata. |
| Lock scope | Uses row-level or advisory locking per numbering scope. |
| Assign number | Assigns after posting validation succeeds. |
| Enforce uniqueness | Relies on unique constraint and conflict handling. |
| Preserve number | Receipt numbers are not reused after reversal. |

### ReceiptSnapshotWriter

| Responsibility | Detail |
|---|---|
| Snapshot payment facts | Payment ID, amount, payment date, posting date, method, reference. |
| Snapshot payer facts | Homeowner, billing account, and property where applicable. |
| Snapshot allocation | Allocation summary and credit remainder. |
| Snapshot configuration | Payment method, numbering, and template references. |
| Snapshot proof | Source proof reference where applicable. |

### ReversalCoordinator

| Responsibility | Detail |
|---|---|
| Verify approval | Uses UOW-01 approval result where required. |
| Enforce uniqueness | One reversal per posted payment. |
| Create reversal facts | Payment, allocation, receipt, credit effects where applicable. |
| Publish offset facts | Equal-and-opposite balance-impact facts. |
| Preserve original records | No delete or in-place overwrite. |

### FinancialCorrectionService

| Responsibility | Detail |
|---|---|
| Verify approval | Uses UOW-01 approval where required. |
| Link source | Links to payment, allocation, credit, receipt, or approved import/opening-balance owner input. |
| Create correction facts | Creates new source records and balance-impact facts. |
| Reject direct edits | Original financial source records remain immutable. |
| Audit | Records actor, reason, approval reference, timestamp, and correlation ID. |

### BalanceImpactPublisher

| Source | Published Fact |
|---|---|
| Payment | Payment-side balance impact. |
| Allocation | Invoice/component open amount reduction. |
| Credit | Credit creation impact. |
| CreditApplication | Credit application impact. |
| Reversal | Equal-and-opposite impact. |
| Correction | Approved correction impact. |

BalanceImpactPublisher does not own a mutable balance. UOW-07 later consumes derived balance views.

### SupportIntentAdapter

| Intent | Boundary |
|---|---|
| Proof attachment reference/intent | UOW-08 owns concrete file storage. |
| Receipt document intent | UOW-08 owns PDF rendering and storage. |
| Receipt email intent | UOW-08 owns SMTP delivery and retry behavior. |

Support intent failures are visible but do not invalidate posted payments.

### AuthorizationPolicy

| Actor | Enforcement |
|---|---|
| Homeowner | Own authorized billing accounts, properties, homeowner profile, submitted proofs, payments, credits, and receipts only. |
| Billing Staff | Proof review, posting, allocation, credit, receipt, and correction actions according to permission matrix. |
| Treasurer | Approval-sensitive reversal and correction actions according to permission matrix. |
| Board Member | Read-only and PII-minimized access. |
| System Administrator | Administrative access according to permission matrix and audit rules. |

### AuditAdapter

| Event Type | Examples |
|---|---|
| Proof lifecycle | Submit, review, reject, cancel, post. |
| Payment posting | Payment posted, allocation created, credit created, receipt created. |
| Duplicate review | Candidate reviewed, override accepted or denied. |
| Governance | Reversal requested/executed, correction requested/executed. |
| Security | Denied access and unsafe attempts. |

### ObservabilityAdapter

| Signal | Detail |
|---|---|
| Metrics | Counts, durations, conflict counts, failure codes. |
| Logs | Correlation ID, safe IDs, action, status, and safe failure code. |
| Redaction | No full PII, proof payloads, attachment contents, payment account details, or recipient payloads. |

### FrontendInteraction

| Surface | NFR Responsibility |
|---|---|
| Homeowner proof form | Server-authorized options, accessible fields, safe validation summaries. |
| Proof review | Paginated queues, duplicate warnings, review actions. |
| Posting workspace | Allocation preview, credit remainder preview, blocking validation summary. |
| Credit ledger | Derived availability, application workflow, history. |
| Receipt detail | Snapshot and support intent status. |
| Reversal/correction panels | Approval status, reason capture, linked source visibility. |

### PBTGenerators

| Generator/Model | Purpose |
|---|---|
| Payment amount generator | Valid decimal and edge-case amounts. |
| Allocation target generator | Invoice/component open amount combinations. |
| Credit availability model | Credit creation, application, and reversal. |
| Duplicate key generator | Duplicate-risk key behavior. |
| Receipt numbering model | Unique numbering under generated scopes. |
| Reversal command model | Idempotent reversal and balance restoration. |
| Source immutability model | Reject in-place mutations across generated transitions. |

## NFR Responsibility Mapping

| NFR Area | Primary Components |
|---|---|
| Performance | PaymentProofIntake, PaymentPostingCoordinator, AllocationPolicy, FrontendInteraction |
| Concurrency | PaymentPostingCoordinator, DuplicatePaymentGuard, AllocationPolicy, CreditLedgerService, ReceiptNumberAllocator, ReversalCoordinator |
| Durability | PaymentPostingCoordinator, ReceiptSnapshotWriter, BalanceImpactPublisher, AuditAdapter |
| Security | AuthorizationPolicy, AuditAdapter, FrontendInteraction |
| Privacy | AuthorizationPolicy, ObservabilityAdapter, FrontendInteraction |
| Precision | AllocationPolicy, CreditLedgerService, BalanceImpactPublisher, PBTGenerators |
| Observability | ObservabilityAdapter, AuditAdapter |
| Support boundaries | SupportIntentAdapter |
| Testing | PBTGenerators |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Components include authorization, audit, PII minimization, safe logging, support boundaries, and approval-sensitive actions. |
| Property-Based Testing | Compliant | PBTGenerators component defines financial invariant generators and state models. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
