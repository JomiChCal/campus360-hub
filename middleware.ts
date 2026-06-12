import { NextResponse, type NextRequest } from 'next/server';

import bundledConfig from '@/data/schedule-config.json';
import {
  canAcceptTurnosFromResolved,
  resolveActiveSchedule,
  type ResolvedSchedule,
  type ScheduleStore,
} from '@/lib/schedule-config-core';

function getEcuadorMinutesAndWeekday(): { minutes: number; isWeekday: boolean } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const hours = Number.parseInt(get('hour'), 10);
  const minutes = Number.parseInt(get('minute'), 10);
  const weekday = get('weekday');
  const isWeekday = !['Sat', 'Sun'].includes(weekday);

  return { minutes: hours * 60 + minutes, isWeekday };
}

function isBusinessOpenFromResolved(resolved: ResolvedSchedule): boolean {
  const mock = process.env.NEXT_PUBLIC_MOCK_BUSINESS_HOURS;
  if (mock === 'after-hours' || mock === 'lunch') return false;
  if (mock === 'open') return true;

  const { minutes, isWeekday } = getEcuadorMinutesAndWeekday();
  return canAcceptTurnosFromResolved(resolved, minutes, isWeekday);
}

function resolveFromBundled(): ResolvedSchedule {
  return resolveActiveSchedule(bundledConfig as ScheduleStore);
}

function redirectNoStore(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

async function fetchResolvedSchedule(request: NextRequest): Promise<ResolvedSchedule> {
  let resolved = resolveFromBundled();

  try {
    const configUrl = new URL('/api/schedule-config', request.url);
    const response = await fetch(configUrl, { cache: 'no-store' });
    if (response.ok) {
      const data = (await response.json()) as { resolved: ResolvedSchedule };
      if (data.resolved) resolved = data.resolved;
    }
  } catch {
    // fallback al bundled config
  }

  return resolved;
}

const FORM_ROUTES = ['/tipo', '/datos', '/servicio', '/detalle', '/resultado'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const resolved = await fetchResolvedSchedule(request);
    const target = isBusinessOpenFromResolved(resolved) ? '/tipo' : '/fuera-horario';
    return redirectNoStore(new URL(target, request.url));
  }

  const isFormRoute = FORM_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}?`));

  if (!isFormRoute) {
    return NextResponse.next();
  }

  const resolved = await fetchResolvedSchedule(request);

  if (!isBusinessOpenFromResolved(resolved)) {
    const mode = request.nextUrl.searchParams.get('mode');
    if (mode !== 'fuera-horario') {
      return redirectNoStore(new URL('/fuera-horario', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/tipo', '/datos', '/servicio', '/detalle', '/resultado'],
};
