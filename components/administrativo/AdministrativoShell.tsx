'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

type Props = {
  children: React.ReactNode;
};

export function AdministrativoShell({ children }: Props) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-utpl-blue/10 via-utpl-blue/5 to-transparent" />
      <header className="mb-7 rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-elevated)] p-4 sm:p-6">
        <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="font-sans text-xl font-semibold tracking-[0.01em] text-[color:var(--svc-color-text-primary)] sm:text-2xl">
              servicios UTPL
            </h1>
          </div>
          <div className="flex w-full items-center justify-end sm:w-auto">
            <Button
              variant="outline"
              className="w-full rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-secondary)] hover:bg-[color:var(--svc-color-surface-elevated)] sm:w-auto"
              onClick={() => signOut({ redirect: false }).then(() => window.location.reload())}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
