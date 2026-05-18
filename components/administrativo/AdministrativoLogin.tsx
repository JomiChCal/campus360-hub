'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdministrativoLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signIn('credentials', {
      username: String(formData.get('username') ?? ''),
      password: String(formData.get('password') ?? ''),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-elevated)] shadow-none">
        <CardHeader>
          <CardTitle className="text-center font-sans text-[var(--svc-text-lg)] font-semibold tracking-[0.08em] text-[color:var(--svc-color-text-primary)] uppercase">
            Acceso administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-[var(--svc-text-2xs)] font-medium tracking-[0.08em] text-[color:var(--svc-color-text-muted)] uppercase" htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                required
                autoComplete="username"
                className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-primary)] shadow-none focus-visible:border-[color:var(--svc-color-border-strong)] focus-visible:ring-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--svc-text-2xs)] font-medium tracking-[0.08em] text-[color:var(--svc-color-text-muted)] uppercase" htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-primary)] shadow-none focus-visible:border-[color:var(--svc-color-border-strong)] focus-visible:ring-0"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              type="submit"
              className="w-full rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-strong)] bg-[color:var(--svc-color-surface-elevated)] text-[color:var(--svc-color-text-primary)] hover:bg-[color:var(--svc-color-surface-subtle)]"
              disabled={loading}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
