import fc from 'fast-check';
import { addMoneyMinorUnits, canTransitionInvoice, type InvoiceStatus } from '../../src/uow04';

describe('UOW-04 property tests', () => {
  it('invoice total is independent of line order', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 999_999 }), { minLength: 1, maxLength: 25 }), (cents) => {
        const values = cents.map((value) => `${Math.floor(value / 100)}.${String(value % 100).padStart(2, '0')}`);
        expect(addMoneyMinorUnits(values)).toBe(addMoneyMinorUnits([...values].reverse()));
      })
    );
  });

  it('terminal statuses do not transition', () => {
    fc.assert(
      fc.property(fc.constantFrom<InvoiceStatus>('Cancelled', 'Voided', 'Reissued'), fc.constantFrom<InvoiceStatus>('Draft', 'Issued', 'Cancelled', 'Voided', 'Reissued'), (from, to) => {
        expect(canTransitionInvoice(from, to)).toBe(false);
      })
    );
  });
});
