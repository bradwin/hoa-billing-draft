import { NullSupportAdapter } from '../../src/modules/support-intents/null-support-adapter';

describe('NullSupportAdapter', () => {
  it('blocks real notification dispatch until UOW-08', async () => {
    await expect(new NullSupportAdapter().dispatch('Notification')).rejects.toThrow('disabled until UOW-08');
  });

  it('blocks real document dispatch until UOW-08', async () => {
    await expect(new NullSupportAdapter().dispatch('Document')).rejects.toThrow('disabled until UOW-08');
  });
});
