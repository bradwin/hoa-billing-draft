export function logWorkerEvent(level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>): void {
  process.stdout.write(`${JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    component: 'worker',
    message,
    metadata
  })}\n`);
}
