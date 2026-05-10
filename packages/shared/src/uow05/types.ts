export const PaymentProofStatuses = ['Submitted', 'UnderReview', 'Rejected', 'Posted', 'Cancelled'] as const;
export type PaymentProofStatus = (typeof PaymentProofStatuses)[number];

export const PaymentStatuses = ['Posted', 'Reversed'] as const;
export type PaymentStatus = (typeof PaymentStatuses)[number];

export const CreditStatuses = ['Available', 'PartiallyApplied', 'Applied', 'Reversed'] as const;
export type CreditStatus = (typeof CreditStatuses)[number];

export const ReceiptStatuses = ['Issued', 'Reversed'] as const;
export type ReceiptStatus = (typeof ReceiptStatuses)[number];

export const PaymentIntentStatuses = ['Queued', 'Accepted', 'Failed', 'Cancelled'] as const;
export type PaymentIntentStatus = (typeof PaymentIntentStatuses)[number];

export const PaymentFailureCodes = [
  'PAYMENT_SOURCE_FACTS_UNRESOLVED',
  'PAYMENT_DUPLICATE_RISK',
  'PAYMENT_INVALID_PROOF_STATUS',
  'PAYMENT_INVALID_ALLOCATION',
  'PAYMENT_OPEN_AMOUNT_EXCEEDED',
  'PAYMENT_CREDIT_EXCEEDED',
  'PAYMENT_RECEIPT_NUMBER_CONFLICT',
  'PAYMENT_ALREADY_REVERSED',
  'PAYMENT_IMMUTABLE_SOURCE_RECORD',
  'UNAUTHORIZED_PAYMENT_ACCESS'
] as const;
export type PaymentFailureCode = (typeof PaymentFailureCodes)[number];

export interface PaymentDuplicateRiskKey {
  billingAccountId: string;
  paymentMethodKey: string;
  externalReference?: string | undefined;
  amount: string;
  paymentDate: string;
}

export interface AllocationTargetInput {
  invoiceId: string;
  invoiceLineId?: string | undefined;
  componentType: 'Penalty' | 'Fee' | 'Dues' | 'RegularCharge' | 'ManualCharge';
  openAmount: string;
  amount: string;
}

export interface PaymentPostingInput extends PaymentDuplicateRiskKey {
  homeownerId: string;
  propertyId?: string | undefined;
  proofId?: string | undefined;
  allocations: AllocationTargetInput[];
  creditRemainder?: string | undefined;
}

export interface AllocationValidationResult {
  allocatedAmount: string;
  creditRemainder: string;
  paymentAmount: string;
}

export interface CreditAvailabilityInput {
  originalAmount: string;
  appliedAmounts: string[];
  reversedAmounts?: string[] | undefined;
}

export interface PaymentSafeFailure {
  ok: false;
  failureCode: PaymentFailureCode;
  reason: string;
  correlationId?: string;
}

export interface PaymentSuccess<T> {
  ok: true;
  value: T;
}

export type PaymentResult<T> = PaymentSuccess<T> | PaymentSafeFailure;
