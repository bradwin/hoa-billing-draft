import { supportDispatchEnabled } from '../src/jobs/support-intent-status';

describe('support intent worker mode', () => {
  it('keeps real dispatch disabled until UOW-08', () => {
    expect(supportDispatchEnabled()).toBe(false);
  });
});
