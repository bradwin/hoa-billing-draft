export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PaymentProofView {
  id: string;
  status: 'Submitted' | 'UnderReview' | 'Rejected' | 'Posted' | 'Cancelled';
  billingAccountId: string;
  homeownerId: string;
  amount: string;
  paymentDate: string;
  paymentMethodKey: string;
  externalReference?: string;
  reason?: string;
}

export interface PaymentAllocationView {
  id: string;
  invoiceId: string;
  componentType: string;
  amount: string;
}

export interface CreditView {
  id: string;
  status: string;
  originalAmount: string;
}

export interface ReceiptView {
  id: string;
  receiptNumber: string;
  status: string;
  receiptDate: string;
}

export interface PaymentView {
  id: string;
  status: 'Posted' | 'Reversed';
  billingAccountId: string;
  homeownerId: string;
  amount: string;
  paymentDate: string;
  postingDate: string;
  allocations: PaymentAllocationView[];
  credits?: CreditView[];
  receipt?: ReceiptView;
}

export function proofStatusLabel(status: PaymentProofView['status']): string {
  return `Proof: ${status}`;
}

export function paymentStateSeparationLabel(): string {
  return 'Proof, payment, receipt, credit, reversal, and correction states are tracked separately.';
}

export async function listPayments(): Promise<PageResult<PaymentView>> {
  const response = await fetch('/api/payments', { credentials: 'include' });
  if (!response.ok) throw new Error('Unable to load payments');
  return response.json() as Promise<PageResult<PaymentView>>;
}
