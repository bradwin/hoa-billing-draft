import { z } from 'zod';
import { pageRequestSchema, safeTextSchema } from './common';
import {
  BillingCycleTypes,
  ChargeCategories,
  ConfigurationDraftStatuses,
  ConfigurationTypes,
  DueDateBaseTypes,
  RoundingTimings
} from '../uow03';

const isoDateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const decimal4Schema = z.string().regex(/^(0|[1-9]\d*)(\.\d{1,4})?$/);
const positiveIntSchema = z.number().int().min(0).max(3650);

export const configurationTypeSchema = z.enum(ConfigurationTypes);
export const configurationDraftStatusSchema = z.enum(ConfigurationDraftStatuses);

export const effectiveIntervalSchema = z.object({
  effectiveFrom: isoDateOnlySchema,
  effectiveTo: isoDateOnlySchema.nullish()
});

export const configurationIdentitySchema = z.object({
  configurationType: configurationTypeSchema,
  identityKey: safeTextSchema.max(120),
  scopeKey: safeTextSchema.max(120).default('hoa-default'),
  ruleType: safeTextSchema.max(120)
});

export const duesRateRulePayloadSchema = z.object({
  ratePerSqm: decimal4Schema,
  currency: z.literal('PHP').default('PHP'),
  roundingRuleKey: safeTextSchema.max(120).default('default-half-up'),
  chargeTypeKey: safeTextSchema.max(120).default('dues')
});

export const billingCycleRulePayloadSchema = z.object({
  cycleType: z.enum(BillingCycleTypes),
  anchorDate: isoDateOnlySchema,
  customRule: z.record(z.unknown()).optional(),
  periodLabelFormat: safeTextSchema.max(120).default('YYYY-MM')
});

export const dueDateRulePayloadSchema = z.object({
  baseDateType: z.enum(DueDateBaseTypes),
  dayOffset: z.number().int().min(-365).max(365)
});

export const gracePeriodRulePayloadSchema = z.object({
  graceDays: positiveIntSchema
});

export const roundingRulePayloadSchema = z.object({
  roundingMode: z.literal('HalfUp').default('HalfUp'),
  moneyScale: z.literal(2).default(2),
  lotAreaScale: z.literal(4).default(4),
  rateScale: z.literal(4).default(4),
  roundingTiming: z.enum(RoundingTimings).default('LineLevel')
});

export const chargeTypePayloadSchema = z.object({
  code: safeTextSchema.max(80),
  name: safeTextSchema.max(160),
  category: z.enum(ChargeCategories),
  isRecurringEligible: z.boolean().default(false),
  isManualEntryEligible: z.boolean().default(false),
  isAutomaticGenerationEligible: z.boolean().default(false)
}).refine(
  (value) => value.category !== 'ManualTaxLike' || (value.isManualEntryEligible && !value.isAutomaticGenerationEligible),
  'Manual tax-like charge types must be manual-entry eligible and must not be automatic-generation eligible'
);

export const numberingFormatPayloadSchema = z.object({
  documentType: safeTextSchema.max(80),
  prefixTemplate: safeTextSchema.max(120),
  sequenceScope: safeTextSchema.max(80),
  padding: z.number().int().min(1).max(20),
  resetPolicy: safeTextSchema.max(80).default('Never')
});

export const templateReferencePayloadSchema = z.object({
  templateType: safeTextSchema.max(80),
  templateKey: safeTextSchema.max(160),
  versionLabel: safeTextSchema.max(80)
});

export const paymentMethodPayloadSchema = z.object({
  code: safeTextSchema.max(80),
  displayName: safeTextSchema.max(160),
  instructions: safeTextSchema.max(1000).optional(),
  referenceRequired: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0)
});

export const configurationPayloadSchema = z.union([
  duesRateRulePayloadSchema,
  billingCycleRulePayloadSchema,
  dueDateRulePayloadSchema,
  gracePeriodRulePayloadSchema,
  roundingRulePayloadSchema,
  chargeTypePayloadSchema,
  numberingFormatPayloadSchema,
  templateReferencePayloadSchema,
  paymentMethodPayloadSchema
]);

export const createConfigurationDraftSchema = configurationIdentitySchema.extend({
  effectiveFrom: isoDateOnlySchema,
  effectiveTo: isoDateOnlySchema.nullish(),
  payload: configurationPayloadSchema,
  requiresTreasurerApproval: z.boolean().default(true),
  remarks: z.string().trim().max(1000).optional()
});

export const updateConfigurationDraftSchema = z.object({
  effectiveFrom: isoDateOnlySchema.optional(),
  effectiveTo: isoDateOnlySchema.nullish(),
  payload: configurationPayloadSchema.optional(),
  remarks: z.string().trim().max(1000).optional()
});

export const submitConfigurationDraftSchema = z.object({
  reason: safeTextSchema.max(1000)
});

export const activateConfigurationDraftSchema = z.object({
  approvalRequestId: z.string().uuid().optional(),
  reason: safeTextSchema.max(1000).optional()
});

export const configurationListQuerySchema = pageRequestSchema.extend({
  configurationType: configurationTypeSchema.optional(),
  status: configurationDraftStatusSchema.optional(),
  scopeKey: z.string().trim().max(120).optional()
});

export const resolutionQuerySchema = configurationIdentitySchema.extend({
  resolutionDate: isoDateOnlySchema
});
