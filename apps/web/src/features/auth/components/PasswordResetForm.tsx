'use client';

import { FormEvent, useState } from 'react';
import { apiRequest, type ApiError } from '../../../lib/api-client';
import { SafeErrorBanner } from '../../shell/SafeErrorBanner';

export function PasswordResetForm() {
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/auth/password-reset/complete', {
        method: 'POST',
        body: JSON.stringify({
          token: form.get('token'),
          newPassword: form.get('newPassword')
        })
      });
      event.currentTarget.reset();
    } catch (err) {
      setError(err as ApiError);
    }
  }

  return (
    <form data-testid="auth-password-reset-complete-form" onSubmit={submit}>
      <SafeErrorBanner error={error} />
      <input name="token" type="hidden" />
      <label>
        New password
        <input name="newPassword" type="password" required minLength={8} />
      </label>
      <button type="submit">Reset password</button>
    </form>
  );
}
