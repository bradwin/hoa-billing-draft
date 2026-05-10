import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { InvoiceDetailPage, InvoiceIssueActionPanel, InvoicePage, ManualInvoiceForm } from '../../src/features/uow04';

describe('UOW-04 frontend components', () => {
  it('renders invoice workspace stable test IDs', () => {
    render(<InvoicePage />);
    expect(screen.getByTestId('invoice-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-recurring-batch-page')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-draft-review-table')).toBeInTheDocument();
  });

  it('renders manual invoice form without JSON-only workflow', () => {
    render(<ManualInvoiceForm />);
    expect(screen.getByTestId('invoice-manual-form')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-manual-line-editor')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-manual-tax-like-indicator')).toHaveTextContent('manual-entry eligibility');
  });

  it('separates lifecycle status from payment-derived status', () => {
    render(<InvoiceDetailPage invoice={{ id: 'i1', origin: 'Manual', status: 'Issued', propertyId: 'p1', billingAccountId: 'ba1', responsibleHomeownerId: 'h1', dueDate: '2026-05-31', totalAmount: '100.00' }} />);
    expect(screen.getByText('Lifecycle: Issued')).toBeInTheDocument();
    expect(screen.getByText('Payment status is derived later from payment allocations.')).toBeInTheDocument();
  });

  it('renders per-invoice issuance results', () => {
    render(<InvoiceIssueActionPanel results={[{ invoiceId: 'i1', ok: true, invoiceNumber: 'INV-1' }]} />);
    expect(screen.getByTestId('invoice-issue-action-panel')).toHaveTextContent('INV-1');
  });
});
