export class SupportAdapterDisabledError extends Error {
  constructor(kind: string) {
    super(`${kind} adapter is disabled until UOW-08`);
  }
}

export class NullSupportAdapter {
  async dispatch(kind: 'Notification' | 'Document' | 'Storage' | 'Job'): Promise<never> {
    throw new SupportAdapterDisabledError(kind);
  }
}
