import { authorizeObject, hasPermission, Permissions, Roles } from '../../src/permissions';

describe('permission matrix', () => {
  it('denies unknown roles and permissions by default', () => {
    expect(hasPermission('Unknown', Permissions.USER_INVITE)).toBe(false);
    expect(hasPermission(Roles.SystemAdministrator, 'unknown.permission')).toBe(false);
  });

  it('does not grant Treasurer-only approval decision to Billing Staff', () => {
    expect(hasPermission(Roles.BillingStaff, Permissions.APPROVAL_DECIDE)).toBe(false);
    expect(hasPermission(Roles.Treasurer, Permissions.APPROVAL_DECIDE)).toBe(true);
  });

  it('denies homeowner access when ownership is missing', () => {
    const result = authorizeObject({
      actor: {
        userId: 'user_12345678',
        role: Roles.Homeowner,
        homeownerId: 'homeowner_1',
        correlationId: 'corr_12345678',
        sessionId: 'session_12345678'
      },
      resource: { resourceType: 'BillingAccount', resourceId: 'acct_12345678' },
      action: 'read',
      ownershipRefs: ['homeowner_2']
    });
    expect(result.allowed).toBe(false);
    expect(result.reasonCode).toBe('MISSING_OWNERSHIP');
  });
});
