'use client';

import { useEffect, useState } from 'react';

import { setClientScheduleStore, getClientScheduleStore } from '@/lib/schedule-client-store';
import type { BusinessHoursState, ScheduleStore } from '@/types/schedule';

type ScheduleConfigResponse = {
  horarios?: ScheduleStore['horarios'];
  updatedAt?: string;
  state?: BusinessHoursState;
};

export function useScheduleHydration() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/api/schedule-config', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as ScheduleConfigResponse;
        if (cancelled || !data.horarios) return;

        setClientScheduleStore({
          horarios: data.horarios,
          updatedAt: data.updatedAt ?? new Date().toISOString(),
        });
        setIsReady(true);
      } catch {
        if (!cancelled) setIsReady(true);
      }
    }

    if (Object.keys(getClientScheduleStore().horarios).length > 0) {
      setIsReady(true);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return isReady;
}
