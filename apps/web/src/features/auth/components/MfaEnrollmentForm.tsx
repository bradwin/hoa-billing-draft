'use client';

export function MfaEnrollmentForm({ otpauthUrl }: { otpauthUrl?: string }) {
  return (
    <form data-testid="auth-mfa-enrollment-form">
      {otpauthUrl ? <p>Authenticator setup link is ready.</p> : <p>MFA enrollment required.</p>}
      <label>
        Verification code
        <input name="code" inputMode="numeric" pattern="[0-9]{6}" required />
      </label>
      <button type="submit">Complete enrollment</button>
    </form>
  );
}
