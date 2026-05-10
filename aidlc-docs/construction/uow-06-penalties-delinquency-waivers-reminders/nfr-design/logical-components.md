# UOW-06 Logical Components

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: NFR Design

## Component Summary

| Component | Responsibility |
|---|---|
| DateControlPolicy | Normalizes explicit dates, HOA business timezone, first overdue date, aging day count, and penalty/reminder period keys. |
| OverdueEvaluationService | Derives overdue status from invoice, grace period, open amount, and evaluation date facts. |
| AgingClassifier | Maps overdue day counts to configured or default aging buckets. |
| PenaltyRuleResolver | Resolves UOW-03 penalty charge, charge type, grace-period, rounding, and suppression configuration primitives. |
| PenaltyRunCoordinator | Generates reviewed penalty candidates and per-candidate result details. |
| DuplicatePenaltyGuard | Enforces duplicate penalty prevention through service checks and database-backed uniqueness. |
| PenaltyApplicationCoordinator | Applies selected penalties transactionally with balance-impact facts and audit. |
| WaiverCoordinator | Executes approval-backed, idempotent waiver commands and linked waiver impacts. |
| ReminderEligibilityService | Evaluates reminder eligibility, suppression, contact path, scope, and period. |
| ReminderIntentAdapter | Persists reminder intents through UOW-01 support contracts without delivery side effects. |
| ValidationGateway | Resolves UOW-03, UOW-04, and UOW-05 facts and returns typed success or safe failure codes. |
| AmountCalculationPolicy | Performs decimal-safe penalty, waiver, delinquency, and balance-impact calculations. |
| BalanceImpactPublisher | Writes penalty-side and waiver-side balance-impact facts for later derived Account Balance views. |
| AuthorizationPolicy | Enforces route, role, object/scope, homeowner, Board Member, and Treasurer approval rules. |
| AuditAdapter | Writes audit entries for sensitive actions and financial mutations. |
| ObservabilityAdapter | Emits redacted metrics and structured events. |
| FrontendInteraction | Defines server-authorized frontend behavior, validation summaries, accessibility, and stable test IDs. |
| PBTGenerators | Provides `fast-check` generators, state models, seed replay, and invariant checks. |

## Component Responsibilities

### DateControlPolicy

| Responsibility | Detail |
|---|---|
| Require explicit date | Reject missing `evaluationDate` or waiver effective date for financial decisions. |
| Normalize timezone | Use HOA business timezone for date and period-key calculations. |
| Compute first overdue date | First calendar date after `dueDate + resolvedGracePeriodDays`. |
| Compute aging day count | `evaluationDate - firstOverdueDate + 1` for overdue invoices. |
| Reject server clock | Server time is not a financial control date. |

### OverdueEvaluationService

| Responsibility | Detail |
|---|---|
| Resolve source facts | Uses ValidationGateway for UOW-03, UOW-04, and UOW-05 facts. |
| Evaluate overdue | Issued, non-voided invoice; evaluation date after grace boundary; positive open amount. |
| Return safe result | Returns overdue state, first overdue date, open amount, source references, or safe failure code. |
| Preserve derivation | Does not persist a mutable overdue flag as source of truth. |

### AgingClassifier

| Responsibility | Detail |
|---|---|
| Resolve buckets | Uses configured aging bucket definitions or MVP defaults. |
| Classify | Maps aging day count to exactly one bucket. |
| Compute delinquency | Uses remaining unpaid open amount after approved waivers and payment effects. |
| Support queries | Supplies paginated list/detail query data. |

### PenaltyRuleResolver

| Dependency | Resolved Facts |
|---|---|
| UOW-03 | Grace period, penalty charge type, penalty charge rule, rounding rule, aging bucket configuration, and suppression configuration. |
| UOW-04 | Invoice due date, issue status, property, billing account, invoice scope, and invoice source facts. |
| UOW-05 | Open amount, allocation, credit, reversal, correction, waiver, and balance-impact facts. |

