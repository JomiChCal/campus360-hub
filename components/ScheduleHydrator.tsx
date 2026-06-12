'use client';

import { useEffect } from 'react';

import { setClientScheduleStore } from '@/lib/business-hours';
import type { ScheduleStore } from '@/lib/schedule-config-core';

/** Sincroniza el horario del cliente con la API en cada carga (evita JSON embebido obsoleto). */
export default function ScheduleHydrator() {
  useEffect(() => {
    let cancelled = false;

    fetch('/api/schedule-config', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { horarios?: ScheduleStore['horarios']; updatedAt?: string } | null) => {
        if (cancelled || !data?.horarios) return;
        setClientScheduleStore({
          horarios: data.horarios,
          updatedAt: data.updatedAt ?? new Date().toISOString(),
        });
      })
      .catch(() => {
        // Mantener bundled config si la API no responde
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
