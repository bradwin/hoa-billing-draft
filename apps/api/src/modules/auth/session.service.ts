import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Role } from '@hoa/shared';
import { roleRequiresMfa } from '@hoa/shared';
import { SessionRepository } from '../../persistence/repositories/session.repository';

export interface CreatedSession {
  rawToken: string;
  status: 'Active' | 'MfaPending';
  expiresAt: Date;
  idleExpiresAt: Date;
}

@Injectable()
export class SessionService {
  constructor(private readonly sessions: SessionRepository) {}

  async createForUser(input: { userId: string; role: Role; mfaSatisfied: boolean; correlationId: string }): Promise<CreatedSession> {
    const rawToken = randomBytes(32).toString('base64url');
    const now = Date.now();
    const privileged = input.role === 'SystemAdministrator' || input.role === 'Treasurer' || input.role === 'BillingStaff';
    const idleMinutes = privileged ? 15 : 60;
    const absoluteHours = privileged ? 8 : 24;
    const status: CreatedSession['status'] = roleRequiresMfa(input.role) && !input.mfaSatisfied ? 'MfaPending' : 'Active';
    const session = {
      rawToken,
      status,
      expiresAt: new Date(now + absoluteHours * 60 * 60 * 1000),
      idleExpiresAt: new Date(now + idleMinutes * 60 * 1000)
    };
    await this.sessions.createSession({
      userId: input.userId,
      rawToken,
      status,
      expiresAt: session.expiresAt,
      idleExpiresAt: session.idleExpiresAt,
      correlationId: input.correlationId
    });
    return session;
  }

  async logout(rawToken: string): Promise<void> {
    await this.sessions.revokeByDigest(rawToken);
  }
}
