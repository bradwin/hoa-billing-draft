import type { InvoiceStatus } from './types';

const allowedTransitions: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  Draft: ['Issued', 'Cancelled'],
  Issued: ['Voided', 'Reissued'],
  Cancelled: [],
  Voided: [],
  Reissued: []
};

export function canTransitionInvoice(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertInvoiceTransition(from: InvoiceStatus, to: InvoiceStatus): void {
  if (!canTransitionInvoice(from, to)) {
    throw new Error(`Invalid invoice status transition from ${from} to ${to}`);
  }
}
