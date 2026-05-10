import { Injectable } from '@nestjs/common';
import type { PageRequest } from '@hoa/shared';
import { PrismaService } from '../../prisma/prisma.service';

function toSkipTake(page: PageRequest): { skip: number; take: number } {
  return {
    skip: (page.page - 1) * page.pageSize,
    take: page.pageSize
  };
}

@Injectable()
export class Uow02Repository {
  constructor(private readonly prisma: PrismaService) {}

  get client(): any {
    return this.prisma as any;
  }

  async nextCode(prefix: string, modelName: string, fieldName: string): Promise<string> {
    const count = await this.client[modelName].count();
    return `${prefix}-${(count + 1).toString().padStart(6, '0')}`;
  }

  findHomeowners(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.homeowner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...toSkipTake(page)
    });
  }

  countHomeowners(where: Record<string, unknown>): Promise<number> {
    return this.client.homeowner.count({ where });
  }

  createHomeowner(data: Record<string, unknown>): Promise<unknown> {
    return this.client.homeowner.create({ data });
  }

  updateHomeowner(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.homeowner.update({ where: { id }, data });
  }

  findHomeownerById(id: string): Promise<unknown | null> {
    return this.client.homeowner.findUnique({
      where: { id },
      include: {
        ownershipPeriods: { orderBy: { effectiveFrom: 'desc' } },
        billingAccountPeriods: { orderBy: { effectiveFrom: 'desc' } },
        contactChangeRequests: { orderBy: { submittedAt: 'desc' } }
      }
    });
  }

  findDuplicateHomeowners(where: Record<string, unknown>): Promise<unknown[]> {
    return this.client.homeowner.findMany({ where, take: 10 });
  }

  createDuplicateReview(data: Record<string, unknown>): Promise<unknown> {
    return this.client.homeownerDuplicateReview.create({ data });
  }

  findProperties(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.property.findMany({
      where,
      include: { aliases: true },
      orderBy: { createdAt: 'desc' },
      ...toSkipTake(page)
    });
  }

  countProperties(where: Record<string, unknown>): Promise<number> {
    return this.client.property.count({ where });
  }

  createProperty(data: Record<string, unknown>): Promise<unknown> {
    return this.client.property.create({ data });
  }

  updateProperty(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.property.update({ where: { id }, data });
  }

  findPropertyById(id: string): Promise<unknown | null> {
    return this.client.property.findUnique({
      where: { id },
      include: {
        aliases: true,
        ownershipPeriods: { include: { homeowner: true }, orderBy: { effectiveFrom: 'desc' } },
        billingAccountPeriods: { include: { homeowner: true }, orderBy: { effectiveFrom: 'desc' } }
      }
    });
  }

  createPropertyAlias(data: Record<string, unknown>): Promise<unknown> {
    return this.client.propertyAlias.create({ data });
  }

  updatePropertyAlias(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.propertyAlias.update({ where: { id }, data });
  }

  createOwnershipPeriod(data: Record<string, unknown>): Promise<unknown> {
    return this.client.ownershipPeriod.create({ data });
  }

  updateOwnershipPeriod(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.ownershipPeriod.update({ where: { id }, data });
  }

  findOwnershipPeriods(propertyId: string): Promise<unknown[]> {
    return this.client.ownershipPeriod.findMany({
      where: { propertyId },
      include: { homeowner: true },
      orderBy: { effectiveFrom: 'asc' }
    });
  }

  createBillingAccountPeriod(data: Record<string, unknown>): Promise<unknown> {
    return this.client.billingAccountPeriod.create({ data });
  }

  findBillingAccountPeriods(propertyId: string): Promise<unknown[]> {
    return this.client.billingAccountPeriod.findMany({
      where: { propertyId },
      include: { homeowner: true },
      orderBy: { effectiveFrom: 'asc' }
    });
  }

  createContactChangeRequest(data: Record<string, unknown>): Promise<unknown> {
    return this.client.contactChangeRequest.create({ data });
  }

  updateContactChangeRequest(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.contactChangeRequest.update({ where: { id }, data });
  }

  findContactChangeRequest(id: string): Promise<unknown | null> {
    return this.client.contactChangeRequest.findUnique({ where: { id }, include: { homeowner: true } });
  }

  findContactChangeRequests(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.contactChangeRequest.findMany({
      where,
      include: { homeowner: true },
      orderBy: { submittedAt: 'desc' },
      ...toSkipTake(page)
    });
  }
}
