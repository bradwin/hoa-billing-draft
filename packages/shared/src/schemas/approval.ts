import { z } from 'zod';
import { correlationIdSchema, reasonSchema, resourceRefSchema, safeMetadataSchema } from './common';

export const approvalStatusSchema = z.enum([
  'Pending',
  'ApprovedPendingApply',
  'Rejected',
  'Cancelled',
  'Applied',
  'ApplyFailed'
]);

export const approvalActionTypeSchema = z.enum([
  'InvoiceVoid',
  'InvoiceCancel',
  'PaymentReverse',
  'PenaltyWaive',
  'WriteOff',
  'Adjustment',
  'OpeningBalanceImport',
  'DomainPlaceholder'
]);

export const createApprovalRequestSchema = z.object({
  targetRef: resourceRefSchema,
  actionType: approvalActionTypeSchema,
  reason: reasonSchema,
  payloadSnapshot: safeMetadataSchema,
  correlationId: correlationIdSchema
});

export const approvalDecisionSchema = z.object({
  decisionReason: reasonSchema,
  correlationId: correlationIdSchema
});
