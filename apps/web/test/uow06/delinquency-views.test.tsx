import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { DelinquencyWorkspace, HomeownerDelinquencyPage } from '../../src/features/uow06';

describe('UOW-06 delinquency views', () => {
  it('renders staff workflow controls with stable test ids', () => {
    render(<DelinquencyWorkspace />);
    expect(screen.getByTestId('overdue-evaluation-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('penalty-candidate-panel')).toBeInTheDocument();
    expect(screen.getByTestId('waiver-approval-panel')).toBeInTheDocument();
    expect(screen.getByTestId('reminder-eligibility-panel')).toBeInTheDocument();
  });

  it('renders homeowner-safe delinquency detail without mutation actions', () => {
    render(<HomeownerDelinquencyPage />);
    expect(screen.getByTestId('homeowner-delinquency-page')).toBeInTheDocument();
    expect(screen.getByTestId('reminder-intent-status-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('penalty-apply-button')).not.toBeInTheDocument();
  });
});
