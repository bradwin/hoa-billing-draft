import { z } from 'zod';

export const idSchema = z.string().min(8).max(80).regex(/^[A-Za-z0-9_-]+$/);
export const correlationIdSchema = z.string().min(8).max(120).regex(/^[A-Za-z0-9_-]+$/);
export const emailSchema = z.string().email().max(254).transform((value) => value.toLowerCase());
const baseSafeTextSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[^<>]*$/, { message: 'HTML-like characters are not allowed' });

export const safeTextSchema = baseSafeTextSchema.max(500);
export const reasonSchema = baseSafeTextSchema.max(1000);
export const isoDateSchema = z.string().datetime();
export const resourceTypeSchema = z.enum([
  'User',
  'Invitation',
  'Session',
  'MfaEnrollment',
  'AuditEntry',
  'ApprovalRequest',
  'Setting',
  'SupportIntent',
  'BillingAccount',
  'Property',
  'Homeowner'
]);

export const resourceRefSchema = z.object({
  resourceType: resourceTypeSchema,
  resourceId: idSchema,
  ownerScope: z.string().max(80).optional()
});

export const pageRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
  sort: z.string().max(80).optional()
});

export const safeMetadataSchema = z.record(z.unknown()).superRefine((value, context) => {
  const forbidden = ['password', 'token', 'session', 'secret', 'mfa', 'recovery', 'authorization'];
  for (const key of Object.keys(value)) {
    if (forbidden.some((part) => key.toLowerCase().includes(part))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Sensitive key is not allowed in metadata: ${key}`
      });
    }
  }
});
