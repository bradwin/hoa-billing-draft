import { Injectable } from '@nestjs/common';
import type { Role } from '@hoa/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateUserRecord {
  email: string;
  displayName: string;
  role: Role;
  passwordHash?: string;
  homeownerRef?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateUserRecord): Promise<unknown> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        role: input.role,
        ...(input.passwordHash ? { passwordHash: input.passwordHash } : {}),
        ...(input.homeownerRef ? { homeownerRef: input.homeownerRef } : {}),
        mfaRequired: input.role === 'SystemAdministrator' || input.role === 'Treasurer'
      }
    });
  }

  findByEmail(email: string): Promise<unknown> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
