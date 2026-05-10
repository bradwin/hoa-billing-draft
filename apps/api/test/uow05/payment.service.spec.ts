import { PaymentService } from '../../src/modules/uow05/payment.service';

const actor = { userId: 'user-1', role: 'BillingStaff', correlationId: 'corr-1' };

describe('PaymentService', () => {
  it('submits payment proof through repository and audit', async () => {
    const repository = {
      createPaymentProof: jest.fn().mockResolvedValue({ id: 'proof-1' })
    };
    const service = new PaymentService(
      repository as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any,
      {} as any,
      {} as any
    );

    await expect(service.submitProof(actor as any, {
      homeownerId: '11111111-1111-4111-8111-111111111111',
      billingAccountId: 'BA-1',
      amount: '100.00',
      paymentDate: '2026-05-10',
      paymentMethodKey: 'bank',
      targetInvoiceIds: []
    })).resolves.toEqual({ id: 'proof-1' });
    expect(repository.createPaymentProof).toHaveBeenCalledWith(expect.objectContaining({ status: 'Submitted', amount: '100.00' }));
  });

  it('blocks duplicate payment risk without override reason', async () => {
    const service = new PaymentService(
      {
        findDuplicatePaymentRisk: jest.fn().mockResolvedValue({ id: 'payment-1' }),
        findActiveDuplicateProof: jest.fn().mockResolvedValue(null)
      } as any,
      { require: jest.fn() } as any,
      { record: jest.fn() } as any,
      {} as any,
      {} as any
    );

    await expect(service.post(actor as any, {
      homeownerId: '11111111-1111-4111-8111-111111111111',
      billingAccountId: 'BA-1',
      amount: '100.00',
      paymentDate: '2026-05-10',
      paymentMethodKey: 'bank',
      allocations: [{ invoiceId: '22222222-2222-4222-8222-222222222222', componentType: 'Dues', openAmount: '100.00', amount: '100.00' }]
    })).rejects.toThrow(/Duplicate payment risk/);
  });
});
