import fc from 'fast-check';
import { createMoney, formatMoney, parseMoney } from '../../src/kernel/money';
import { moneyStringArb } from '../generators/domain-generators';
import { pbtOptions } from './pbt-setup';

describe('value object properties', () => {
  it('Money parse and format round-trip for valid PHP values', () => {
    fc.assert(
      fc.property(moneyStringArb, (amount) => {
        const money = createMoney(amount, 'PHP');
        expect(parseMoney(formatMoney(money))).toEqual(money);
      }),
      pbtOptions()
    );
  });
});
