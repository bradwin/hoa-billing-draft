import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  digest(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  createSession(input: {
    userId: string;
    rawToken: string;
    status: 'Active' | 'MfaPending';
    expiresAt: Date;
    idleExpiresAt: Date;
    correlationId: string;
  }): Promise<unknown> {
    return this.prisma.userSession.create({
      data: {
        userId: input.userId,
        sessionDigest: this.digest(input.rawToken),
        status: input.status,
        expiresAt: input.expiresAt,
        idleExpiresAt: input.idleExpiresAt,
        correlationId: input.correlationId
      }
    });
  }

  revokeByDigest(rawToken: string): Promise<unknown> {
    return this.prisma.userSession.updateMany({
      where: { sessionDigest: this.digest(rawToken), status: { in: ['Active', 'MfaPending'] } },
      data: { status: 'Revoked', revokedAt: new Date() }
    });
  }
}
