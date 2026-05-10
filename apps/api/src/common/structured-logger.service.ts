import { Injectable, LoggerService } from '@nestjs/common';

const REDACT_KEYS = ['password', 'token', 'secret', 'session', 'mfa', 'recovery', 'authorization'];

@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: unknown, context?: string): void {
    this.write('info', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
  }

  private write(level: string, message: unknown, context?: string, trace?: string): void {
    const record = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: this.redact(message),
      trace: trace ? '[REDACTED_TRACE_AVAILABLE]' : undefined
    };
    process.stdout.write(`${JSON.stringify(record)}\n`);
  }

  private redact(value: unknown): unknown {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map((item) => this.redact(item));
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        const lower = key.toLowerCase();
        if (REDACT_KEYS.some((redactKey) => lower.includes(redactKey))) {
          return [key, '[REDACTED]'];
        }
        return [key, this.redact(item)];
      })
    );
  }
}
