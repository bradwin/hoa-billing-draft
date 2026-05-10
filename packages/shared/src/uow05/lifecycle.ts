import type { PaymentProofStatus, PaymentStatus } from './types';

const proofTransitions: Record<PaymentProofStatus, readonly PaymentProofStatus[]> = {
  Submitted: ['UnderReview', 'Rejected', 'Cancelled', 'Posted'],
  UnderReview: ['Rejected', 'Cancelled', 'Posted'],
  Rejected: [],
  Posted: [],
  Cancelled: []
};

export function canTransitionPaymentProof(from: PaymentProofStatus, to: PaymentProofStatus): boolean {
  return proofTransitions[from].includes(to);
}

export function assertPaymentProofTransition(from: PaymentProofStatus, to: PaymentProofStatus): void {
  if (!canTransitionPaymentProof(from, to)) {
    throw new Error(`Invalid payment proof transition from ${from} to ${to}`);
  }
}

export function assertPaymentCanReverse(status: PaymentStatus): void {
  if (status !== 'Posted') {
    throw new Error('Only posted payments can be reversed');
  }
}
