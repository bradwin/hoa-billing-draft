export const PenaltySourceStatuses = ['Draft', 'Applied', 'Voided', 'Reissued'] as const;
export type PenaltySourceStatus = (typeof PenaltySourceStatuses)[number];

export const WaiverRequestStatuses = ['Pending', 'Approved', 'Rejected', 'Cancelled'] as const;
export type WaiverRequestStatus = (typeof WaiverRequestStatuses)[number];

export const ReminderIntentStatuses = ['Queued', 'Accepted', 'Suppressed', 'Failed', 'Cancelled'] as const;
export type ReminderIntentStatus = (typeof ReminderIntentStatuses)[number];

export const AgingBucketCodes = ['Current', '1-30', '31-60', '61-90', '90+'] as const;
export type AgingBucketCode = (typeof AgingBucketCodes)[number];

export const Uow06FailureCodes = [
  'UOW06_EVALUATION_DATE_REQUIRED',
  'UOW06_SOURCE_FACTS_UNRESOLVED',
  'UOW06_INVOICE_NOT_OVERDUE',
  'UOW06_DUPLICATE_PENALTY',
  'UOW06_INVALID_PENALTY_STATUS',
  'UOW06_WAIVER_EXCEEDS_AVAILABLE_AMOUNT',
  'UOW06_WAIVER_ALREADY_APPLIED',
  'UOW06_REMINDER_SUPPRESSED',
  'UOW06_UNAUTHORIZED_ACCESS'
] as const;
export type Uow06FailureCode = (typeof Uow06FailureCodes)[number];

export interface OverdueEvaluationInput {
  invoiceId: string;
  invoiceStatus: 'Draft' | 'Issued' | 'Cancelled' | 'Voided' | 'Reissued';
  dueDate: string;
  resolvedGracePeriodDays: number;
  evaluationDate: string;
  openAmount: string;
}

export interface OverdueEvaluationResult {
  overdue: boolean;
  firstOverdueDate: string | null;
  agingDayCount: number;
  agingBucket: AgingBucketCode;
  openAmount: string;
}

export interface PenaltyDuplicateKey {
  invoiceId: string;
  responsibleBillingAccountId: string;
  penaltyChargeTypeId: string;
  penaltyPeriodKey: string;
}

export interface PenaltyBasisInput {
  eligiblePrincipalAmount: string;
  paymentEffectAmounts?: string[] | undefined;
  excludedPenaltyAmounts?: string[] | undefined;
}

export interface WaiverLimitInput {
  penaltyAmount: string;
  priorWaiverAmounts?: string[] | undefined;
  paymentEffectAmounts?: string[] | undefined;
  requestedWaiverAmount: string;
}

export interface ReminderDuplicateKey {
  reminderScopeType: 'Invoice' | 'BillingAccount';
  reminderScopeId: string;
  reminderPeriodKey: string;
}

export interface Uow06SafeFailure {
  ok: false;
  failureCode: Uow06FailureCode;
  reason: string;
  correlationId?: string;
}

export interface Uow06Success<T> {
  ok: true;
  value: T;
}

export type Uow06Result<T> = Uow06Success<T> | Uow06SafeFailure;
