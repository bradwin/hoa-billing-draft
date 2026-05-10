import { OwnershipService } from '../../src/modules/uow02/ownership.service';

const actor = {
  userId: 'user_12345678',
  role: 'BillingStaff',
  correlationId: 'corr_12345678',
  sessionId: 'sess_12345678'
} as any;

describe('OwnershipService', () => {
  it('closes the old primary owner on the transfer date and creates a billing account period for the responsible homeowner only', async () => {
    const repository = {
      findPropertyById: jest.fn().mockResolvedValue({
        id: 'property_1',
        ownershipPeriods: [{ id: 'old_ownership', role: 'PrimaryOwner', effectiveFrom: '2025-01-01', effectiveTo: null }]
      }),
      findHomeownerById: jest.fn().mockResolvedValue({ id: 'homeowner_2', status: 'Active' }),
      updateOwnershipPeriod: jest.fn().mockResolvedValue({}),
      createOwnershipPeriod: jest.fn().mockResolvedValue({ id: 'new_ownership' }),
      createBillingAccountPeriod: jest.fn().mockResolvedValue({ billingAccountRef: 'BA-new_ownership' })
    };
    const service = new OwnershipService(repository as any, { require: jest.fn() } as any, { record: jest.fn() } as any);

    await service.assignPrimary(actor, 'property_1', { homeownerId: 'homeowner_2', effectiveFrom: '2025-06-01' });

    expect(repository.updateOwnershipPeriod).toHaveBeenCalledWith(
      'old_ownership',
      expect.objectContaining({ effectiveTo: new Date('2025-06-01T00:00:00.000Z') })
    );
    expect(repository.createBillingAccountPeriod).toHaveBeenCalledWith(
      expect.objectContaining({ homeownerId: 'homeowner_2', ownershipPeriodId: 'new_ownership' })
    );
  });
});
