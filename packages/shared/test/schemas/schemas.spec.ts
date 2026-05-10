import { loginSchema } from '../../src/schemas/auth';
import { auditEntryInputSchema } from '../../src/schemas/audit';
import { updateSettingSchema } from '../../src/schemas/settings';

describe('shared schemas', () => {
  it('normalizes login email and rejects missing password', () => {
    const parsed = loginSchema.parse({ email: 'USER@EXAMPLE.COM', password: 'secret' });
    expect(parsed.email).toBe('user@example.com');
    expect(() => loginSchema.parse({ email: 'user@example.com', password: '' })).toThrow();
  });

  it('rejects sensitive audit metadata keys', () => {
    expect(() =>
      auditEntryInputSchema.parse({
        category: 'Security',
        action: 'AUTH.LOGIN',
        correlationId: 'corr_12345678',
        result: 'Denied',
        metadata: { rawSessionToken: 'never-log-this' }
      })
    ).toThrow();
  });

  it('rejects unknown UOW-01 setting keys', () => {
    expect(() =>
      updateSettingSchema.parse({
        key: 'smtp.password',
        value: 'secret',
        reason: 'Not owned by UOW-01'
      })
    ).toThrow();
  });
});
