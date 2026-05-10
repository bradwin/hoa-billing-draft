# UOW-05 Frontend Components

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Functional Design

## Frontend Scope

UOW-05 frontend surfaces support homeowner payment proof submission and staff financial workflows for proof review, payment posting, allocation, credits, receipts, reversals, corrections, and receipt document/email intent status. All data must come from server-authorized APIs. Frontend controls must not be treated as authorization.

## Component Summary

| Component | Primary Actor | Purpose |
|---|---|---|
| `PaymentWorkspace` | Staff | Main staff workspace for proof queues, posting, allocations, credits, receipts, reversals, and corrections. |
| `HomeownerPaymentProofForm` | Homeowner | Submit payment proof against authorized billing accounts, properties, and optional invoices. |
| `HomeownerPaymentProofStatus` | Homeowner | View submitted proof status, rejection/cancellation reason, posted payment, and receipt references. |
| `PaymentProofReviewPanel` | Staff | Review submitted and under-review proofs, duplicate candidates, and posting readiness. |
| `PaymentPostingWorkspace` | Staff | Post verified proof or direct staff payment with allocation and credit preview. |
| `AllocationEditor` | Staff | Review automatic allocation and enter validated manual allocation targets. |
| `CreditLedgerPanel` | Staff | View credits, available credit derivation, and credit application actions. |
| `ReceiptDetailPanel` | Staff/Homeowner | View receipt source facts and receipt snapshot. |
| `PaymentHistoryPanel` | Staff/Homeowner | View payment, allocation, credit, receipt, reversal, and correction history. |
| `PaymentReversalRequestPanel` | Staff/Treasurer | Request and track approved payment reversals. |
| `FinancialCorrectionPanel` | Staff/Treasurer | Request and track approved financial corrections. |
| `ReceiptIntentStatusPanel` | Staff/Homeowner | View receipt document/email intent status without rendering or sending. |

## Homeowner Payment Proof Form

| Element | Behavior |
|---|---|
| Billing account selector | Shows only server-authorized billing accounts. |
| Property selector | Shows only authorized properties for the selected account. |
| Amount input | Requires positive decimal-safe amount. |
| Payment date input | Requires valid date. |
| Payment method selector | Uses configured payment methods from server-provided options. |
| External reference input | Required when the resolved payment-method or proof-channel configuration requires it. |
| Target invoice selector | Optional; shows eligible authorized invoices only. |
| Attachment control | Captures proof attachment intent/metadata only; concrete storage is UOW-08. |
| Submit action | Creates `Submitted` proof through server API. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `homeowner-payment-proof-form` | Root proof submission form. |
| `payment-proof-billing-account-selector` | Billing account control. |
| `payment-proof-property-selector` | Property control. |
| `payment-proof-amount-input` | Amount input. |
| `payment-proof-method-selector` | Payment method control. |
| `payment-proof-submit-button` | Submit action. |

## Payment Proof Review Panel

| Element | Behavior |
|---|---|
| Proof queue table | Shows `Submitted` and `UnderReview` proofs. |
| Duplicate candidate section | Shows duplicate-risk candidates and override requirements. |
| Review action | Moves proof to `UnderReview`. |
| Reject action | Requires reason and audit. |
| Cancel action | Requires reason and audit. |
| Post action | Opens posting workspace and triggers server-side revalidation. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `payment-proof-review-panel` | Root review panel. |
| `payment-proof-queue-table` | Proof queue table. |
| `payment-duplicate-candidate-panel` | Duplicate candidate review. |
| `payment-proof-reject-button` | Reject action. |
| `payment-proof-post-button` | Post action. |

## Payment Posting Workspace

