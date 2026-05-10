import type { IsoDateString } from '../kernel/types';

export const HomeownerStatuses = ['Active', 'Inactive', 'Deceased', 'Archived'] as const;
export type HomeownerStatus = (typeof HomeownerStatuses)[number];

export const PropertyBillingStatuses = ['Billable', 'NonBillable', 'Exempt', 'CommonArea'] as const;
export type PropertyBillingStatus = (typeof PropertyBillingStatuses)[number];

export const PropertyLifecycleStatuses = ['Active', 'Archived'] as const;
export type PropertyLifecycleStatus = (typeof PropertyLifecycleStatuses)[number];

export const OwnershipRoles = ['PrimaryOwner', 'SecondaryOwner', 'AuthorizedRepresentative'] as const;
export type OwnershipRole = (typeof OwnershipRoles)[number];

export const ContactRequestStatuses = ['Pending', 'Approved', 'Rejected'] as const;
export type ContactRequestStatus = (typeof ContactRequestStatuses)[number];

export const BillingAccountPeriodStatuses = ['Active', 'Closed'] as const;
export type BillingAccountPeriodStatus = (typeof BillingAccountPeriodStatuses)[number];

export const BillableValidationReasonCodes = [
  'PROPERTY_NOT_BILLABLE',
  'PROPERTY_ARCHIVED',
  'LOT_AREA_MISSING',
  'LOT_AREA_ZERO_OR_NEGATIVE',
  'PRIMARY_OWNER_MISSING',
  'PRIMARY_OWNER_MULTIPLE',
  'PRIMARY_OWNER_ARCHIVED',
  'BILLING_ACCOUNT_PERIOD_MISSING',
  'BILLING_ACCOUNT_PERIOD_MULTIPLE',
  'HOMEOWNER_NOT_ACTIVE'
] as const;

export type BillableValidationReasonCode = (typeof BillableValidationReasonCodes)[number];

export interface HalfOpenDateInterval {
  effectiveFrom: IsoDateString;
  effectiveTo?: IsoDateString | null;
}

export interface BillableValidationFacts {
  propertyBillingStatus: PropertyBillingStatus;
  propertyLifecycleStatus: PropertyLifecycleStatus;
  lotAreaSqm?: string | null;
  primaryOwnerCount: number;
  responsibleHomeownerStatus?: HomeownerStatus | null;
  billingAccountPeriodCount: number;
}

export interface BillableValidationResult {
  isValid: boolean;
  reasonCodes: BillableValidationReasonCode[];
}

export interface ContactChangePayload {
  primaryEmail?: string;
  primaryPhone?: string;
  alternatePhone?: string;
  mailingAddress?: string;
  communicationPreference?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
