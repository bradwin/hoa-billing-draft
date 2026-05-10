import { z } from 'zod';
import { emailSchema, idSchema, pageRequestSchema, safeTextSchema } from './common';
import {
  ContactRequestStatuses,
  HomeownerStatuses,
  OwnershipRoles,
  PropertyBillingStatuses,
  PropertyLifecycleStatuses
} from '../uow02';

const optionalContactText = z.string().trim().max(500).optional();
const isoDateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const lotAreaSchema = z.string().regex(/^\d+(\.\d{1,4})?$/);

export const homeownerStatusSchema = z.enum(HomeownerStatuses);
export const propertyBillingStatusSchema = z.enum(PropertyBillingStatuses);
export const propertyLifecycleStatusSchema = z.enum(PropertyLifecycleStatuses);
export const ownershipRoleSchema = z.enum(OwnershipRoles);
export const contactRequestStatusSchema = z.enum(ContactRequestStatuses);

export const homeownerContactSchema = z.object({
  primaryEmail: emailSchema.optional(),
  primaryPhone: optionalContactText,
  alternatePhone: optionalContactText,
  mailingAddress: optionalContactText,
  communicationPreference: optionalContactText,
  emergencyContactName: optionalContactText,
  emergencyContactPhone: optionalContactText
});

export const createHomeownerSchema = z.object({
  legalName: safeTextSchema.max(200),
  status: homeownerStatusSchema.default('Active'),
  contact: homeownerContactSchema.default({}),
  notes: z.string().trim().max(2000).optional(),
  duplicateOverrideReason: z.string().trim().max(1000).optional()
});

export const updateHomeownerSchema = createHomeownerSchema.partial().extend({
  status: homeownerStatusSchema.optional()
});

export const homeownerSearchSchema = pageRequestSchema.extend({
  name: z.string().trim().max(120).optional(),
  homeownerCode: z.string().trim().max(40).optional(),
  email: emailSchema.optional(),
  mobile: z.string().trim().max(40).optional(),
  status: homeownerStatusSchema.optional(),
  propertyRef: z.string().trim().max(120).optional()
});

export const createPropertySchema = z.object({
  phaseOrSection: safeTextSchema.max(80),
  block: safeTextSchema.max(80),
  lot: safeTextSchema.max(80),
  street: safeTextSchema.max(160),
  houseNumber: z.string().trim().max(80).optional(),
  lotAreaSqm: lotAreaSchema,
  propertyType: safeTextSchema.max(80),
  occupancyStatus: safeTextSchema.max(80),
  billingStatus: propertyBillingStatusSchema.default('Billable'),
  lifecycleStatus: propertyLifecycleStatusSchema.default('Active'),
  notes: z.string().trim().max(2000).optional()
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertySearchSchema = pageRequestSchema.extend({
  propertyCode: z.string().trim().max(40).optional(),
  phaseOrSection: z.string().trim().max(80).optional(),
  block: z.string().trim().max(80).optional(),
  lot: z.string().trim().max(80).optional(),
  street: z.string().trim().max(160).optional(),
  houseNumber: z.string().trim().max(80).optional(),
  billingStatus: propertyBillingStatusSchema.optional(),
  lifecycleStatus: propertyLifecycleStatusSchema.optional(),
  alias: z.string().trim().max(160).optional()
});

export const propertyAliasSchema = z.object({
  aliasType: safeTextSchema.max(80),
  aliasValue: safeTextSchema.max(200)
});

export const ownershipTransferSchema = z.object({
  homeownerId: idSchema,
  role: ownershipRoleSchema.default('PrimaryOwner'),
  effectiveFrom: isoDateOnlySchema,
  remarks: z.string().trim().max(1000).optional()
});

export const billableValidationQuerySchema = z.object({
  validationDate: isoDateOnlySchema
});

export const contactChangePayloadSchema = homeownerContactSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one contact field is required');

export const submitContactChangeSchema = z.object({
  homeownerId: idSchema,
  requestedChanges: contactChangePayloadSchema,
  remarks: z.string().trim().max(1000).optional()
});

export const decideContactChangeSchema = z.object({
  remarks: z.string().trim().max(1000).optional()
});
