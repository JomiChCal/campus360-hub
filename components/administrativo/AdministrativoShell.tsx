'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';

type Props = {
  children: React.ReactNode;
};

export function AdministrativoShell({ children }: Props) {
  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-utpl-blue">Panel administrativo</h1>
          <p className="text-sm text-utpl-muted">Gestión del portal de servicios académicos</p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ redirect: false }).then(() => window.location.reload())}
        >
          Cerrar sesión
        </Button>
      </header>
      {children}
    </div>
  );
}
