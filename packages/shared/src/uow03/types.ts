export const ConfigurationTypes = [
  'DuesRate',
  'BillingCycle',
  'DueDate',
  'GracePeriod',
  'Rounding',
  'ChargeType',
  'NumberingFormat',
  'TemplateReference',
  'PaymentMethod'
] as const;

export type ConfigurationType = (typeof ConfigurationTypes)[number];

export const ConfigurationDraftStatuses = ['Draft', 'PendingApproval', 'Rejected', 'Activated'] as const;
export type ConfigurationDraftStatus = (typeof ConfigurationDraftStatuses)[number];

export const ConfigurationVersionStatuses = ['Active', 'Superseded', 'Retired'] as const;
export type ConfigurationVersionStatus = (typeof ConfigurationVersionStatuses)[number];

export const BillingCycleTypes = ['Monthly', 'Quarterly', 'SemiAnnual', 'Annual', 'Custom'] as const;
export type BillingCycleType = (typeof BillingCycleTypes)[number];

export const DueDateBaseTypes = ['BillingPeriodStart', 'BillingPeriodEnd', 'InvoiceIssueDate'] as const;
export type DueDateBaseType = (typeof DueDateBaseTypes)[number];

export const RoundingTimings = ['LineLevel', 'InvoiceTotalLevel'] as const;
export type RoundingTiming = (typeof RoundingTimings)[number];

export const ChargeCategories = ['Dues', 'Assessment', 'ManualTaxLike', 'Fee', 'Discount', 'PenaltyConfig', 'Other'] as const;
export type ChargeCategory = (typeof ChargeCategories)[number];

export const ResolutionFailureCodes = [
  'CONFIGURATION_MISSING',
  'CONFIGURATION_AMBIGUOUS',
  'CONFIGURATION_DRAFT_ONLY',
  'CONFIGURATION_UNAUTHORIZED',
  'CONFIGURATION_INVALID_CONTEXT'
] as const;
export type ResolutionFailureCode = (typeof ResolutionFailureCodes)[number];

export interface EffectiveInterval {
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface ConfigurationIdentity {
  configurationType: ConfigurationType;
  identityKey: string;
  scopeKey: string;
  ruleType: string;
}

export interface ResolutionSnapshot<TPayload = Record<string, unknown>> extends ConfigurationIdentity, EffectiveInterval {
  configurationVersionId: string;
  approvalRequestId?: string | null;
  payload: TPayload;
  ruleMetadata: Record<string, unknown>;
}

export interface ResolutionResult<TPayload = Record<string, unknown>> {
  ok: boolean;
  snapshot?: ResolutionSnapshot<TPayload>;
  failureCode?: ResolutionFailureCode;
  reason?: string;
}
