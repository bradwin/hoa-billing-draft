'use client';

import { FormEvent, useState } from 'react';
import { apiRequest, type ApiError } from '../../../lib/api-client';
import { SafeErrorBanner } from '../../shell/SafeErrorBanner';

export function SignInForm() {
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password')
        })
      });
      event.currentTarget.reset();
    } catch (err) {
      setError(err as ApiError);
    }
  }

  return (
    <form data-testid="auth-sign-in-form" onSubmit={submit}>
      <SafeErrorBanner error={error} />
      <label>
        Email
        <input data-testid="auth-sign-in-email-input" name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input data-testid="auth-sign-in-password-input" name="password" type="password" autoComplete="current-password" required />
      </label>
      <button data-testid="auth-sign-in-submit-button" type="submit">Sign in</button>
    </form>
  );
}
