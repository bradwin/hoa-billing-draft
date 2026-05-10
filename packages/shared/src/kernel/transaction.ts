export interface TransactionContext {
  id: string;
}

export type TransactionWork<T> = (tx: TransactionContext) => Promise<T>;

export interface TransactionRunner {
  withTransaction<T>(work: TransactionWork<T>): Promise<T>;
}

export class NoopTransactionRunner implements TransactionRunner {
  async withTransaction<T>(work: TransactionWork<T>): Promise<T> {
    return work({ id: 'noop-transaction' });
  }
}
