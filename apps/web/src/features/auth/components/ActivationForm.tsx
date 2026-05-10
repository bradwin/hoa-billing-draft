'use client';

import { FormEvent, useState } from 'react';
import { apiRequest, type ApiError } from '../../../lib/api-client';
import { SafeErrorBanner } from '../../shell/SafeErrorBanner';

export function ActivationForm() {
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/auth/invitations/activate', {
        method: 'POST',
        body: JSON.stringify({
          token: form.get('token'),
          displayName: form.get('displayName'),
          password: form.get('password')
        })
      });
      event.currentTarget.reset();
    } catch (err) {
      setError(err as ApiError);
    }
  }

  return (
    <form data-testid="auth-activation-form" onSubmit={submit}>
      <SafeErrorBanner error={error} />
      <input name="token" type="hidden" />
      <label>
        Display name
        <input name="displayName" required maxLength={120} />
      </label>
      <label>
        Password
        <input name="password" type="password" required minLength={8} />
      </label>
      <button type="submit">Activate</button>
    </form>
  );
}
