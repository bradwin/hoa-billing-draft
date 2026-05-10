import fc from 'fast-check';
import { hasPermission, Permissions, Roles } from '@hoa/shared';

const pbtSeedOptions = process.env.PBT_SEED ? { seed: Number(process.env.PBT_SEED) } : undefined;

describe('authorization properties', () => {
  it('undefined permission strings never grant access', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 80 }), (permission) => {
        fc.pre(!Object.values(Permissions).includes(permission as never));
        expect(hasPermission(Roles.SystemAdministrator, permission)).toBe(false);
      }),
      pbtSeedOptions
    );
  });
});
