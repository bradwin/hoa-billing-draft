import type { BillingExceptionView, InvoiceView, IssueResultView, PageResult } from './api';
import { paymentDerivedStatusLabel } from './api';

export function InvoiceWorkspace() {
  return (
    <section data-testid="invoice-workspace">
      <h2>Invoices</h2>
      <RecurringInvoiceBatchPage />
      <DraftInvoiceReviewTable result={{ items: [], page: 1, pageSize: 25, totalItems: 0 }} />
    </section>
  );
}

export function RecurringInvoiceBatchPage() {
  return (
    <form data-testid="invoice-recurring-batch-page">
      <label>
        Billing period
        <input name="billingPeriodKey" data-testid="invoice-billing-period-selector" />
      </label>
      <label>
        Scope
        <select name="scope" data-testid="invoice-generation-scope-filter">
          <option value="all">All billable properties</option>
        </select>
      </label>
      <button type="submit" data-testid="invoice-generate-draft-batch-button">
        Generate drafts
      </button>
    </form>
  );
}

export function BillingExceptionReviewPanel({ exceptions = [] }: { exceptions?: BillingExceptionView[] }) {
  return (
    <section data-testid="invoice-billing-exception-review-panel">
      <table data-testid="invoice-billing-exception-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Validation date</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {exceptions.map((exception) => (
            <tr key={exception.id}>
              <td>{exception.propertyId}</td>
              <td>{exception.validationDate}</td>
              <td>{exception.failureCode}</td>
              <td>{exception.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function DraftInvoiceReviewTable({ result }: { result: PageResult<InvoiceView> }) {
  return (
    <table data-testid="invoice-draft-review-table">
      <thead>
        <tr>
          <th>Select</th>
          <th>Internal ID</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {result.items.map((invoice) => (
          <tr key={invoice.id}>
            <td><input type="checkbox" disabled={invoice.status !== 'Draft'} aria-label={`Select invoice ${invoice.id}`} /></td>
            <td>{invoice.id}</td>
            <td>{invoice.status}</td>
            <td>{invoice.totalAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function InvoiceIssueActionPanel({ results = [] }: { results?: IssueResultView[] }) {
  return (
    <section data-testid="invoice-issue-action-panel">
      <button type="button" data-testid="invoice-issue-selected-drafts-button">Issue selected drafts</button>
      <ul>
        {results.map((result) => (
          <li key={result.invoiceId}>{result.ok ? result.invoiceNumber : result.reason}</li>
        ))}
      </ul>
    </section>
  );
}

export function ManualInvoiceForm() {
  return (
    <form data-testid="invoice-manual-form">
      <label>
        Property
        <input name="propertyId" required />
      </label>
      <label>
        Billing account
        <input name="billingAccountId" required />
      </label>
      <div data-testid="invoice-manual-line-editor">
        <label>
          Charge type
          <input name="chargeTypeKey" required />
        </label>
        <label>
          Amount
          <input name="amount" inputMode="decimal" required />
        </label>
        <span data-testid="invoice-manual-tax-like-indicator">Manual tax-like lines require configured manual-entry eligibility.</span>
      </div>
      <button type="submit">Create manual draft</button>
    </form>
  );
}

export function InvoiceDetailPage({ invoice }: { invoice?: InvoiceView }) {
  return (
    <section data-testid="invoice-detail-page">
      <h2>{invoice?.invoiceNumber ?? invoice?.id ?? 'Invoice detail'}</h2>
      <p>Lifecycle: {invoice?.status ?? 'Draft'}</p>
      <p>{paymentDerivedStatusLabel()}</p>
      <InvoiceLineTable lines={invoice?.lines ?? []} />
      {invoice ? <IssuedSnapshotPanel invoice={invoice} /> : <IssuedSnapshotPanel />}
      <InvoiceLifecycleHistoryPanel />
      <VoidReissueRequestPanel />
      <DocumentEmailIntentPanel />
    </section>
  );
}

export function InvoiceLineTable({ lines }: { lines: InvoiceView['lines'] }) {
  return (
    <table data-testid="invoice-line-table">
      <tbody>
        {(lines ?? []).map((line) => (
          <tr key={line.id ?? line.lineNumber}>
            <td>{line.chargeTypeKey}</td>
            <td>{line.description}</td>
            <td>{line.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function IssuedSnapshotPanel({ invoice }: { invoice?: InvoiceView }) {
  return <section data-testid="invoice-issued-snapshot-panel">{invoice?.invoiceNumber ? 'Issued snapshot locked' : 'No issued snapshot'}</section>;
}

export function InvoiceLifecycleHistoryPanel() {
  return <section data-testid="invoice-lifecycle-history-panel">Lifecycle history is audited and immutable.</section>;
}

export function VoidReissueRequestPanel() {
  return (
    <section data-testid="invoice-void-reissue-request-panel">
      <button type="button">Request void</button>
      <button type="button">Request reissue</button>
    </section>
  );
}

export function DocumentEmailIntentPanel() {
  return (
    <section data-testid="invoice-document-email-intent-panel">
      Support intents only; PDF rendering, file storage, SMTP delivery, and retries are owned by UOW-08.
    </section>
  );
}

export function HomeownerInvoiceDetail({ invoice }: { invoice?: InvoiceView }) {
  return (
    <section data-testid="homeowner-invoice-detail">
      <h2>{invoice?.invoiceNumber ?? 'Invoice'}</h2>
      <InvoiceLineTable lines={invoice?.lines ?? []} />
    </section>
  );
}

export function InvoicePage() {
  return (
    <section>
      <InvoiceWorkspace />
      <BillingExceptionReviewPanel />
      <InvoiceIssueActionPanel />
      <ManualInvoiceForm />
      <InvoiceDetailPage />
    </section>
  );
}
