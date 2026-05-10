import type { PageRequest, PageResult } from '@hoa/shared';

export interface ReadRepository<T, TFilter> {
  findPage(filter: TFilter, page: PageRequest): Promise<PageResult<T>>;
}

export interface AppendOnlyRepository<TInput, TOutput> {
  append(input: TInput): Promise<TOutput>;
}