| Element | Behavior |
|---|---|
| Payment summary | Displays amount, payment date, method, payer, account, property, and reference. |
| Validation summary | Shows server validation results and blocking errors. |
| Allocation preview | Shows automatic allocation by oldest eligible invoice. |
| Credit remainder preview | Shows explicit overpayment credit amount. |
| Receipt preview | Shows receipt number assignment occurs only after posting succeeds. |
| Post button | Posts payment transactionally through server API. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `payment-posting-workspace` | Root posting workspace. |
| `payment-validation-summary` | Server validation summary. |
| `payment-allocation-preview` | Allocation preview. |
| `payment-credit-remainder-preview` | Credit remainder preview. |
| `payment-post-button` | Transactional post action. |

## Allocation Editor

| Element | Behavior |
|---|---|
| Allocation mode control | Selects automatic or manual allocation. |
| Invoice target table | Shows eligible issued invoices with open amounts. |
| Component allocation rows | Shows penalty, fee, dues, regular charge, and manual charge components where available. |
| Manual reason input | Required for manual allocation. |
| Totals panel | Validates allocations plus credit remainder equal payment amount. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `payment-allocation-editor` | Root allocation editor. |
| `payment-allocation-mode-control` | Allocation mode control. |
| `payment-allocation-target-table` | Invoice target table. |
| `payment-allocation-total-check` | Allocation total validation. |
| `payment-manual-allocation-reason` | Manual reason input. |

## Credit Ledger Panel

| Element | Behavior |
|---|---|
| Credit list | Shows original credit, applied amount, available amount, source, and status. |
| Credit application form | Applies available credit to eligible invoice/component with reason and audit. |
| Credit history | Shows linked applications and reversals. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `credit-ledger-panel` | Root credit panel. |
| `credit-available-table` | Credit list. |
| `credit-application-form` | Credit application form. |
| `credit-history-table` | Credit history. |

## Receipt Detail Panel

| Element | Behavior |
|---|---|
| Receipt summary | Shows receipt number, payment, payer, amount, payment method, reference, and posting date. |
| Receipt snapshot | Shows immutable receipt facts. |
| Allocation summary | Shows receipt allocation summary and credit remainder. |
| Reversal status | Shows reversed state where applicable without hiding original receipt. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `receipt-detail-panel` | Root receipt detail. |
| `receipt-snapshot-panel` | Receipt snapshot. |
| `receipt-allocation-summary` | Allocation summary. |
| `receipt-reversal-status` | Reversal status. |

## Reversal And Correction Panels

Payment reversal and financial correction actions require reason, approval linkage where applicable, actor, target source record, effective date, and audit context. The UI must show original records and linked corrective records; it must not imply deletion or direct editing.

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `payment-reversal-request-panel` | Payment reversal request and status. |
| `financial-correction-panel` | Correction request and status. |
| `financial-correction-source-selector` | Source record selector. |
| `financial-correction-reason-input` | Required reason input. |

## Receipt Intent Status Panel

| Element | Behavior |
|---|---|
| Document intent status | Shows queued, accepted, failed, or cancelled document intent. |
| Email intent status | Shows queued, accepted, failed, or cancelled email intent. |
| Boundary text | Makes clear that rendering, storage, SMTP delivery, retries, and downloads are UOW-08 responsibilities. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `receipt-document-email-intent-panel` | Receipt support intent status. |
| `receipt-document-intent-status` | Document intent status. |
| `receipt-email-intent-status` | Email intent status. |

## Accessibility And Validation

- Forms must expose labels and validation summaries.
- Tables must have clear column headers and row actions.
- Financial amounts must use consistent decimal display.
- Blocking server validation errors must be displayed near the relevant action.
- Payment lifecycle state must be visually distinct from proof state and receipt state.
- UI must not use JSON-only editing for normal payment, allocation, credit, reversal, or correction workflows.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Components rely on server-authorized data, preserve homeowner isolation, support PII minimization, and do not implement client-side-only authorization. |
| Property-Based Testing | N/A for frontend design | PBT applies to domain and service invariants; frontend tests should cover validation summaries, state transitions, stable test IDs, and no JSON-only workflows. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
