import type { ApiError } from '../../lib/api-client';

export function SafeErrorBanner({ error }: { error?: ApiError | null }) {
  if (!error) return null;
  return (
    <div data-testid="safe-error-banner" role="alert" className="safe-error">
      <strong>{error.message}</strong>
      {error.correlationId ? <span> Correlation ID: {error.correlationId}</span> : null}
    </div>
  );
}
