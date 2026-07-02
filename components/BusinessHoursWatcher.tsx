'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useFormContext } from '@/contexts/FormContext';
import { setClientScheduleStore } from '@/lib/schedule-client-store';
import type { BusinessHoursState, ScheduleStore } from '@/types/schedule';

const WIZARD_ROUTES = ['/tipo', '/datos', '/servicio', '/detalle'];
const POLL_INTERVAL_MS = 30_000;

function isWizardPath(pathname: string): boolean {
  return WIZARD_ROUTES.some((route) => pathname.endsWith(route));
}

async function syncScheduleFromApi(): Promise<BusinessHoursState | null> {
  try {
    const response = await fetch('/api/schedule-config', { cache: 'no-store' });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      horarios?: ScheduleStore['horarios'];
      updatedAt?: string;
      state?: BusinessHoursState;
    };

    if (data.horarios && Object.keys(data.horarios).length > 0) {
      setClientScheduleStore({
        horarios: data.horarios,
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      });
    }

    return data.state ?? null;
  } catch {
    return null;
  }
}

export default function BusinessHoursWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const { openContactTimeModal } = useFormContext();
  const previousStateReference = useRef<BusinessHoursState | null>(null);
  const modalShownForStateReference = useRef(false);

  useEffect(() => {
    if (!isWizardPath(pathname)) {
      previousStateReference.current = null;
      modalShownForStateReference.current = false;
      return;
    }

    if (searchParameters.get('mode') === 'fuera-horario') {
      return;
    }

    const evaluate = async () => {
      const syncedState = await syncScheduleFromApi();
      if (syncedState === null) return;

      const state = syncedState;
      const previous = previousStateReference.current;

      if (state === 'closing-soon' && !modalShownForStateReference.current) {
        modalShownForStateReference.current = true;
        router.refresh();
        openContactTimeModal();
      }

      if ((state === 'lunch' || state === 'after-hours') && previous !== state) {
        router.replace('/fuera-horario');
      }

      if (state === 'open') {
        modalShownForStateReference.current = false;
      }

      previousStateReference.current = state;
    };

    void evaluate();

    const intervalId = globalThis.setInterval(() => {
      void evaluate();
    }, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void evaluate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      globalThis.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pathname, searchParameters, router, openContactTimeModal]);

  return null;
}
