import { delinquencyStateSeparationLabel, penaltyStatusLabel, type AgingView, type PageResult, type PenaltyView, type ReminderEligibilityView } from './api';

export function DelinquencyWorkspace() {
  return (
    <main data-testid="delinquency-workspace">
      <h1>Penalties and Delinquency</h1>
      <OverdueReviewWorkspace />
      <AgingBucketTable />
      <PenaltyCandidatePanel />
      <PenaltyApplicationReview />
      <WaiverApprovalPanel />
      <ReminderEligibilityPanel />
    </main>
  );
}

export function OverdueReviewWorkspace() {
  return (
    <section data-testid="overdue-review-workspace">
      <h2>Overdue Review</h2>
      <label>
        Evaluation date
        <input data-testid="overdue-evaluation-date-input" name="evaluationDate" type="date" />
      </label>
      <div data-testid="overdue-validation-summary">Financial evaluation requires an explicit date.</div>
      <button data-testid="overdue-evaluate-button" type="button">Evaluate</button>
    </section>
  );
}

export function AgingBucketTable({ result }: { result?: PageResult<AgingView> }) {
  return (
    <section data-testid="aging-bucket-table-panel">
      <h2>Aging</h2>
      <p>{delinquencyStateSeparationLabel()}</p>
      <table data-testid="aging-bucket-table">
        <thead><tr><th>Account</th><th>Bucket</th><th>Days</th><th>Open</th></tr></thead>
        <tbody>
          {(result?.items ?? []).map((item) => (
            <tr key={item.id}>
              <td>{item.billingAccountId}</td>
              <td>{item.agingBucket}</td>
              <td>{item.agingDayCount}</td>
              <td>{item.openAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function PenaltyCandidatePanel() {
  return (
    <section data-testid="penalty-candidate-panel">
      <h2>Penalty Candidates</h2>
      <label>
        Penalty charge type
        <select data-testid="penalty-charge-type-selector" name="penaltyChargeTypeId" />
      </label>
      <div data-testid="penalty-duplicate-warning">Draft, Applied, and Reissued penalties block duplicates.</div>
      <button data-testid="penalty-candidate-generate-button" type="button">Generate candidates</button>
    </section>
  );
}

export function PenaltyApplicationReview({ penalties = [] }: { penalties?: PenaltyView[] }) {
  return (
    <section data-testid="penalty-application-review">
      <h2>Apply Penalties</h2>
      <table data-testid="penalty-application-table">
        <thead><tr><th>Invoice</th><th>Status</th><th>Amount</th></tr></thead>
        <tbody>
          {penalties.map((penalty) => (
            <tr key={penalty.id}>
              <td>{penalty.invoiceId}</td>
              <td>{penaltyStatusLabel(penalty.status)}</td>
              <td>{penalty.penaltyAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button data-testid="penalty-apply-button" type="button">Apply selected penalties</button>
    </section>
  );
}

export function PenaltyDetailHistory({ penalty }: { penalty?: PenaltyView }) {
  return (
    <section data-testid="penalty-detail-history">
      <h2>Penalty History</h2>
      <p>{penalty ? penaltyStatusLabel(penalty.status) : 'No penalty selected'}</p>
      <div data-testid="penalty-source-snapshot">Applied penalties remain immutable and linked to source facts.</div>
    </section>
  );
}

export function WaiverRequestPanel() {
  return (
    <section data-testid="waiver-request-panel">
      <h2>Waiver Request</h2>
      <label>
        Waiver amount
        <input data-testid="waiver-amount-input" inputMode="decimal" />
      </label>
      <textarea data-testid="waiver-reason-input" aria-label="Waiver reason" />
      <div data-testid="waiver-limit-error">Waiver amount cannot exceed available unpaid penalty.</div>
    </section>
  );
}

export function WaiverApprovalPanel() {
  return (
    <section data-testid="waiver-approval-panel">
      <h2>Waiver Approval</h2>
      <WaiverRequestPanel />
      <button data-testid="waiver-approve-button" type="button">Approve waiver</button>
      <button data-testid="waiver-reject-button" type="button">Reject waiver</button>
    </section>
  );
}

export function ReminderEligibilityPanel({ items = [] }: { items?: ReminderEligibilityView[] }) {
  return (
    <section data-testid="reminder-eligibility-panel">
      <h2>Reminder Eligibility</h2>
      <table data-testid="reminder-eligibility-table">
        <thead><tr><th>Scope</th><th>Period</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.reminderScopeId}</td>
              <td>{item.reminderPeriodKey}</td>
              <td>{item.suppressed ? item.suppressionReason ?? 'Suppressed' : 'Eligible'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button data-testid="reminder-intent-create-button" type="button">Create reminder intent</button>
    </section>
  );
}

export function ReminderIntentStatusPanel() {
  return (
    <section data-testid="reminder-intent-status-panel">
      <h2>Reminder Intent Status</h2>
      <p data-testid="reminder-document-intent-status">Reminder intent only; UOW-08 renders and stores documents.</p>
      <p data-testid="reminder-email-intent-status">Reminder intent only; UOW-08 handles email delivery and retries failures.</p>
    </section>
  );
}

export function HomeownerDelinquencyPage() {
  return (
    <main data-testid="homeowner-delinquency-page">
      <AgingBucketTable />
      <PenaltyDetailHistory />
      <ReminderIntentStatusPanel />
    </main>
  );
}

export function DelinquencyPage() {
  return <DelinquencyWorkspace />;
}
