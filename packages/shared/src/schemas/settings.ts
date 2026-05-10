import { z } from 'zod';
import { reasonSchema, safeTextSchema } from './common';

export const settingCategorySchema = z.enum([
  'hoa_profile',
  'billing_rules',
  'numbering',
  'smtp',
  'storage',
  'document_templates',
  'payment_methods'
]);

export const uow01SettingKeySchema = z.enum([
  'hoa_profile.name',
  'hoa_profile.legal_name',
  'hoa_profile.address',
  'hoa_profile.contact_email',
  'hoa_profile.contact_phone'
]);

export const hoaProfileSchema = z.object({
  name: safeTextSchema.max(160),
  legalName: safeTextSchema.max(200).optional(),
  address: safeTextSchema.max(300),
  contactEmail: z.string().email().max(254),
  contactPhone: z.string().max(40).optional()
});

export const updateSettingSchema = z.object({
  key: uow01SettingKeySchema,
  value: z.union([safeTextSchema.max(500), hoaProfileSchema]),
  reason: reasonSchema
});
