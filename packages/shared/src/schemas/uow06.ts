import { z } from 'zod';
import { pageRequestSchema, safeTextSchema } from './common';
import { AgingBucketCodes, PenaltySourceStatuses, ReminderIntentStatuses, WaiverRequestStatuses } from '../uow06';

const isoDateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const moneySchema = z.string().regex(/^(0|[1-9]\d*)(\.\d{1,2})?$/);

export const penaltySourceStatusSchema = z.enum(PenaltySourceStatuses);
export const waiverRequestStatusSchema = z.enum(WaiverRequestStatuses);
export const reminderIntentStatusSchema = z.enum(ReminderIntentStatuses);
export const agingBucketSchema = z.enum(AgingBucketCodes);

export const overdueEvaluationSchema = z.object({
  evaluationDate: isoDateOnlySchema,
  invoiceIds: z.array(z.string().uuid()).max(250).default([])
});

export const agingListQuerySchema = pageRequestSchema.extend({
  evaluationDate: isoDateOnlySchema,
  agingBucket: agingBucketSchema.optional(),
  billingAccountId: z.string().max(120).optional(),
  propertyId: z.string().uuid().optional()
});

export const penaltyCandidateGenerationSchema = z.object({
  evaluationDate: isoDateOnlySchema,
  invoiceIds: z.array(z.string().uuid()).max(250).default([]),
  penaltyChargeTypeId: z.string().min(1).max(120)
});

export const penaltyApplicationSchema = z.object({
  evaluationDate: isoDateOnlySchema,
  candidateIds: z.array(z.string().min(1).max(120)).min(1).max(250),
  reason: safeTextSchema.max(1000)
});

export const penaltyLifecycleSchema = z.object({
  reason: safeTextSchema.max(1000),
  approvalRequestId: z.string().uuid().optional()
});

export const waiverRequestSchema = z.object({
  penaltySourceRecordId: z.string().uuid(),
  waiverAmount: moneySchema.optional(),
  fullWaiver: z.boolean().default(false),
  reason: safeTextSchema.max(1000),
  waiverEffectiveDate: isoDateOnlySchema,
  approvalRequestId: z.string().uuid().optional()
}).refine((value) => value.fullWaiver || Boolean(value.waiverAmount), 'Waiver amount is required unless full waiver is selected');

export const waiverDecisionSchema = z.object({
  decision: z.enum(['Approved', 'Rejected']),
  reason: safeTextSchema.max(1000),
  approvalRequestId: z.string().uuid().optional()
});

export const reminderEligibilitySchema = z.object({
  evaluationDate: isoDateOnlySchema,
  scopeType: z.enum(['Invoice', 'BillingAccount']),
  scopeIds: z.array(z.string().min(1).max(120)).max(250).default([])
});

export const reminderIntentCreationSchema = z.object({
  reminderEligibilityIds: z.array(z.string().uuid()).min(1).max(250),
  templateReferenceVersionId: z.string().uuid().optional()
});

export const uow06ListQuerySchema = pageRequestSchema.extend({
  billingAccountId: z.string().max(120).optional(),
  propertyId: z.string().uuid().optional(),
  homeownerId: z.string().uuid().optional()
});
