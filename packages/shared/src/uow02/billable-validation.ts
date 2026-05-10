import type { BillableValidationFacts, BillableValidationReasonCode, BillableValidationResult } from './types';

export function evaluateBillableValidationFacts(facts: BillableValidationFacts): BillableValidationResult {
  const reasonCodes: BillableValidationReasonCode[] = [];

  if (facts.propertyBillingStatus !== 'Billable') {
    reasonCodes.push('PROPERTY_NOT_BILLABLE');
  }

  if (facts.propertyLifecycleStatus === 'Archived') {
    reasonCodes.push('PROPERTY_ARCHIVED');
  }

  if (facts.lotAreaSqm == null || facts.lotAreaSqm.trim() === '') {
    reasonCodes.push('LOT_AREA_MISSING');
  } else if (Number(facts.lotAreaSqm) <= 0) {
    reasonCodes.push('LOT_AREA_ZERO_OR_NEGATIVE');
  }

  if (facts.primaryOwnerCount === 0) {
    reasonCodes.push('PRIMARY_OWNER_MISSING');
  } else if (facts.primaryOwnerCount > 1) {
    reasonCodes.push('PRIMARY_OWNER_MULTIPLE');
  }

  if (facts.responsibleHomeownerStatus === 'Archived') {
    reasonCodes.push('PRIMARY_OWNER_ARCHIVED');
  }

  if (facts.responsibleHomeownerStatus != null && facts.responsibleHomeownerStatus !== 'Active') {
    reasonCodes.push('HOMEOWNER_NOT_ACTIVE');
  }

  if (facts.billingAccountPeriodCount === 0) {
    reasonCodes.push('BILLING_ACCOUNT_PERIOD_MISSING');
  } else if (facts.billingAccountPeriodCount > 1) {
    reasonCodes.push('BILLING_ACCOUNT_PERIOD_MULTIPLE');
  }

  return {
    isValid: reasonCodes.length === 0,
    reasonCodes
  };
}
