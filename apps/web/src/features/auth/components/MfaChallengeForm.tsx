'use client';

import { FormEvent, useState } from 'react';
import { apiRequest, type ApiError } from '../../../lib/api-client';
import { SafeErrorBanner } from '../../shell/SafeErrorBanner';

export function MfaChallengeForm() {
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/auth/mfa/challenge', {
        method: 'POST',
        body: JSON.stringify({ code: form.get('code') })
      });
      event.currentTarget.reset();
    } catch (err) {
      setError(err as ApiError);
    }
  }

  return (
    <form data-testid="auth-mfa-challenge-form" onSubmit={submit}>
      <SafeErrorBanner error={error} />
      <label>
        MFA code
        <input name="code" inputMode="numeric" pattern="[0-9]{6}" required />
      </label>
      <button type="submit">Verify</button>
    </form>
  );
}
