export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface InvoiceLineView {
  id?: string;
  lineNumber: number;
  chargeTypeKey: string;
  description: string;
  amount: string;
  isManual?: boolean;
  isManualTaxLike?: boolean;
}

export interface InvoiceView {
  id: string;
  invoiceNumber?: string | null;
  origin: 'Recurring' | 'Manual' | 'Reissue';
  status: 'Draft' | 'Issued' | 'Cancelled' | 'Voided' | 'Reissued';
  propertyId: string;
  billingAccountId: string;
  responsibleHomeownerId: string;
  billingPeriodKey?: string | null;
  dueDate: string;
  totalAmount: string;
  lines?: InvoiceLineView[];
}

export interface BillingExceptionView {
  id: string;
  propertyId: string;
  validationDate: string;
  failureCode: string;
  status: 'Open' | 'Resolved' | 'Superseded';
}

export interface IssueResultView {
  invoiceId: string;
  ok: boolean;
  invoiceNumber?: string;
  reason?: string;
}

export function invoiceStatusLabel(status: InvoiceView['status']): string {
  return status;
}

export function paymentDerivedStatusLabel(): string {
  return 'Payment status is derived later from payment allocations.';
}
