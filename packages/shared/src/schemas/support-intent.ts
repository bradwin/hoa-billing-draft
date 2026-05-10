import { z } from 'zod';
import { correlationIdSchema, resourceRefSchema, safeMetadataSchema } from './common';

export const supportIntentTypeSchema = z.enum(['Notification', 'Document', 'Storage', 'Job']);
export const supportIntentStatusSchema = z.enum(['Pending', 'Completed', 'Failed', 'Cancelled', 'Scheduled', 'Running']);

export const createSupportIntentSchema = z.object({
  type: supportIntentTypeSchema,
  purpose: z.string().min(3).max(120).regex(/^[A-Z0-9_.-]+$/i),
  sourceRef: resourceRefSchema.optional(),
  recipientRef: resourceRefSchema.optional(),
  payload: safeMetadataSchema,
  correlationId: correlationIdSchema
});
