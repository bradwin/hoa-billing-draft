import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SafeErrorBanner } from '../../src/features/shell/SafeErrorBanner';

describe('SafeErrorBanner', () => {
  it('renders safe message and correlation ID', () => {
    render(<SafeErrorBanner error={{ code: 'X', message: 'Safe message', correlationId: 'corr_12345678' }} />);
    expect(screen.getByTestId('safe-error-banner')).toHaveTextContent('Safe message');
    expect(screen.getByTestId('safe-error-banner')).toHaveTextContent('corr_12345678');
  });
});
