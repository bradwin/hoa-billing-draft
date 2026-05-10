export interface PageRequest {
  page: number;
  pageSize: number;
  sort?: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const MAX_PAGE_SIZE = 100;

export function createPageRequest(page: number, pageSize: number, sort?: string): PageRequest {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('Page must be a positive integer');
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new Error(`Page size must be between 1 and ${MAX_PAGE_SIZE}`);
  }
  return { page, pageSize, ...(sort ? { sort } : {}) };
}
