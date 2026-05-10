export function SafeConfigurationError({ messages }: { messages: readonly string[] }) {
  if (messages.length === 0) return null;
  return (
    <section data-testid="billing-config-safe-error" role="alert" className="uow02-validation">
      <h3>Configuration issue</h3>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  );
}
