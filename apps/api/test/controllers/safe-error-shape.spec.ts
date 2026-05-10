import { DomainExceptionFilter } from '../../src/common/domain-exception.filter';

describe('DomainExceptionFilter', () => {
  it('is defined for global safe error handling', () => {
    expect(new DomainExceptionFilter()).toBeDefined();
  });
});
