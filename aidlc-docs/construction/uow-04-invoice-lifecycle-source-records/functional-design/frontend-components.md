# UOW-04 Frontend Components

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Functional Design

## Frontend Boundary

UOW-04 frontend screens support staff invoice generation, review, issuance, manual invoice creation, invoice lifecycle review, and invoice document/email intent visibility. Homeowner-safe invoice views are limited to authorized read models.

The frontend does not enforce security by itself. All reads and mutations must be server-authorized. UI controls are hidden or disabled for usability, but backend authorization is authoritative.

UOW-04 UI must not imply payment posting, receipt generation, penalty application, SOA/report generation, PDF rendering, SMTP delivery, file storage, imports, or mutable account-balance edits.

## Component Summary

| Component | Purpose | Primary Users |
|---|---|---|
| InvoiceWorkspace | Shell for UOW-04 invoice workflows. | Billing Staff, Treasurer |
| RecurringInvoiceBatchPage | Configure and start recurring draft generation. | Billing Staff |
| BillingExceptionReviewPanel | Review generation exceptions from UOW-02 and UOW-03 validation. | Billing Staff, Treasurer |
| DraftInvoiceReviewTable | Review generated and manual draft invoices before issuance. | Billing Staff, Treasurer |
| InvoiceIssueActionPanel | Issue selected valid draft invoices. | Billing Staff, Treasurer |
| ManualInvoiceForm | Create manual draft invoices with configured charge types. | Billing Staff |
| InvoiceDetailPage | Show invoice header, lines, snapshots, lifecycle history, and intent status. | Staff, Treasurer, Board Member, Homeowner |
| InvoiceLifecycleHistoryPanel | Show status changes, reasons, approval references, and audit-friendly metadata. | Staff, Treasurer |
| VoidReissueRequestPanel | Request void or reissue for issued invoices. | Billing Staff, Treasurer |
| DocumentEmailIntentPanel | Queue and view document/email intents for issued invoice snapshots. | Billing Staff |
| HomeownerInvoiceDetail | Homeowner-safe invoice detail read model. | Homeowner |

## Route Structure

| Route | Component | Notes |
|---|---|---|
| `/uow04/invoices` | InvoiceWorkspace | Staff invoice landing page. |
| `/uow04/invoices/recurring` | RecurringInvoiceBatchPage | Recurring batch generation. |
| `/uow04/invoices/exceptions` | BillingExceptionReviewPanel | Exception review and filtering. |
| `/uow04/invoices/drafts` | DraftInvoiceReviewTable | Draft review and selection. |
| `/uow04/invoices/manual` | ManualInvoiceForm | Manual draft creation. |
| `/uow04/invoices/:invoiceId` | InvoiceDetailPage | Authorized invoice detail. |
| `/portal/invoices/:invoiceId` | HomeownerInvoiceDetail | Homeowner-safe read-only detail. |

Route names are design-level targets. Final route paths may follow the established application routing pattern during code generation.

## Stable Test IDs

| Component | Stable `data-testid` |
|---|---|
| InvoiceWorkspace | `invoice-workspace` |
| RecurringInvoiceBatchPage | `invoice-recurring-batch-page` |
| BillingPeriodSelector | `invoice-billing-period-selector` |
| RecurringGenerationScopeFilter | `invoice-generation-scope-filter` |
| GenerateDraftBatchButton | `invoice-generate-draft-batch-button` |
| BillingExceptionReviewPanel | `invoice-billing-exception-review-panel` |
| BillingExceptionTable | `invoice-billing-exception-table` |
| DraftInvoiceReviewTable | `invoice-draft-review-table` |
| InvoiceIssueActionPanel | `invoice-issue-action-panel` |
| IssueSelectedDraftsButton | `invoice-issue-selected-drafts-button` |
| ManualInvoiceForm | `invoice-manual-form` |
| ManualInvoiceLineEditor | `invoice-manual-line-editor` |
| ManualTaxLikeIndicator | `invoice-manual-tax-like-indicator` |
| InvoiceDetailPage | `invoice-detail-page` |
| InvoiceLineTable | `invoice-line-table` |
| IssuedSnapshotPanel | `invoice-issued-snapshot-panel` |
| InvoiceLifecycleHistoryPanel | `invoice-lifecycle-history-panel` |
| VoidReissueRequestPanel | `invoice-void-reissue-request-panel` |
| DocumentEmailIntentPanel | `invoice-document-email-intent-panel` |
| HomeownerInvoiceDetail | `homeowner-invoice-detail` |

## RecurringInvoiceBatchPage

### Responsibilities

- Select billing period and recurring charge type.
- Select generation scope.
- Show that billing period start date is used as UOW-02 `validationDate`.
- Start recurring draft generation.
- Display generation summary: created drafts, duplicates blocked, and exceptions.

### State

| State | Description |
|---|---|
| `billingPeriodKey` | Selected billing period. |
| `chargeTypeKey` | Selected recurring charge type. |
| `scope` | Generation scope filters. |
| `isGenerating` | Whether generation command is in progress. |
| `lastResult` | Draft count, exception count, and duplicate count from last run. |

### Validation

