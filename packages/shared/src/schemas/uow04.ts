import { z } from 'zod';
import { pageRequestSchema, safeTextSchema } from './common';
import { BillingExceptionStatuses, InvoiceIntentStatuses, InvoiceOrigins, InvoiceStatuses } from '../uow04';

const isoDateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const moneySchema = z.string().regex(/^-?(0|[1-9]\d*)(\.\d{1,2})?$/);
const decimal4Schema = z.string().regex(/^(0|[1-9]\d*)(\.\d{1,4})?$/);

export const invoiceStatusSchema = z.enum(InvoiceStatuses);
export const invoiceOriginSchema = z.enum(InvoiceOrigins);
export const billingExceptionStatusSchema = z.enum(BillingExceptionStatuses);
export const invoiceIntentStatusSchema = z.enum(InvoiceIntentStatuses);

export const billingPeriodRefSchema = z.object({
  billingPeriodKey: safeTextSchema.max(80),
  billingPeriodStart: isoDateOnlySchema,
  billingPeriodEnd: isoDateOnlySchema
});

export const invoiceLineInputSchema = z.object({
  chargeTypeKey: safeTextSchema.max(80),
  description: safeTextSchema.max(500),
  amount: moneySchema,
  quantity: decimal4Schema.optional(),
  lotArea: decimal4Schema.optional(),
  rate: decimal4Schema.optional(),
  isManual: z.boolean().default(false),
  isManualTaxLike: z.boolean().default(false),
  manualReason: z.string().trim().max(1000).optional()
}).refine(
  (value) => !value.isManualTaxLike || (value.isManual && Boolean(value.manualReason?.trim())),
  'Manual tax-like lines require manual flag and reason'
);

export const recurringGenerationSchema = billingPeriodRefSchema.extend({
  chargeTypeKey: safeTextSchema.max(80),
  scope: z.record(z.unknown()).default({ allBillable: true })
});

export const manualInvoiceDraftSchema = z.object({
  propertyId: z.string().uuid(),
  billingAccountId: z.string().min(1).max(120),
  responsibleHomeownerId: z.string().uuid(),
  dueDate: isoDateOnlySchema,
  reason: safeTextSchema.max(1000),
  lines: z.array(invoiceLineInputSchema).min(1).max(100)
});

export const issueInvoicesSchema = z.object({
  invoiceIds: z.array(z.string().uuid()).min(1).max(100),
  issueDate: isoDateOnlySchema
});

export const cancelDraftInvoiceSchema = z.object({
  reason: safeTextSchema.max(1000)
});

export const lifecycleRequestSchema = z.object({
  reason: safeTextSchema.max(1000),
  approvalRequestId: z.string().uuid().optional()
});

export const supportIntentSchema = z.object({
  intentType: z.enum(['Document', 'Email']),
  recipientHomeownerId: z.string().uuid().optional(),
  templateReferenceVersionId: z.string().uuid().optional()
});

export const invoiceListQuerySchema = pageRequestSchema.extend({
  status: invoiceStatusSchema.optional(),
  origin: invoiceOriginSchema.optional(),
  propertyId: z.string().uuid().optional(),
  billingAccountId: z.string().max(120).optional(),
  billingPeriodKey: z.string().max(80).optional()
});

export const billingExceptionListQuerySchema = pageRequestSchema.extend({
  status: billingExceptionStatusSchema.optional(),
  billingPeriodKey: z.string().max(80).optional(),
  propertyId: z.string().uuid().optional()
});
