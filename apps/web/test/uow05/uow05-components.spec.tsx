import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  AllocationEditor,
  CreditLedgerPanel,
  HomeownerPaymentProofForm,
  PaymentHistoryPanel,
  PaymentProofReviewPanel,
  PaymentWorkspace,
  ReceiptDetailPanel,
  ReceiptIntentStatusPanel
} from '../../src/features/uow05';

describe('UOW-05 frontend components', () => {
  it('renders payment workspace stable test IDs', () => {
    render(<PaymentWorkspace />);
    expect(screen.getByTestId('payment-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('payment-proof-review-panel')).toBeInTheDocument();
    expect(screen.getByTestId('payment-posting-workspace')).toBeInTheDocument();
  });

  it('renders homeowner proof form without JSON-only workflow', () => {
    render(<HomeownerPaymentProofForm />);
    expect(screen.getByTestId('homeowner-payment-proof-form')).toBeInTheDocument();
    expect(screen.getByTestId('payment-proof-submit-button')).toBeInTheDocument();
    expect(screen.queryByText(/json/i)).not.toBeInTheDocument();
  });

  it('renders allocation and credit controls', () => {
    render(<><AllocationEditor /><CreditLedgerPanel /></>);
    expect(screen.getByTestId('payment-allocation-total-check')).toHaveTextContent(/must equal payment amount/i);
    expect(screen.getByTestId('credit-application-form')).toBeInTheDocument();
  });

  it('separates payment state and support intent status', () => {
    render(<><PaymentHistoryPanel result={{ items: [], page: 1, pageSize: 20, totalItems: 0 }} /><ReceiptDetailPanel /><ReceiptIntentStatusPanel /><PaymentProofReviewPanel /></>);
    expect(screen.getByText(/states are tracked separately/i)).toBeInTheDocument();
    expect(screen.getByTestId('receipt-document-intent-status')).toHaveTextContent(/UOW-08 renders/i);
    expect(screen.getByTestId('payment-duplicate-candidate-panel')).toBeInTheDocument();
  });
});
