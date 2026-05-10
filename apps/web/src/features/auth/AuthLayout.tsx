import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main data-testid="auth-layout" className="auth-layout">
      <section>{children}</section>
    </main>
  );
}
