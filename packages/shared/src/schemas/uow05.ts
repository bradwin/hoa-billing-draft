import { z } from 'zod';
import { pageRequestSchema, safeTextSchema } from './common';
import { PaymentIntentStatuses, PaymentProofStatuses, PaymentStatuses } from '../uow05';

const isoDateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const moneySchema = z.string().regex(/^(0|[1-9]\d*)(\.\d{1,2})?$/);

export const paymentProofStatusSchema = z.enum(PaymentProofStatuses);
export const paymentStatusSchema = z.enum(PaymentStatuses);
export const paymentIntentStatusSchema = z.enum(PaymentIntentStatuses);

export const allocationTargetSchema = z.object({
  invoiceId: z.string().uuid(),
  invoiceLineId: z.string().uuid().optional(),
  componentType: z.enum(['Penalty', 'Fee', 'Dues', 'RegularCharge', 'ManualCharge']),
  openAmount: moneySchema,
  amount: moneySchema
});

export const paymentProofSubmissionSchema = z.object({
  homeownerId: z.string().uuid(),
  billingAccountId: z.string().min(1).max(120),
  propertyId: z.string().uuid().optional(),
  amount: moneySchema,
  paymentDate: isoDateOnlySchema,
  paymentMethodKey: safeTextSchema.max(80),
  externalReference: z.string().trim().max(120).optional(),
  targetInvoiceIds: z.array(z.string().uuid()).max(25).default([]),
  attachmentIntentRef: z.string().trim().max(200).optional()
});

export const proofDecisionSchema = z.object({
  reason: safeTextSchema.max(1000)
});

export const paymentPostingSchema = z.object({
  paymentProofId: z.string().uuid().optional(),
  homeownerId: z.string().uuid(),
  billingAccountId: z.string().min(1).max(120),
  propertyId: z.string().uuid().optional(),
  amount: moneySchema,
  paymentDate: isoDateOnlySchema,
  paymentMethodKey: safeTextSchema.max(80),
  externalReference: z.string().trim().max(120).optional(),
  allocations: z.array(allocationTargetSchema).max(100).default([]),
  creditRemainder: moneySchema.default('0.00'),
  duplicateOverrideReason: z.string().trim().max(1000).optional()
});

export const creditApplicationSchema = z.object({
  invoiceId: z.string().uuid(),
  invoiceLineId: z.string().uuid().optional(),
  componentType: z.enum(['Penalty', 'Fee', 'Dues', 'RegularCharge', 'ManualCharge']),
  amount: moneySchema,
  reason: safeTextSchema.max(1000)
});

export const reversalRequestSchema = z.object({
  reason: safeTextSchema.max(1000),
  reversalEffectiveDate: isoDateOnlySchema,
  approvalRequestId: z.string().uuid().optional()
});

export const financialCorrectionSchema = z.object({
  correctionType: z.enum(['Payment', 'Allocation', 'Credit', 'Receipt', 'OpeningBalance']),
  sourceRecordType: safeTextSchema.max(80),
  sourceRecordId: z.string().min(1).max(120),
  amount: moneySchema,
  effectiveDate: isoDateOnlySchema,
  reason: safeTextSchema.max(1000),
  approvalRequestId: z.string().uuid().optional()
});

export const receiptSupportIntentSchema = z.object({
  intentType: z.enum(['Document', 'Email', 'Storage']),
  recipientHomeownerId: z.string().uuid().optional(),
  templateReferenceVersionId: z.string().uuid().optional()
});

export const paymentListQuerySchema = pageRequestSchema.extend({
  status: paymentStatusSchema.optional(),
  billingAccountId: z.string().max(120).optional(),
  propertyId: z.string().uuid().optional(),
  homeownerId: z.string().uuid().optional()
});

export const paymentProofListQuerySchema = pageRequestSchema.extend({
  status: paymentProofStatusSchema.optional(),
  billingAccountId: z.string().max(120).optional(),
  homeownerId: z.string().uuid().optional()
});
