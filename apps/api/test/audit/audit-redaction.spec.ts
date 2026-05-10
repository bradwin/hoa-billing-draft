import { redactSensitiveDetails } from '@hoa/shared';

describe('audit redaction', () => {
  it('redacts sensitive metadata keys', () => {
    expect(
      redactSensitiveDetails({
        password: 'secret',
        safeReason: 'attempted login'
      })
    ).toEqual({
      password: '[REDACTED]',
      safeReason: 'attempted login'
    });
  });
});
