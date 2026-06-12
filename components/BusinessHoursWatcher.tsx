'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 30_000;

const FORM_ROUTES = ['/tipo', '/datos', '/servicio', '/detalle', '/resultado'];

function isEnforcedRoute(pathname: string, mode: string | null): boolean {
  if (pathname === '/fuera-horario') return false;
  if (mode === 'fuera-horario') return false;
  if (pathname === '/') return true;
  return FORM_ROUTES.includes(pathname);
}

export default function BusinessHoursWatcher() {
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const mode = searchParameters.get('mode');
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!isEnforcedRoute(pathname, mode)) return;

    let cancelled = false;

    const checkHours = async () => {
      if (cancelled || redirectingRef.current) return;

      try {
        const response = await fetch('/api/business-hours-state', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as { open?: boolean };
        if (data.open === false && isEnforcedRoute(pathname, mode)) {
          redirectingRef.current = true;
          window.location.replace('/fuera-horario');
        }
      } catch {
        // Reintentar en el siguiente intervalo
      }
    };

    void checkHours();
    const intervalId = window.setInterval(() => {
      void checkHours();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pathname, mode]);

  return null;
}