The resolver supplies configuration primitives only. UOW-06 owns eligibility, calculation, source records, and balance-impact facts.

### PenaltyRunCoordinator

| Responsibility | Detail |
|---|---|
| Generate candidates | Builds deterministic candidates from source facts and evaluation date. |
| Snapshot metadata | Captures rule references, basis amount, exclusions, calculated amount, period key, and source references. |
| Record result detail | Returns per-candidate valid, warning, or blocked status. |
| Background capable | Supports long-running first-scope monthly generation without immediate financial mutation. |

### DuplicatePenaltyGuard

| Responsibility | Detail |
|---|---|
| Duplicate key | Invoice, responsible billing account, penalty charge type, and penalty period. |
| Blocking statuses | `Draft`, `Applied`, and `Reissued`. |
| Historical status | `Voided` records remain visible and do not block linked reissue/correction. |
| Persistence support | Uses database-backed unique or indexed constraints. |
| Conflict behavior | Returns stable safe duplicate failure codes. |

### PenaltyApplicationCoordinator

| Transaction Step | Component |
|---|---|
| Normalize dates | DateControlPolicy |
| Resolve and validate facts | ValidationGateway and PenaltyRuleResolver |
| Check duplicates | DuplicatePenaltyGuard |
| Calculate amount | AmountCalculationPolicy |
| Publish balance impact | BalanceImpactPublisher |
| Record audit | AuditAdapter |
| Emit metrics/events | ObservabilityAdapter |

The coordinator commits per penalty. Batch apply loops over selected candidates and returns per-candidate results.

### WaiverCoordinator

| Responsibility | Detail |
|---|---|
| Verify approval | Uses UOW-01 approval result where required. |
| Enforce idempotency | Stable key from approval request and target penalty source record. |
| Validate amount | Waiver amount cannot exceed available unpaid penalty amount. |
| Create waiver facts | Creates linked waiver source record and waiver balance-impact fact. |
| Preserve original records | Does not delete or mutate the original penalty source record. |

### ReminderEligibilityService

| Responsibility | Detail |
|---|---|
| Evaluate scope | Invoice or billing account scope. |
| Evaluate amount | Positive overdue open amount after grace and suppression rules. |
| Evaluate contact | Authorized notification contact path required. |
| Evaluate duplicate | Suppress duplicate reminder for same scope and reminder period. |
| Snapshot result | Stores eligibility, suppression reason, contact path reference, and source facts. |

### ReminderIntentAdapter

| Intent | Boundary |
|---|---|
| Reminder intent | Records durable intent through UOW-01 support contracts. |
| Rendering | UOW-08 owns content rendering. |
| Email | UOW-08 owns SMTP delivery and retries. |
| Storage | UOW-08 owns document/file storage. |

Support intent failures are visible but do not mutate penalty or waiver source records.

### ValidationGateway

| Dependency | Validation |
|---|---|
| UOW-03 | Configuration primitives are present, effective, and unambiguous. |
| UOW-04 | Invoice facts are issued, non-voided, in scope, and resolvable. |
| UOW-05 | Open amount and balance-impact source facts are consistent and resolvable. |

The gateway returns typed success or safe failure codes. Financial mutations are blocked when required facts are unresolved.

### AmountCalculationPolicy

| Responsibility | Detail |
|---|---|
| Penalty basis | Excludes prior penalties, waivers, reminder fees, and penalty-on-penalty amounts. |
| Partial payment | Calculates from remaining eligible open amount as of evaluation date. |
| Waiver amount | Validates against available unpaid penalty amount. |
| Balance impact | Produces deterministic signed facts for penalties and waivers. |
| Decimal safety | Uses integer minor units or validated decimals. |

### BalanceImpactPublisher

| Source | Published Fact |
|---|---|
| PenaltySourceRecord | Penalty-side balance impact. |
| PenaltyWaiver | Waiver-side balance impact. |
| Reissue or correction | Linked corrective balance impact where applicable. |

