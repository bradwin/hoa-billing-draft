import { AuthorizationService } from '../../src/modules/authorization/authorization.service';

describe('AuthorizationService', () => {
  const audit = { recordSecurityEvent: jest.fn() };
  const service = new AuthorizationService(audit as never);

  it('denies missing role-permission combinations', () => {
    expect(
      service.can(
        {
          userId: 'user_12345678',
          role: 'BillingStaff',
          correlationId: 'corr_12345678',
          sessionId: 'session_12345678'
        },
        'approval.decide'
      )
    ).toBe(false);
  });

  it('allows homeowner object access only with ownership refs', () => {
    const actor = {
      userId: 'user_12345678',
      role: 'Homeowner' as const,
      homeownerId: 'homeowner_123',
      correlationId: 'corr_12345678',
      sessionId: 'session_12345678'
    };
    expect(
      service.authorizeResource({
        actor,
        resource: { resourceType: 'BillingAccount', resourceId: 'acct_12345678' },
        action: 'read',
        ownershipRefs: ['homeowner_123']
      })
    ).toBe(true);
  });
});
