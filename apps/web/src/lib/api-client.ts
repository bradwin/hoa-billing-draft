export interface ApiError {
  code: string;
  message: string;
  correlationId?: string;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`, {
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });
  if (!response.ok) {
    throw (await response.json()) as ApiError;
  }
  return response.json() as Promise<T>;
}
