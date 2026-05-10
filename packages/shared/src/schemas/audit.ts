import { z } from 'zod';
import { correlationIdSchema, isoDateSchema, pageRequestSchema, resourceRefSchema, safeMetadataSchema } from './common';

export const auditCategorySchema = z.enum(['Security', 'Financial', 'System', 'Configuration', 'Import', 'Workflow']);
export const auditResultSchema = z.enum(['Success', 'Denied', 'Failed', 'Info']);

export const auditEntryInputSchema = z.object({
  category: auditCategorySchema,
  action: z.string().min(3).max(120).regex(/^[A-Z0-9_.-]+$/i),
  resourceRef: resourceRefSchema.optional(),
  correlationId: correlationIdSchema,
  result: auditResultSchema,
  reason: z.string().max(1000).optional(),
  metadata: safeMetadataSchema.optional()
});

export const auditQuerySchema = pageRequestSchema.extend({
  actorUserId: z.string().max(80).optional(),
  category: auditCategorySchema.optional(),
  action: z.string().max(120).optional(),
  resourceType: z.string().max(80).optional(),
  resourceId: z.string().max(80).optional(),
  correlationId: correlationIdSchema.optional(),
  from: isoDateSchema,
  to: isoDateSchema
});
