export function createCorrelationId(prefix = 'corr'): string {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}

export function assertCorrelationId(value: string): string {
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(value)) {
    throw new Error('Invalid correlation ID');
  }
  return value;
}
