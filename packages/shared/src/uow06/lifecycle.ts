import type { PenaltySourceStatus, WaiverRequestStatus } from './types';

export function isPenaltyDuplicateBlockingStatus(status: PenaltySourceStatus): boolean {
  return status === 'Draft' || status === 'Applied' || status === 'Reissued';
}

export function assertPenaltyCanApply(status: PenaltySourceStatus): void {
  if (status !== 'Draft') {
    throw new Error('Only draft penalties can be applied');
  }
}

export function assertWaiverCanBeDecided(status: WaiverRequestStatus): void {
  if (status !== 'Pending') {
    throw new Error('Only pending waiver requests can be decided');
  }
}

export function waiverIdempotencyKey(approvalRequestId: string, penaltySourceRecordId: string): string {
  return `${approvalRequestId}|${penaltySourceRecordId}`;
}