- Billing period is required.
- Charge type must be recurring-eligible according to server-provided options.
- Generation cannot run without server-authorized permissions.

## BillingExceptionReviewPanel

### Responsibilities

- List billing exceptions by batch, billing period, property, failure reason, and status.
- Show source validation details safe for staff review.
- Provide filters for open, resolved, and superseded exceptions.
- Link to UOW-02 property or homeowner records where authorized.

### Display Rules

- Never hide exceptions from the generation result.
- Do not present exceptions as invoices.
- Do not create report exports; UOW-07 owns formal reports and exports.

## DraftInvoiceReviewTable

### Responsibilities

- Display draft invoice header facts, line totals, due dates, duplicate status, and validation state.
- Support selecting valid drafts for issuance.
- Show generated and manual draft origin.
- Link to invoice detail.

### Interaction Rules

- Invalid drafts cannot be selected for issuance.
- Draft invoices display internal IDs, not issued invoice numbers.
- Draft cancellation requires reason capture.

## InvoiceIssueActionPanel

### Responsibilities

- Show selected valid draft count and total.
- Warn that issuance assigns immutable numbers and snapshots invoice data.
- Submit selected draft IDs for revalidation and issuance.
- Display issuance result with issued numbers and failures.

### Interaction Rules

- Issuance is a server-side transaction per selected invoice or approved batch behavior.
- If a selected draft fails revalidation, the UI displays the failure and does not imply issuance.
- Voided or cancelled issued invoice numbers are never reused.

## ManualInvoiceForm

### Responsibilities

- Select property or billing account and responsible homeowner.
- Enter due date.
- Add one or more line items.
- Require configured charge type, description, amount, and reason.
- Mark manual tax-like lines when the selected charge type is UOW-03 manual-entry eligible and tax-like.
- Submit a manual draft invoice.

### Validation

- Property or billing account is required.
- Responsible homeowner is required.
- Due date is required.
- At least one line is required.
- Each line requires configured charge type, description, amount, and reason.
- Manual tax-like line requires UOW-03 tax-like and manual-entry eligible charge type.
- Free-form charge type text is not allowed.

## InvoiceDetailPage

### Responsibilities

- Show invoice status, origin, internal ID, issued invoice number when available, property, billing account, responsible homeowner, billing period, due date, and total.
- Show invoice lines and snapshots.
- Show lifecycle history and approval references.
- Show document and email intent status.
- Provide context-appropriate actions based on authorization and status.

### Display Rules

- Draft invoices show internal IDs only.
- Issued invoices show immutable invoice number and issued snapshot.
- Payment-derived states are not shown as lifecycle statuses.
- Homeowner-visible detail must use homeowner-safe read models.

## VoidReissueRequestPanel

### Responsibilities

- Allow authorized users to request void or reissue for issued invoices.
- Capture reason.
- Show approval status from UOW-01.
- Show supersession linkage when a reissue is completed.

### Interaction Rules

- Issued invoices cannot be edited in place.
- Void and reissue require approval before final lifecycle change.
- Reissue creates a new invoice source record after approval.

## DocumentEmailIntentPanel

### Responsibilities

- Queue document generation intent for issued invoice snapshots.
- Queue email delivery intent for issued invoice snapshots.
- Show latest intent status where available.

### Boundary Rules

- The panel does not render PDFs.
- The panel does not send SMTP emails.
- The panel does not manage file storage or retries.
- Failed future email delivery does not alter issued invoice validity.

## HomeownerInvoiceDetail

### Responsibilities

- Show homeowner-safe invoice header, line, due date, amount, issued snapshot, and document intent availability where authorized.
- Hide staff-only audit, internal validation details, and other homeowners' data.

### Authorization Rules

- Homeowners may view only invoices tied to their authorized billing accounts, properties, or homeowner profile.
- All data is server-filtered before rendering.

## API Integration Points

| Operation | Purpose |
|---|---|
| `GET /invoices` | List authorized invoice summaries. |
| `POST /invoices/recurring-batches` | Start recurring draft generation. |
| `GET /invoices/billing-exceptions` | List billing exceptions. |
| `GET /invoices/drafts` | List draft invoices for review. |
| `POST /invoices/manual` | Create manual draft invoice. |
| `POST /invoices/issue` | Issue selected valid drafts. |
| `GET /invoices/{invoiceId}` | Read authorized invoice detail. |
| `POST /invoices/{invoiceId}/cancel` | Cancel draft with reason. |
| `POST /invoices/{invoiceId}/void-request` | Request void approval. |
| `POST /invoices/{invoiceId}/reissue-request` | Request reissue approval. |
| `POST /invoices/{invoiceId}/document-intents` | Queue document intent. |
| `POST /invoices/{invoiceId}/email-intents` | Queue email intent. |

Endpoint paths are design-level names and may be adapted to the existing API route conventions during code generation.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Components rely on server authorization, avoid client-only security, preserve homeowner isolation, and minimize Board Member PII. |
| Property-Based Testing | N/A | This artifact defines frontend behavior. PBT targets are covered in business rules and business logic model; frontend tests should cover form validation, stable test IDs, safe rendering, and action gating. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
