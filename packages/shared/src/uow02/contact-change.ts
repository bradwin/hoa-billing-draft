import type { ContactChangePayload, ContactRequestStatus } from './types';

export const contactChangeAllowedFields = [
  'primaryEmail',
  'primaryPhone',
  'alternatePhone',
  'mailingAddress',
  'communicationPreference',
  'emergencyContactName',
  'emergencyContactPhone'
] as const;

const allowedFieldSet = new Set<string>(contactChangeAllowedFields);

export function assertContactChangePayloadAllowed(payload: Record<string, unknown>): ContactChangePayload {
  const forbidden = Object.keys(payload).filter((key) => !allowedFieldSet.has(key));
  if (forbidden.length > 0) {
    throw new Error(`Contact change payload contains disallowed fields: ${forbidden.join(', ')}`);
  }

  return payload as ContactChangePayload;
}

export function canDecideContactRequest(status: ContactRequestStatus): boolean {
  return status === 'Pending';
}

export function applyContactRequestDecision(
  status: ContactRequestStatus,
  decision: 'Approved' | 'Rejected'
): ContactRequestStatus {
  if (!canDecideContactRequest(status)) {
    throw new Error('Only Pending contact change requests can be approved or rejected');
  }

  return decision;
}
