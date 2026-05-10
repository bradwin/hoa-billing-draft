import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  ContactChangeDecisionPanel,
  ContactChangeRequestForm,
  HomeownerResultTable,
  PropertySearchFilters,
  SafeValidationSummary,
  toQuery
} from '../../src/features/uow02';

describe('UOW-02 frontend components', () => {
  it('serializes selected filters without dropping values', () => {
    expect(toQuery({ name: 'Ada', page: 2, empty: undefined })).toBe('name=Ada&page=2');
  });

  it('renders stable homeowner table test IDs and masked PII fallback', () => {
    render(
      <HomeownerResultTable
        result={{
          items: [{ id: 'h1', homeownerCode: 'HO-1', legalName: 'Ada Lovelace', status: 'Active' }],
          page: 1,
          pageSize: 25,
          totalItems: 1
        }}
      />
    );

    expect(screen.getByTestId('homeowner-result-table')).toBeInTheDocument();
    expect(screen.getByText('PII masked or unavailable')).toBeInTheDocument();
  });

  it('renders property search stable test IDs', () => {
    render(<PropertySearchFilters />);

    expect(screen.getByTestId('property-search-filters')).toBeInTheDocument();
    expect(screen.getByTestId('property-search-code-input')).toBeInTheDocument();
  });

  it('keeps contact change form scoped to contact fields', () => {
    render(<ContactChangeRequestForm />);

    expect(screen.getByTestId('contact-change-request-form')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/legal/i)).not.toBeInTheDocument();
  });

  it('disables decisions for terminal contact request states', () => {
    render(<ContactChangeDecisionPanel status="Approved" />);

    expect(screen.getByText('Approve')).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
  });

  it('renders safe validation summaries without internal details', () => {
    render(<SafeValidationSummary messages={['HOMEOWNER_NOT_ACTIVE']} correlationId="corr_12345678" />);

    expect(screen.getByTestId('safe-validation-summary')).toHaveTextContent('HOMEOWNER_NOT_ACTIVE');
    expect(screen.getByTestId('safe-validation-summary')).toHaveTextContent('corr_12345678');
  });
});
