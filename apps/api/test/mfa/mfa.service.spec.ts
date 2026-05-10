import { MfaService } from '../../src/modules/mfa/mfa.service';
import { SecretEncryptionService } from '../../src/modules/mfa/secret-encryption.service';

describe('MfaService', () => {
  const audit = { recordSecurityEvent: jest.fn() };
  const service = new MfaService(new SecretEncryptionService(), audit as never);

  it('requires MFA for administrative financial roles', () => {
    expect(service.requiresMfa('SystemAdministrator')).toBe(true);
    expect(service.requiresMfa('Treasurer')).toBe(true);
    expect(service.requiresMfa('Homeowner')).toBe(false);
  });

  it('stores recovery codes only as hashes', () => {
    const generated = service.generateRecoveryCodes(2);
    expect(generated.rawCodes).toHaveLength(2);
    expect(generated.hashes).toHaveLength(2);
    expect(generated.hashes[0]).not.toBe(generated.rawCodes[0]);
  });

  it('does not allow self-service administrative MFA disablement', () => {
    expect(service.canSelfDisableAdministrativeMfa()).toBe(false);
  });
});
