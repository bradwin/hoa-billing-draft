export function SafeValidationSummary({ messages, correlationId }: { messages: readonly string[]; correlationId?: string }) {
  if (messages.length === 0) return null;
  return (
    <div data-testid="safe-validation-summary" className="safe-error" role="alert">
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      {correlationId ? <small>Correlation: {correlationId}</small> : null}
    </div>
  );
}
