import { addMoneyMinorUnits, assertInvoiceTransition, calculateInvoiceTotal, recurringDuplicateKey } from '../../src/uow04';

describe('UOW-04 shared domain helpers', () => {
  it('sums money with decimal-safe minor units', () => {
    expect(addMoneyMinorUnits(['10.10', '0.90', '2'])).toBe('13.00');
  });

  it('calculates invoice total from line amounts', () => {
    expect(calculateInvoiceTotal([
      { chargeTypeKey: 'dues', description: 'Dues', amount: '100.00' },
      { chargeTypeKey: 'manual-tax', description: 'Tax-like', amount: '5.25', isManual: true, isManualTaxLike: true, manualReason: 'permit fee' }
    ])).toEqual({ lineAmounts: ['100.00', '5.25'], totalAmount: '105.25' });
  });

  it('rejects invalid lifecycle transitions', () => {
    expect(() => assertInvoiceTransition('Issued', 'Draft')).toThrow('Invalid invoice status transition');
  });

  it('builds stable recurring duplicate key', () => {
    expect(recurringDuplicateKey({
      propertyId: 'p1',
      billingAccountId: 'ba1',
      chargeTypeKey: 'dues',
      billingPeriodKey: '2026-05',
      billingPeriodStart: '2026-05-01',
      billingPeriodEnd: '2026-06-01'
    })).toBe('p1|ba1|dues|2026-05');
  });
});
