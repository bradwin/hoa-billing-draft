import { updateSettingSchema } from '@hoa/shared';
import { DELEGATED_SETTING_CATEGORIES } from '../../src/modules/settings/settings.service';

describe('settings', () => {
  it('rejects unknown setting keys', () => {
    expect(() =>
      updateSettingSchema.parse({
        key: 'billing_rules.rate',
        value: '100',
        reason: 'Not owned by foundation'
      })
    ).toThrow();
  });

  it('keeps delegated categories visible without owning their values', () => {
    expect(DELEGATED_SETTING_CATEGORIES).toContain('smtp');
    expect(DELEGATED_SETTING_CATEGORIES).toContain('storage');
  });
});
