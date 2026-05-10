import { Uow06Controller } from '../../src/modules/uow06/uow06.controller';

describe('UOW-06 integration boundary contracts', () => {
  it('routes reminder work through intent endpoints instead of delivery endpoints', () => {
    const service = {
      listAging: jest.fn(),
      evaluateOverdue: jest.fn(),
      listPenalties: jest.fn(),
      generatePenaltyCandidates: jest.fn(),
      applyPenalties: jest.fn(),
      requestPenaltyLifecycle: jest.fn(),
      requestWaiver: jest.fn(),
      decideWaiver: jest.fn(),
      listReminderEligibility: jest.fn(),
      evaluateReminderEligibility: jest.fn(),
      createReminderIntents: jest.fn()
    };
    const controller = new Uow06Controller(service as any);
    expect(controller).toHaveProperty('createReminderIntents');
    expect(controller).not.toHaveProperty('sendReminderEmail');
    expect(controller).not.toHaveProperty('renderReminderDocument');
  });
});
