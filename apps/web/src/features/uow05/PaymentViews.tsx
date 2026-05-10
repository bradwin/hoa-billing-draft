import { paymentStateSeparationLabel, proofStatusLabel, type PageResult, type PaymentProofView, type PaymentView } from './api';

export function PaymentWorkspace() {
  return (
    <main data-testid="payment-workspace">
      <h1>Payments</h1>
      <PaymentProofReviewPanel />
      <PaymentPostingWorkspace />
      <CreditLedgerPanel />
    </main>
  );
}

export function HomeownerPaymentProofForm() {
  return (
    <form data-testid="homeowner-payment-proof-form">
      <label>
        Billing account
        <select data-testid="payment-proof-billing-account-selector" name="billingAccountId" />
      </label>
      <label>
        Property
        <select data-testid="payment-proof-property-selector" name="propertyId" />
      </label>
      <label>
        Amount
        <input data-testid="payment-proof-amount-input" name="amount" inputMode="decimal" />
      </label>
      <label>
        Payment method
        <select data-testid="payment-proof-method-selector" name="paymentMethodKey" />
      </label>
      <button data-testid="payment-proof-submit-button" type="submit">Submit proof</button>
    </form>
  );
}

export function HomeownerPaymentProofStatus({ proof }: { proof?: PaymentProofView }) {
  return (
    <section data-testid="homeowner-payment-proof-status">
      <h2>Payment Proof Status</h2>
      <p>{proof ? proofStatusLabel(proof.status) : 'No proof selected'}</p>
      {proof?.reason ? <p>{proof.reason}</p> : null}
    </section>
  );
}

export function PaymentProofReviewPanel({ proofs = [] }: { proofs?: PaymentProofView[] }) {
  return (
    <section data-testid="payment-proof-review-panel">
      <h2>Proof Review</h2>
      <table data-testid="payment-proof-queue-table">
        <thead>
          <tr><th>Account</th><th>Status</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {proofs.map((proof) => (
            <tr key={proof.id}>
              <td>{proof.billingAccountId}</td>
              <td>{proof.status}</td>
              <td>{proof.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <DuplicateCandidatePanel />
      <button data-testid="payment-proof-reject-button" type="button">Reject</button>
      <button data-testid="payment-proof-post-button" type="button">Post</button>
    </section>
  );
}

export function DuplicateCandidatePanel() {
  return (
    <aside data-testid="payment-duplicate-candidate-panel">
      Duplicate candidates require reviewed candidate IDs, reason, actor, and audit.
    </aside>
  );
}

export function PaymentPostingWorkspace() {
  return (
    <section data-testid="payment-posting-workspace">
      <h2>Post Payment</h2>
      <div data-testid="payment-validation-summary">Server validation is required before posting.</div>
      <AllocationEditor />
      <div data-testid="payment-credit-remainder-preview">Credit remainder: 0.00</div>
      <button data-testid="payment-post-button" type="button">Post payment</button>
    </section>
  );
}

export function AllocationEditor() {
  return (
    <section data-testid="payment-allocation-editor">
      <h3>Allocation</h3>
      <select data-testid="payment-allocation-mode-control" aria-label="Allocation mode">
        <option>Automatic</option>
        <option>Manual</option>
      </select>
      <table data-testid="payment-allocation-target-table">
        <thead><tr><th>Invoice</th><th>Component</th><th>Amount</th></tr></thead>
        <tbody />
      </table>
      <label>
        Manual reason
        <input data-testid="payment-manual-allocation-reason" />
      </label>
      <div data-testid="payment-allocation-total-check">Allocations plus credit remainder must equal payment amount.</div>
    </section>
  );
}

export function CreditLedgerPanel() {
  return (
    <section data-testid="credit-ledger-panel">
      <h2>Credits</h2>
      <table data-testid="credit-available-table">
        <thead><tr><th>Credit</th><th>Available</th><th>Status</th></tr></thead>
        <tbody />
      </table>
      <form data-testid="credit-application-form">
        <input aria-label="Credit application amount" />
        <button type="submit">Apply credit</button>
      </form>
      <table data-testid="credit-history-table">
        <thead><tr><th>Action</th><th>Amount</th></tr></thead>
        <tbody />
      </table>
    </section>
  );
}

export function ReceiptDetailPanel({ payment }: { payment?: PaymentView }) {
  return (
    <section data-testid="receipt-detail-panel">
      <h2>Receipt</h2>
      <p>{payment?.receipt?.receiptNumber ?? 'No receipt selected'}</p>
      <div data-testid="receipt-snapshot-panel">Receipt snapshot remains reproducible.</div>
      <div data-testid="receipt-allocation-summary">Allocation summary</div>
      <div data-testid="receipt-reversal-status">{payment?.status === 'Reversed' ? 'Reversed' : 'Issued'}</div>
    </section>
  );
}

export function PaymentHistoryPanel({ result }: { result?: PageResult<PaymentView> }) {
  return (
    <section data-testid="payment-history-panel">
      <h2>Payment History</h2>
      <p>{paymentStateSeparationLabel()}</p>
      <table>
        <thead><tr><th>Account</th><th>Status</th><th>Amount</th></tr></thead>
        <tbody>
          {(result?.items ?? []).map((payment) => (
            <tr key={payment.id}>
              <td>{payment.billingAccountId}</td>
              <td>{payment.status}</td>
              <td>{payment.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function PaymentReversalRequestPanel() {
  return (
    <section data-testid="payment-reversal-request-panel">
      <h2>Reversal</h2>
      <textarea aria-label="Reversal reason" />
    </section>
  );
}

export function FinancialCorrectionPanel() {
  return (
    <section data-testid="financial-correction-panel">
      <h2>Correction</h2>
      <select data-testid="financial-correction-source-selector" aria-label="Correction source" />
      <textarea data-testid="financial-correction-reason-input" aria-label="Correction reason" />
    </section>
  );
}

export function ReceiptIntentStatusPanel() {
  return (
    <section data-testid="receipt-document-email-intent-panel">
      <h2>Receipt Support</h2>
      <p data-testid="receipt-document-intent-status">Document intent only; UOW-08 renders and stores files.</p>
      <p data-testid="receipt-email-intent-status">Email intent only; UOW-08 sends email and retries failures.</p>
    </section>
  );
}

export function PaymentPage() {
  return (
    <PaymentWorkspace />
  );
}

export function HomeownerPaymentPage() {
  return (
    <main data-testid="homeowner-payment-page">
      <HomeownerPaymentProofForm />
      <HomeownerPaymentProofStatus />
      <ReceiptDetailPanel />
    </main>
  );
}
