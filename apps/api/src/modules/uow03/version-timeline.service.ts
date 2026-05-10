import { Injectable } from '@nestjs/common';
import { assertHalfOpenInterval, assertNoOverlappingIntervals, type EffectiveInterval } from '@hoa/shared';
import { Uow03Repository } from '../../persistence/repositories/uow03.repository';
import { asRecord } from './uow03.types';

@Injectable()
export class VersionTimelineService {
  constructor(private readonly repository: Uow03Repository) {}

  async assertCanActivate(draft: Record<string, any>): Promise<void> {
    assertHalfOpenInterval({
      effectiveFrom: this.toDateOnly(draft.effectiveFrom),
      effectiveTo: draft.effectiveTo ? this.toDateOnly(draft.effectiveTo) : null
    });
    const active = await this.repository.findActiveVersions({
      configurationType: draft.configurationType,
      identityKey: draft.identityKey,
      scopeKey: draft.scopeKey,
      ruleType: draft.ruleType
    });
    const intervals: EffectiveInterval[] = active.map((value) => {
      const record = asRecord(value);
      return {
        effectiveFrom: this.toDateOnly(record.effectiveFrom),
        effectiveTo: record.effectiveTo ? this.toDateOnly(record.effectiveTo) : null
      };
    });
    intervals.push({
      effectiveFrom: this.toDateOnly(draft.effectiveFrom),
      effectiveTo: draft.effectiveTo ? this.toDateOnly(draft.effectiveTo) : null
    });
    assertNoOverlappingIntervals(intervals);
  }

  private toDateOnly(value: Date | string): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  }
}
