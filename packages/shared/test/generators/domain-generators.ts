import fc from 'fast-check';
import { Permissions, Roles } from '../../src/permissions';

export const roleArb = fc.constantFrom(...Object.values(Roles));
export const permissionArb = fc.constantFrom(...Object.values(Permissions));
export const idArb = fc.stringMatching(/^[A-Za-z0-9_-]{8,32}$/);
export const correlationIdArb = fc.stringMatching(/^corr_[A-Za-z0-9_-]{8,32}$/);

export const actorContextArb = fc.record({
  userId: idArb,
  role: roleArb,
  homeownerId: fc.option(idArb, { nil: undefined }),
  correlationId: correlationIdArb,
  sessionId: idArb
});

export const resourceRefArb = fc.record({
  resourceType: fc.constantFrom('User', 'AuditEntry', 'ApprovalRequest', 'Setting', 'BillingAccount', 'Property', 'Homeowner'),
  resourceId: idArb,
  ownerScope: fc.option(fc.string({ minLength: 1, maxLength: 40 }), { nil: undefined })
});

export const moneyStringArb = fc
  .tuple(fc.integer({ min: 0, max: 999999 }), fc.integer({ min: 0, max: 99 }))
  .map(([whole, cents]) => `${whole}.${cents.toString().padStart(2, '0')}`);

export const approvalStatusArb = fc.constantFrom('Pending', 'ApprovedPendingApply', 'Rejected', 'Cancelled', 'Applied', 'ApplyFailed');

export const supportIntentArb = fc.record({
  type: fc.constantFrom('Notification', 'Document', 'Storage', 'Job'),
  purpose: fc.constantFrom('Invitation', 'PasswordReset', 'Invoice', 'Receipt', 'Statement'),
  correlationId: correlationIdArb,
  payload: fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.string({ maxLength: 40 }))
});

export const uow02HomeownerStatusArb = fc.constantFrom('Active', 'Inactive', 'Deceased', 'Archived');
export const uow02PropertyBillingStatusArb = fc.constantFrom('Billable', 'NonBillable', 'Exempt', 'CommonArea');
export const uow02ContactRequestStatusArb = fc.constantFrom('Pending', 'Approved', 'Rejected');
export const uow02DateOnlyArb = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .map((date) => date.toISOString().slice(0, 10));
