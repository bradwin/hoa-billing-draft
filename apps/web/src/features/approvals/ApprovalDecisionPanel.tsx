import type { ActorContext } from '@hoa/shared';
import type { ApprovalListItem } from './ApprovalQueueShell';

export function ApprovalDecisionPanel({ actor, request }: { actor: ActorContext; request: ApprovalListItem }) {
  const selfApproval = actor.userId === request.requesterUserId;
  return (
    <section data-testid="approval-decision-panel">
      <p>{request.actionType}</p>
      <button type="button" disabled={selfApproval}>Approve</button>
      <button type="button" disabled={selfApproval}>Reject</button>
    </section>
  );
}
