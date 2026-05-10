export type ApprovalStatus = 'Pending' | 'ApprovedPendingApply' | 'Rejected' | 'Cancelled' | 'Applied' | 'ApplyFailed';

const ALLOWED_TRANSITIONS: Record<ApprovalStatus, readonly ApprovalStatus[]> = {
  Pending: ['ApprovedPendingApply', 'Rejected', 'Cancelled'],
  ApprovedPendingApply: ['Applied', 'ApplyFailed'],
  Rejected: [],
  Cancelled: [],
  Applied: [],
  ApplyFailed: ['ApprovedPendingApply']
};

export function canTransitionApproval(from: ApprovalStatus, to: ApprovalStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertCanTransitionApproval(from: ApprovalStatus, to: ApprovalStatus): void {
  if (!canTransitionApproval(from, to)) {
    throw new Error(`Approval transition denied: ${from} -> ${to}`);
  }
}
