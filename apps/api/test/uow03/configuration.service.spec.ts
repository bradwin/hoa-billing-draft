import { ConfigurationService } from '../../src/modules/uow03/configuration.service';

const actor = { userId: 'u1', role: 'BillingStaff', permissions: ['uow03.config.read', 'uow03.config.manage', 'uow03.config.activate'], correlationId: 'corr-uow03' };

describe('UOW-03 configuration service', () => {
  function service(overrides: Record<string, any> = {}) {
    const repository = {
      findDrafts: jest.fn().mockResolvedValue([]),
      countDrafts: jest.fn().mockResolvedValue(0),
      createDraft: jest.fn().mockImplementation(async (data) => ({ id: 'draft-1', status: 'Draft', ...data })),
      updateDraft: jest.fn().mockImplementation(async (id, data) => ({ id, ...data })),
      findDraftById: jest.fn().mockResolvedValue({ id: 'draft-1', status: 'PendingApproval', requiresTreasurerApproval: true, configurationType: 'DuesRate', identityKey: 'dues', scopeKey: 'hoa-default', ruleType: 'rate', effectiveFrom: new Date('2025-01-01'), effectiveTo: null, payload: { ratePerSqm: '10.0000' }, approvalRequestId: 'approval-1', correlationId: 'corr-uow03' }),
      activateDraft: jest.fn().mockResolvedValue({ id: 'version-1', sourceDraftId: 'draft-1' }),
      findVersions: jest.fn().mockResolvedValue([]),
      findCoveringVersions: jest.fn().mockResolvedValue([]),
      ...overrides.repository
    };
    return {
      repository,
      instance: new ConfigurationService(
        repository as any,
        { require: jest.fn().mockResolvedValue(undefined) } as any,
        { record: jest.fn().mockResolvedValue({}) } as any,
        { assertCanActivate: jest.fn().mockResolvedValue(undefined) } as any,
        { createRequest: jest.fn().mockResolvedValue({ id: 'approval-1' }) } as any
      )
    };
  }

  it('creates configuration drafts without downstream side effects', async () => {
    const { instance, repository } = service();

    const result = await instance.createDraft(actor as any, {
      configurationType: 'DuesRate',
      identityKey: 'dues',
      scopeKey: 'hoa-default',
      ruleType: 'rate',
      effectiveFrom: '2025-01-01',
      payload: { ratePerSqm: '10.0000' }
    });

    expect(repository.createDraft).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'draft-1', configurationType: 'DuesRate' });
    expect((repository as any).createInvoice).toBeUndefined();
  });

  it('requires approval before activation when draft requires approval', async () => {
    const { instance } = service({
      repository: {
        findDraftById: jest.fn().mockResolvedValue({ id: 'draft-1', status: 'Draft', requiresTreasurerApproval: true })
      }
    });

    await expect(instance.activate(actor as any, 'draft-1', {})).rejects.toThrow(/approval is required/i);
  });

  it('fails closed for missing resolution', async () => {
    const { instance } = service();

    await expect(
      instance.resolve(actor as any, {
        configurationType: 'DuesRate',
        identityKey: 'dues',
        scopeKey: 'hoa-default',
        ruleType: 'rate',
        resolutionDate: '2025-01-01'
      })
    ).resolves.toMatchObject({ ok: false, failureCode: 'CONFIGURATION_MISSING' });
  });
});
