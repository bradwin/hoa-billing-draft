import { ContactChangeService } from '../../src/modules/uow02/contact-change.service';

const actor = {
  userId: 'user_12345678',
  role: 'BillingStaff',
  correlationId: 'corr_12345678',
  sessionId: 'sess_12345678'
} as any;

describe('ContactChangeService', () => {
  function serviceWith(request: Record<string, any>) {
    const repository = {
      findHomeownerById: jest.fn().mockResolvedValue({
        id: 'homeowner_1',
        primaryEmail: 'old@example.com'
      }),
      createContactChangeRequest: jest.fn().mockResolvedValue({ id: 'request_1', homeownerId: 'homeowner_1' }),
      findContactChangeRequest: jest.fn().mockResolvedValue(request),
      updateHomeowner: jest.fn().mockResolvedValue({ id: 'homeowner_1' }),
      updateContactChangeRequest: jest.fn().mockResolvedValue({ ...request, status: 'Approved' }),
      findContactChangeRequests: jest.fn().mockResolvedValue([])
    };
    const authorization = { require: jest.fn() };
    const audit = { record: jest.fn() };
    return {
      service: new ContactChangeService(repository as any, authorization as any, audit as any),
      repository
    };
  }

  it('rejects contact payloads that try to mutate legal or billing fields', async () => {
    const { service } = serviceWith({});

    await expect(
      service.submit(actor, {
        homeownerId: 'homeowner_1',
        requestedChanges: { legalName: 'Not allowed' }
      })
    ).rejects.toThrow();
  });

  it('does not mutate homeowner contact fields when a request is rejected', async () => {
    const request = {
      id: 'request_1',
      homeownerId: 'homeowner_1',
      status: 'Pending',
      newValues: { primaryEmail: 'new@example.com' }
    };
    const { service, repository } = serviceWith(request);

    await service.decide(actor, 'request_1', 'Rejected', {});

    expect(repository.updateHomeowner).not.toHaveBeenCalled();
  });

  it('prevents decisions for terminal requests', async () => {
    const { service } = serviceWith({
      id: 'request_1',
      homeownerId: 'homeowner_1',
      status: 'Approved',
      newValues: { primaryEmail: 'new@example.com' }
    });

    await expect(service.decide(actor, 'request_1', 'Rejected', {})).rejects.toThrow(/Only Pending/);
  });
});
