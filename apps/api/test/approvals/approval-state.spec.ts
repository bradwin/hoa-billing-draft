import { canTransitionApproval } from '../../src/modules/approvals/approval-state';

describe('approval state transitions', () => {
  it('allows only documented transitions', () => {
    expect(canTransitionApproval('Pending', 'ApprovedPendingApply')).toBe(true);
    expect(canTransitionApproval('Pending', 'Applied')).toBe(false);
    expect(canTransitionApproval('Rejected', 'Pending')).toBe(false);
  });
});
