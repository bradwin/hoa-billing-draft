import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { authenticator } from 'otplib';
import { roleRequiresMfa, type Role } from '@hoa/shared';
import { AuditService } from '../audit/audit.service';
import { SecretEncryptionService } from './secret-encryption.service';

@Injectable()
export class MfaService {
  constructor(
    private readonly encryption: SecretEncryptionService,
    private readonly audit: AuditService
  ) {}

  requiresMfa(role: Role): boolean {
    return roleRequiresMfa(role);
  }

  createEnrollment(userEmail: string, encryptionKey: string): { secret: string; encryptedSecret: string; otpauthUrl: string } {
    const secret = authenticator.generateSecret();
    return {
      secret,
      encryptedSecret: this.encryption.encrypt(secret, encryptionKey),
      otpauthUrl: authenticator.keyuri(userEmail, 'HOA Billing', secret)
    };
  }

  verifyTotp(encryptedSecret: string, token: string, encryptionKey: string): boolean {
    const secret = this.encryption.decrypt(encryptedSecret, encryptionKey);
    return authenticator.verify({ token, secret });
  }

  generateRecoveryCodes(count = 10): { rawCodes: string[]; hashes: string[] } {
    const rawCodes = Array.from({ length: count }, () => randomBytes(12).toString('base64url'));
    return { rawCodes, hashes: rawCodes.map((code) => this.hashRecoveryCode(code)) };
  }

  hashRecoveryCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  async auditMfaEvent(input: { userId: string; action: string; correlationId: string; result: 'Success' | 'Denied' | 'Failed' | 'Info' }): Promise<void> {
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action: input.action,
      eventType: input.action,
      correlationId: input.correlationId,
      result: input.result,
      metadata: { userId: input.userId }
    });
  }

  canSelfDisableAdministrativeMfa(): false {
    return false;
  }
}
