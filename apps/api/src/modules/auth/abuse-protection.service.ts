import { Injectable } from '@nestjs/common';

export interface FailurePolicyResult {
  lockedUntil?: Date;
  delayMs: number;
}

@Injectable()
export class AbuseProtectionService {
  calculateFailurePolicy(failureCount: number, now = new Date()): FailurePolicyResult {
    if (failureCount >= 10) {
      return { lockedUntil: new Date(now.getTime() + 30 * 60 * 1000), delayMs: 0 };
    }
    if (failureCount >= 5) {
      return { delayMs: Math.min(30000, (failureCount - 4) * 5000) };
    }
    return { delayMs: 0 };
  }

  genericAuthFailure(): { code: 'AUTH_GENERIC_FAILURE'; message: string } {
    return { code: 'AUTH_GENERIC_FAILURE', message: 'Invalid credentials or account state' };
  }
}
