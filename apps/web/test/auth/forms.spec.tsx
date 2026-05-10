import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SignInForm } from '../../src/features/auth/components/SignInForm';
import { MfaChallengeForm } from '../../src/features/auth/components/MfaChallengeForm';

describe('auth forms', () => {
  it('renders stable sign-in test IDs', () => {
    render(<SignInForm />);
    expect(screen.getByTestId('auth-sign-in-form')).toBeInTheDocument();
    expect(screen.getByTestId('auth-sign-in-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('auth-sign-in-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('auth-sign-in-submit-button')).toBeInTheDocument();
  });

  it('renders MFA challenge form', () => {
    render(<MfaChallengeForm />);
    expect(screen.getByTestId('auth-mfa-challenge-form')).toBeInTheDocument();
  });
});
