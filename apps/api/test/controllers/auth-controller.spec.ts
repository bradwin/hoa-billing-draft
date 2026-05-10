import { loginSchema } from '@hoa/shared';

describe('AuthController validation boundary', () => {
  it('rejects invalid login payloads before service dispatch', () => {
    expect(() => loginSchema.parse({ email: 'not-email', password: 'x' })).toThrow();
  });
});
