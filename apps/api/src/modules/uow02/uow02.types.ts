import type { ActorContext } from '@hoa/shared';

export interface RequestWithActor {
  actor: ActorContext;
}

export interface PageResultDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' ? (value as Record<string, any>) : {};
}
