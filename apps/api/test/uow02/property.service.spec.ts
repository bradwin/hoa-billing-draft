import { PropertyService } from '../../src/modules/uow02/property.service';

const actor = {
  userId: 'user_12345678',
  role: 'BillingStaff',
  correlationId: 'corr_12345678',
  sessionId: 'sess_12345678'
} as any;

describe('PropertyService', () => {
  it('validates billable property facts using validationDate and effective periods', async () => {
    const repository = {
      findPropertyById: jest.fn().mockResolvedValue({
        id: 'property_1',
        billingStatus: 'Billable',
        lifecycleStatus: 'Active',
        lotAreaSqm: '100.0000',
        ownershipPeriods: [
          {
            id: 'ownership_1',
            role: 'PrimaryOwner',
            effectiveFrom: '2025-01-01',
            effectiveTo: null,
            homeowner: { id: 'homeowner_1', status: 'Active' }
          }
        ],
        billingAccountPeriods: [
          {
            billingAccountRef: 'BA-1',
            effectiveFrom: '2025-01-01',
            effectiveTo: null
          }
        ]
      })
    };
    const service = new PropertyService(
      repository as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any
    );

    await expect(service.validateBillable(actor, 'property_1', { validationDate: '2025-06-01' })).resolves.toMatchObject({
      isValid: true,
      primaryHomeownerId: 'homeowner_1',
      billingAccountId: 'BA-1'
    });
  });

  it('fails validation when the responsible homeowner is not active', async () => {
    const repository = {
      findPropertyById: jest.fn().mockResolvedValue({
        id: 'property_1',
        billingStatus: 'Billable',
        lifecycleStatus: 'Active',
        lotAreaSqm: '100.0000',
        ownershipPeriods: [
          {
            role: 'PrimaryOwner',
            effectiveFrom: '2025-01-01',
            effectiveTo: null,
            homeowner: { id: 'homeowner_1', status: 'Inactive' }
          }
        ],
        billingAccountPeriods: [{ billingAccountRef: 'BA-1', effectiveFrom: '2025-01-01', effectiveTo: null }]
      })
    };
    const service = new PropertyService(
      repository as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any
    );

    await expect(service.validateBillable(actor, 'property_1', { validationDate: '2025-06-01' })).resolves.toMatchObject({
      isValid: false,
      reasonCodes: ['HOMEOWNER_NOT_ACTIVE']
    });
  });
});
