export const InvoiceStatuses = ['Draft', 'Issued', 'Cancelled', 'Voided', 'Reissued'] as const;
export type InvoiceStatus = (typeof InvoiceStatuses)[number];

export const InvoiceOrigins = ['Recurring', 'Manual', 'Reissue'] as const;
export type InvoiceOrigin = (typeof InvoiceOrigins)[number];

export const BillingExceptionStatuses = ['Open', 'Resolved', 'Superseded'] as const;
export type BillingExceptionStatus = (typeof BillingExceptionStatuses)[number];

export const InvoiceIntentStatuses = ['Queued', 'Accepted', 'Failed', 'Cancelled'] as const;
export type InvoiceIntentStatus = (typeof InvoiceIntentStatuses)[number];

export const InvoiceFailureCodes = [
  'BILLABLE_VALIDATION_FAILED',
  'CONFIGURATION_MISSING',
  'CONFIGURATION_AMBIGUOUS',
  'DUPLICATE_RECURRING_INVOICE',
  'INVALID_INVOICE_STATUS',
  'ISSUED_NUMBER_CONFLICT',
  'MANUAL_LINE_INVALID',
  'UNAUTHORIZED_INVOICE_ACCESS'
] as const;
export type InvoiceFailureCode = (typeof InvoiceFailureCodes)[number];

export interface BillingPeriodRef {
  billingPeriodKey: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface RecurringDuplicateKey extends BillingPeriodRef {
  propertyId: string;
  billingAccountId: string;
  chargeTypeKey: string;
}

export interface InvoiceLineInput {
  chargeTypeKey: string;
  description: string;
  amount: string;
  quantity?: string | undefined;
  lotArea?: string | undefined;
  rate?: string | undefined;
  isManual?: boolean | undefined;
  isManualTaxLike?: boolean | undefined;
  manualReason?: string | undefined;
}

export interface InvoiceCalculationResult {
  lineAmounts: string[];
  totalAmount: string;
}

export interface InvoiceSafeFailure {
  ok: false;
  failureCode: InvoiceFailureCode;
  reason: string;
  correlationId?: string;
}

export interface InvoiceSuccess<T> {
  ok: true;
  value: T;
}

export type InvoiceResult<T> = InvoiceSuccess<T> | InvoiceSafeFailure;
