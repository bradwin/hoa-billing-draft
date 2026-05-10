# UOW-05 NFR Design Patterns

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: NFR Design

## Purpose

This design translates UOW-05 NFR Requirements into implementation patterns for payment proof intake, posting, allocation, credits, receipts, reversals, corrections, support intents, authorization, observability, frontend accessibility, and property-based testing.

## Payment Proof Submission Pattern

| Aspect | Design |
|---|---|
| Entry point | Server-authorized API command for payment proof metadata submission. |
| Validation | Validate homeowner, billing account, property, amount, payment date, payment method, reference requirements, actor authority, and optional invoice targets. |
| Attachment handling | Capture attachment reference or support intent only. Concrete file storage is UOW-08. |
| Duplicate feedback | Provide safe duplicate-risk feedback when duplicate candidates can be evaluated without exposing another homeowner's data. |
| Failure behavior | Fail closed with safe reason-coded errors. |

The browser must not be the source of authority for proof state or authorization. Homeowner proof submission can prepare local form data, but record creation happens only through the server.

## Payment Posting Transaction Pattern

| Step | Design |
|---|---|
| Revalidation | Revalidate UOW-02 authorization facts, UOW-03 payment/numbering metadata, UOW-04 invoice/open-amount facts, duplicate risk, proof state, allocation targets, and credit remainder. |
| Transaction boundary | One payment posting transaction per payment. |
| Writes | Create payment, allocations, credit source record where applicable, receipt, receipt snapshot, receipt number assignment, balance-impact facts, and audit references where practical. |
| Batch behavior | Batch posting executes selected payments with per-payment success or failure results. |
| Partial failure | Do not commit partial financial source records for a failed payment. |

This pattern avoids batch-wide rollback for unrelated payments while preserving atomicity for each posted payment.

## Duplicate Payment Guard Pattern

| Aspect | Design |
|---|---|
| Duplicate key | Billing account, payment method, external reference, amount, and payment date. |
| Active proofs | `Submitted` and `UnderReview`. |
| Posted records | Non-reversed posted payments. |
| Guard layers | Service guard plus database-backed indexed duplicate-risk lookup. |
| Override | Elevated override requires reviewed candidate IDs, actor, reason, timestamp, correlation ID, and audit. |

The duplicate guard is risk-based, not a global payment-reference uniqueness rule.

## Allocation Concurrency Pattern

| Aspect | Design |
|---|---|
| Open amount source | Derived from UOW-04 invoice source facts plus UOW-05 allocations, credits, reversals, and corrections. |
| Recalculation | Recompute eligible open amounts inside the posting or credit application transaction. |
| Locking | Lock affected invoice, component, payment, or credit rows where needed. |
| Invariant | Allocations and credit applications must not exceed eligible open amounts. |
| Failure behavior | Race conflicts return stable safe errors and no partial financial commits. |

Review-screen open amounts are advisory. Transaction-time revalidation is authoritative.

## Credit Safety Pattern

| Aspect | Design |
|---|---|
| Credit model | Credits are immutable source records. |
| Availability | Available credit is derived from original credit amount minus linked applications and reversal/correction facts. |
| Application | Every application creates a linked application source fact. |
| Transaction check | Validate available credit inside the application transaction. |
| Mutation rule | Original credit amount is never decremented in place. |

## Receipt Numbering Pattern

| Aspect | Design |
|---|---|
| Timing | Assign receipt number only after payment posting validation succeeds. |
| Lock scope | Use row-level or advisory lock per receipt numbering scope. |
| Uniqueness | Enforce unique receipt-number constraint. |
| Race behavior | Return stable receipt-number conflict error if a race is detected. |
| Reuse | Receipt numbers are never reused after reversal. |

Receipt PDF rendering must not allocate receipt numbers. UOW-05 owns receipt source records and numbering.

## Reversal Idempotency Pattern

| Aspect | Design |
|---|---|
| Approval | Reversal command requires approved UOW-01 approval where required. |
| Uniqueness | Enforce one reversal per posted payment. |
| Idempotency | Duplicate execution of the same approved reversal command returns existing result or safe duplicate-command response. |
| Financial impact | Create equal-and-opposite balance-impact facts. |
| Immutability | Do not overwrite or delete original payment, allocation, credit, or receipt records. |

`Reversed` state is derived from linked reversal facts, not from destructive source-record mutation.

## Financial Correction Pattern

