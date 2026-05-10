import { SecretEncryptionService } from '../../src/modules/mfa/secret-encryption.service';

describe('SecretEncryptionService', () => {
  it('round-trips encrypted secrets without storing plaintext', () => {
    const service = new SecretEncryptionService();
    const encrypted = service.encrypt('totp-secret', 'test-key-material');
    expect(encrypted).not.toContain('totp-secret');
    expect(service.decrypt(encrypted, 'test-key-material')).toBe('totp-secret');
  });
});
