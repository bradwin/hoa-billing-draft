import fc from 'fast-check';
import { canTransitionApproval, type ApprovalStatus } from '../../src/modules/approvals/approval-state';

const statuses: ApprovalStatus[] = ['Pending', 'ApprovedPendingApply', 'Rejected', 'Cancelled', 'Applied', 'ApplyFailed'];
const pbtSeedOptions = process.env.PBT_SEED ? { seed: Number(process.env.PBT_SEED) } : undefined;

describe('approval state properties', () => {
  it('terminal states cannot transition', () => {
    fc.assert(
      fc.property(fc.constantFrom<ApprovalStatus>('Rejected', 'Cancelled', 'Applied'), fc.constantFrom(...statuses), (from, to) => {
        expect(canTransitionApproval(from, to)).toBe(false);
      }),
      pbtSeedOptions
    );
  });
});
