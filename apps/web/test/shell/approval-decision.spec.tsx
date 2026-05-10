import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApprovalDecisionPanel } from '../../src/features/approvals/ApprovalDecisionPanel';

describe('ApprovalDecisionPanel', () => {
  it('disables self-approval decisions client-side', () => {
    render(
      <ApprovalDecisionPanel
        actor={{ userId: 'u1', role: 'Treasurer', correlationId: 'corr_12345678', sessionId: 's1' }}
        request={{ id: 'a1', requesterUserId: 'u1', actionType: 'PaymentReverse', status: 'Pending' }}
      />
    );
    expect(screen.getByText('Approve')).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
  });
});
