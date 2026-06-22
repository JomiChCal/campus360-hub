import { NextResponse, type NextRequest } from 'next/server';

import { isWizardAllowedState } from '@/lib/schedule-core';
import type { BusinessHoursState } from '@/types/schedule';

function getMockState(): BusinessHoursState | null {
  const mockMode = process.env.NEXT_PUBLIC_MOCK_BUSINESS_HOURS;
  if (mockMode === 'open' || mockMode === 'lunch' || mockMode === 'after-hours') {
    return mockMode;
  }
  if (mockMode === 'closing-soon') {
    return 'closing-soon';
  }
  return null;
}

function redirectNoStore(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

async function fetchScheduleState(request: NextRequest): Promise<BusinessHoursState> {
  const mock = getMockState();
  if (mock) return mock;

  try {
    const configUrl = new URL('/api/schedule-config', request.url);
    const response = await fetch(configUrl, { cache: 'no-store' });
    if (response.ok) {
      const data = (await response.json()) as { state?: BusinessHoursState };
      if (data.state) return data.state;
    }
  } catch {
    // fallback cerrado
  }

  return 'after-hours';
}

function canEnterWizard(state: BusinessHoursState): boolean {
  const mock = getMockState();
  if (mock) return mock === 'open' || mock === 'closing-soon';
  return isWizardAllowedState(state);
}

const FORM_ROUTES = ['/tipo', '/datos', '/servicio', '/detalle', '/resultado'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const state = await fetchScheduleState(request);

  if (pathname === '/') {
    const target = canEnterWizard(state) ? '/tipo' : '/fuera-horario';
    return redirectNoStore(new URL(target, request.url));
  }

  const isFormRoute = FORM_ROUTES.some((route) => pathname === route);

  if (!isFormRoute) {
    return NextResponse.next();
  }

  const mode = request.nextUrl.searchParams.get('mode');

  if (!canEnterWizard(state) && mode !== 'fuera-horario') {
    return redirectNoStore(new URL('/fuera-horario', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/tipo', '/datos', '/servicio', '/detalle', '/resultado'],
};