| Aspect | Design |
|---|---|
| Approval | Corrections use approval-backed commands where required. |
| Source linkage | Correction records link to original source records or approved import/opening-balance owner inputs. |
| Writes | Create linked correction source records and balance-impact facts. |
| Prohibition | Reject direct source-record edits. |
| Audit | Reason, actor, approval reference, timestamp, and correlation ID are required. |

## Fail-Closed Validation Pattern

| Dependency | Validation |
|---|---|
| UOW-02 | Resolve homeowner, property, billing account, and object authorization facts. |
| UOW-03 | Resolve payment method, reference requirements, receipt numbering metadata, rounding/decimal metadata, and template references where applicable. |
| UOW-04 | Resolve issued invoice status, invoice source facts, open-amount inputs, and invoice targets. |

The validation gateway returns typed success or safe failure codes. Posting, allocation, credit application, reversal, and correction are blocked when required source facts are unresolved or ambiguous.

## Decimal And Amount Pattern

| Aspect | Design |
|---|---|
| Calculation policy | Central payment calculation policy for allocation, credit remainder, reversal facts, and correction amount validation. |
| Representation | Integer minor units or validated decimal representations. |
| Prohibition | No JavaScript floating point for financial amount logic. |
| Determinism | Allocation totals plus credit remainder must equal posted payment amount. Reversal facts must exactly offset original effects. |

## Support Intent Pattern

| Aspect | Design |
|---|---|
| Proof attachments | Record attachment references or intents through UOW-01 support contracts. |
| Receipt documents | Record receipt document intents against receipt snapshots. |
| Receipt emails | Record receipt email intents against receipt snapshots. |
| Boundary | UOW-08 owns concrete file storage, rendering, SMTP delivery, retries, and downloads. |
| Failure behavior | Support intent failure is visible but does not invalidate posted payments. |

## Security And Authorization Pattern

| Aspect | Design |
|---|---|
| Actor context | Use UOW-01 actor context for every command and query. |
| Route guards | Protect all UOW-05 API routes. |
| Object policy | Enforce payment, proof, receipt, credit, billing account, property, homeowner, and invoice scope checks server-side. |
| Approvals | Treasurer approval checks for reversal and correction commands where required. |
| PII minimization | Board Member reads are read-only and PII-minimized. |
| Denials | Return safe denials and emit audit/security events. |

## Observability And Logging Pattern

| Signal | Design |
|---|---|
| Proof lifecycle | Submitted, under review, rejected, cancelled, and posted events. |
| Duplicate review | Candidate count, override decision, and safe failure code. |
| Posting | Success, failure, allocation failure, credit creation, receipt creation, and transaction duration. |
| Numbering | Receipt numbering conflicts and assignment counts. |
| Governance | Reversal/correction requests, approvals, denials, and execution results. |
| Security | Denied access and unsafe attempt events. |
| Support | Proof attachment and receipt document/email intent requests. |

Logs use safe identifiers and redacted payloads. Full proof payloads, attachment contents, payment account details, full PII, and email recipient payloads must not be logged.

## Frontend NFR Pattern

| Aspect | Design |
|---|---|
| Data loading | Server-authorized data only. |
| Lists | Paginated tables with filters and server-side sorting. |
| Accessibility | Keyboard-accessible proof, posting, allocation, credit, reversal, and correction workflows. |
| Validation | Safe validation summaries distinguish blocking errors, warnings, duplicate risks, and approval requirements. |
| Testability | Stable `data-testid` values from Functional Design. |
| State clarity | Proof, payment, receipt, credit, reversal, and correction states are visually distinct. |
| Prohibition | Normal staff workflows must not use JSON-only editing. |

## PBT Design Pattern

| Property Area | Design |
|---|---|
| Generators | Centralized `fast-check` generators for payment amounts, allocation targets, invoice open amounts, credits, receipt numbering scopes, duplicate keys, reversal commands, and source-record states. |
| State models | Model proof lifecycle, posting, allocation, credit availability, receipt issuance, reversal, and correction transitions. |
| Replay | Capture failing seeds for regression tests. |
| Shrinking | Use shrinkable domain generators to minimize financial counterexamples. |
| Invariants | Allocation conservation, open amount limits, credit remainder correctness, reversal restoration, receipt number uniqueness, duplicate-key behavior, and immutability. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Design patterns require backend authorization, object/scope checks, approvals, audit/security events, safe logging, PII minimization, and support boundaries. |
| Property-Based Testing | Compliant | PBT pattern defines central generators, state models, seed replay, shrinking, and financial invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
