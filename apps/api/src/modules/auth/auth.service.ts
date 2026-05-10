import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'node:crypto';
import * as argon2 from 'argon2';
import { ErrorCodes, roleRequiresMfa, type Role } from '@hoa/shared';
import { AuditService } from '../audit/audit.service';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { SessionService } from './session.service';
import { AbuseProtectionService } from './abuse-protection.service';

export interface LoginResult {
  status: 'Authenticated' | 'MfaRequired' | 'Failed';
  sessionToken?: string;
  safeCode?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionService,
    private readonly abuse: AbuseProtectionService,
    private readonly audit: AuditService
  ) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  tokenDigest(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  createOneTimeToken(): { rawToken: string; digest: string } {
    const rawToken = randomBytes(32).toString('base64url');
    return { rawToken, digest: this.tokenDigest(rawToken) };
  }

  async inviteUser(input: { email: string; displayName: string; role: Role; actorUserId: string; correlationId: string }): Promise<unknown> {
    const user = await this.users.create({
      email: input.email,
      displayName: input.displayName,
      role: input.role
    });
    await this.audit.append({
      category: 'Security',
      action: 'USER.INVITED',
      correlationId: input.correlationId,
      result: 'Success',
      actor: {
        userId: input.actorUserId,
        role: 'SystemAdministrator',
        correlationId: input.correlationId,
        sessionId: 'system'
      },
      metadata: { invitedRole: input.role }
    });
    return user;
  }

  async activateInvitation(input: { token: string; password: string; correlationId: string }): Promise<{ accepted: boolean }> {
    const tokenDigest = this.tokenDigest(input.token);
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action: 'AUTH.INVITATION_ACTIVATION_ATTEMPT',
      eventType: 'AUTH.INVITATION_ACTIVATION_ATTEMPT',
      correlationId: input.correlationId,
      result: 'Info',
      metadata: { tokenDigest }
    });
    return { accepted: false };
  }

  async requestPasswordReset(input: { email: string; correlationId: string }): Promise<void> {
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action: 'AUTH.PASSWORD_RESET_REQUESTED',
      eventType: 'AUTH.PASSWORD_RESET_REQUESTED',
      correlationId: input.correlationId,
      result: 'Info',
      metadata: { emailHash: this.tokenDigest(input.email.toLowerCase()) }
    });
  }

  async completePasswordReset(input: { token: string; newPassword: string; correlationId: string }): Promise<{ completed: boolean }> {
    const tokenDigest = this.tokenDigest(input.token);
    await this.hashPassword(input.newPassword);
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action: 'AUTH.PASSWORD_RESET_COMPLETED',
      eventType: 'AUTH.PASSWORD_RESET_COMPLETED',
      correlationId: input.correlationId,
      result: 'Info',
      metadata: { tokenDigest }
    });
    return { completed: false };
  }

  async login(input: { email: string; password: string; correlationId: string; sourceFingerprint: string }): Promise<LoginResult> {
    const user = await this.users.findByEmail(input.email.toLowerCase()) as
      | { id: string; role: Role; passwordHash?: string | null; status: string; mfaEnrollmentStatus: string }
      | null;
    if (!user?.passwordHash || user.status !== 'Active') {
      await this.recordFailedLogin(input.correlationId, input.sourceFingerprint);
      return { status: 'Failed', safeCode: ErrorCodes.AUTH_GENERIC_FAILURE };
    }
    const verified = await this.verifyPassword(user.passwordHash, input.password);
    if (!verified) {
      await this.recordFailedLogin(input.correlationId, input.sourceFingerprint);
      return { status: 'Failed', safeCode: ErrorCodes.AUTH_GENERIC_FAILURE };
    }
    const mfaSatisfied = !roleRequiresMfa(user.role);
    const session = await this.sessions.createForUser({
      userId: user.id,
      role: user.role,
      mfaSatisfied,
      correlationId: input.correlationId
    });
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action: 'AUTH.LOGIN_SUCCESS',
      eventType: 'AUTH.LOGIN_SUCCESS',
      correlationId: input.correlationId,
      result: 'Success',
      metadata: { mfaRequired: roleRequiresMfa(user.role) }
    });
    return {
      status: session.status === 'MfaPending' ? 'MfaRequired' : 'Authenticated',
      sessionToken: session.rawToken
    };
  }

  async logout(rawToken: string, correlationId: string): Promise<void> {
    await this.sessions.logout(rawToken);
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action: 'AUTH.LOGOUT',
      eventType: 'AUTH.LOGOUT',
      correlationId,
      result: 'Success'
    });
  }

  private async recordFailedLogin(correlationId: string, sourceFingerprint: string): Promise<void> {
    this.abuse.calculateFailurePolicy(1);
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action: 'AUTH.LOGIN_FAILED',
      eventType: 'AUTH.LOGIN_FAILED',
      sourceFingerprint,
      correlationId,
      result: 'Denied'
    });
  }
}
