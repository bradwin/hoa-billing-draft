import { SafeValidationSummary } from './SafeValidationSummary';

export function ContactChangeRequestForm() {
  return (
    <form data-testid="contact-change-request-form">
      <input name="primaryEmail" type="email" placeholder="Primary email" />
      <input name="primaryPhone" placeholder="Primary phone" />
      <textarea name="mailingAddress" placeholder="Mailing address" />
      <button type="submit">Submit</button>
    </form>
  );
}

export function ContactChangeQueuePage({ requests }: { requests: readonly { id: string; status: string }[] }) {
  return (
    <section data-testid="contact-change-queue-page">
      <h2>Contact Changes</h2>
      {requests.map((request) => (
        <p key={request.id}>{request.status}</p>
      ))}
    </section>
  );
}

export function ContactChangeDecisionPanel({ status }: { status: 'Pending' | 'Approved' | 'Rejected' }) {
  const terminal = status !== 'Pending';
  return (
    <section data-testid="contact-change-decision-panel">
      <h3>Decision</h3>
      <SafeValidationSummary messages={terminal ? ['Request is terminal.'] : []} />
      <button type="button" disabled={terminal}>
        Approve
      </button>
      <button type="button" disabled={terminal}>
        Reject
      </button>
    </section>
  );
}

export function OwnerVisibilityPanel() {
  return (
    <section data-testid="owner-visibility-panel">
      <h2>My Profile</h2>
      <ContactChangeRequestForm />
    </section>
  );
}
