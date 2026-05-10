import { z } from 'zod';
import { emailSchema, idSchema, safeTextSchema } from './common';

export const roleSchema = z.enum([
  'SystemAdministrator',
  'Treasurer',
  'BillingStaff',
  'BoardMember',
  'Homeowner'
]);

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: roleSchema,
  displayName: safeTextSchema.max(120),
  targetRef: z.string().max(120).optional(),
  reason: safeTextSchema.max(500).optional()
});

export const activateInvitationSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8).max(256),
  displayName: safeTextSchema.max(120)
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(256)
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetCompleteSchema = z.object({
  token: z.string().min(32).max(256),
  newPassword: z.string().min(8).max(256)
});

export const sessionIdParamSchema = z.object({
  sessionId: idSchema
});

export const mfaChallengeSchema = z.object({
  code: z.string().regex(/^\d{6}$/)
});

export const mfaRecoveryCodeSchema = z.object({
  code: z.string().min(8).max(64)
});
