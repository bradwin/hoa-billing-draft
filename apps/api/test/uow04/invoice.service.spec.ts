import { InvoiceService } from '../../src/modules/uow04/invoice.service';

const actor = { userId: 'user-1', role: 'BillingStaff', correlationId: 'corr-1' };

describe('InvoiceService', () => {
  it('creates manual draft through repository and audit', async () => {
    const repository = {
      createManualDraft: jest.fn().mockResolvedValue({ id: 'invoice-1' })
    };
    const service = new InvoiceService(
      repository as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any,
      {} as any,
      {} as any
    );

    await expect(service.createManualDraft(actor as any, {
      propertyId: '11111111-1111-4111-8111-111111111111',
      billingAccountId: 'BA-1',
      responsibleHomeownerId: '22222222-2222-4222-8222-222222222222',
      dueDate: '2026-05-31',
      reason: 'special assessment',
      lines: [{ chargeTypeKey: 'assessment', description: 'Assessment', amount: '100.00', isManual: true, manualReason: 'approved' }]
    })).resolves.toEqual({ id: 'invoice-1' });
    expect(repository.createManualDraft).toHaveBeenCalledWith(expect.objectContaining({ totalAmount: '100.00' }), expect.any(Array));
  });

  it('returns per-invoice issuance failures without throwing whole batch', async () => {
    const service = new InvoiceService(
      { issueInvoice: jest.fn().mockRejectedValue(new Error('Only draft invoices can be issued')) } as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any,
      {} as any,
      {} as any
    );
    await expect(service.issue(actor as any, {
      invoiceIds: ['11111111-1111-4111-8111-111111111111'],
      issueDate: '2026-05-10'
    })).resolves.toEqual({ results: [{ invoiceId: '11111111-1111-4111-8111-111111111111', ok: false, reason: 'Only draft invoices can be issued' }] });
  });
});
