import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  BillingConfigurationDashboard,
  ChargeTypeForm,
  ConfigurationResolutionPreview,
  RateRuleForm,
  toQuery
} from '../../src/features/uow03';

describe('UOW-03 frontend components', () => {
  it('serializes configuration filters', () => {
    expect(toQuery({ configurationType: 'DuesRate', page: 2, empty: undefined })).toBe('configurationType=DuesRate&page=2');
  });

  it('renders dashboard and version history stable test IDs', () => {
    render(<BillingConfigurationDashboard result={{ items: [], page: 1, pageSize: 25, totalItems: 0 }} />);

    expect(screen.getByTestId('billing-config-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('billing-config-version-history')).toBeInTheDocument();
  });

  it('renders rate form without JSON-only editing', () => {
    render(<RateRuleForm />);

    expect(screen.getByTestId('billing-config-rate-rule-form')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /json/i })).not.toBeInTheDocument();
  });

  it('renders manual tax-like indicator on charge type form', () => {
    render(<ChargeTypeForm />);

    expect(screen.getByTestId('billing-config-manual-tax-like-indicator')).toHaveTextContent(/manual entry/i);
  });

  it('renders safe resolution failure without internal details', () => {
    render(<ConfigurationResolutionPreview result={{ ok: false, reason: 'No active approved configuration covers the requested date' }} />);

    expect(screen.getByTestId('billing-config-resolution-preview')).toBeInTheDocument();
    expect(screen.getByTestId('billing-config-safe-error')).toHaveTextContent(/No active approved configuration/);
  });
});