BalanceImpactPublisher does not own a mutable balance. UOW-07 later consumes derived balance views.

### AuthorizationPolicy

| Actor | Enforcement |
|---|---|
| Homeowner | Own authorized billing accounts, properties, homeowner profile, and related penalty/waiver/delinquency/reminder status only. |
| Billing Staff | Overdue review, penalty run preparation, waiver request, and reminder intent workflows according to permission matrix. |
| Treasurer | Approval-sensitive waiver actions according to permission matrix. |
| Board Member | Read-only and PII-minimized access. |
| System Administrator | Administrative access according to permission matrix and audit rules. |

### AuditAdapter

| Event Type | Examples |
|---|---|
| Overdue and aging | Evaluation run, source-fact failure, classification. |
| Penalty | Candidate generated, applied, voided, reissued, duplicate blocked. |
| Waiver | Requested, approved, rejected, idempotent replay. |
| Reminder | Eligible, suppressed, intent created. |
| Security | Denied access and unsafe attempts. |

### ObservabilityAdapter

| Signal | Detail |
|---|---|
| Metrics | Counts, durations, conflict counts, suppression counts, failure codes. |
| Logs | Correlation ID, safe IDs, action, status, and safe failure code. |
| Redaction | No full PII, reminder payloads, email recipient payloads, sensitive contact data, or complete delinquency payloads. |

### FrontendInteraction

| Surface | NFR Responsibility |
|---|---|
| Overdue review | Server-authorized paginated results and explicit evaluation date. |
| Aging classification | Clear bucket, delinquent amount, and source-fact detail. |
| Penalty run | Candidate preview, duplicate warnings, blocking issue summaries. |
| Waiver panel | Approval status, reason capture, amount validation, idempotent outcome visibility. |
| Reminder panel | Eligibility, suppression reason, contact path status, and intent status. |
| Homeowner delinquency | Homeowner-safe penalty, waiver, delinquency, and reminder status. |

### PBTGenerators

| Generator/Model | Purpose |
|---|---|
| Evaluation date generator | Grace boundary and first-overdue-date cases. |
| Aging bucket generator | Configured bucket definitions and day-count mapping. |
| Penalty basis model | Non-compounding and partial-payment basis behavior. |
| Duplicate key generator | Penalty duplicate-blocking status behavior. |
| Waiver command model | Idempotent waiver and amount-limit behavior. |
| Reminder scope model | Duplicate suppression and missing-contact behavior. |
| Balance-impact model | Signed penalty and waiver impact conservation. |

## NFR Responsibility Mapping

| NFR Area | Primary Components |
|---|---|
| Performance | OverdueEvaluationService, AgingClassifier, PenaltyRunCoordinator, FrontendInteraction |
| Concurrency | DuplicatePenaltyGuard, PenaltyApplicationCoordinator, WaiverCoordinator, ReminderEligibilityService |
| Durability | PenaltyApplicationCoordinator, WaiverCoordinator, ReminderIntentAdapter, BalanceImpactPublisher, AuditAdapter |
| Security | AuthorizationPolicy, AuditAdapter, FrontendInteraction |
| Privacy | AuthorizationPolicy, ObservabilityAdapter, FrontendInteraction |
| Precision | AmountCalculationPolicy, BalanceImpactPublisher, PBTGenerators |
| Date determinism | DateControlPolicy, OverdueEvaluationService, AgingClassifier |
| Observability | ObservabilityAdapter, AuditAdapter |
| Support boundaries | ReminderIntentAdapter |
| Testing | PBTGenerators |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Components include authorization, audit, PII minimization, safe logging, support boundaries, and approval-sensitive actions. |
| Property-Based Testing | Compliant | PBTGenerators component defines date, financial, duplicate, waiver, reminder, and balance-impact invariant generators and state models. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
