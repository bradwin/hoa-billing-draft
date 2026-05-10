import { AbuseProtectionService } from '../../src/modules/auth/abuse-protection.service';

describe('AbuseProtectionService', () => {
  it('uses generic auth failures', () => {
    expect(new AbuseProtectionService().genericAuthFailure()).toEqual({
      code: 'AUTH_GENERIC_FAILURE',
      message: 'Invalid credentials or account state'
    });
  });

  it('locks after repeated failures', () => {
    const result = new AbuseProtectionService().calculateFailurePolicy(10, new Date('2026-01-01T00:00:00Z'));
    expect(result.lockedUntil?.toISOString()).toBe('2026-01-01T00:30:00.000Z');
  });
});
