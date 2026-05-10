'use client';

import { FormEvent, useState } from 'react';
import { apiRequest, type ApiError } from '../../../lib/api-client';
import { SafeErrorBanner } from '../../shell/SafeErrorBanner';

export function PasswordResetRequestForm() {
  const [error, setError] = useState<ApiError | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email') })
      });
      setSubmitted(true);
      event.currentTarget.reset();
    } catch (err) {
      setError(err as ApiError);
    }
  }

  return (
    <form data-testid="auth-password-reset-request-form" onSubmit={submit}>
      <SafeErrorBanner error={error} />
      {submitted ? <p>Request received.</p> : null}
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <button type="submit">Request reset</button>
    </form>
  );
}
