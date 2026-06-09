import { NextResponse, type NextRequest } from 'next/server';

import { getBusinessHoursState } from '@/lib/business-hours-shared';

const FORM_ROUTES = ['/tipo', '/datos', '/servicio', '/detalle', '/resultado'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isFormRoute = FORM_ROUTES.some((r) => pathname === r);

  if (isFormRoute && getBusinessHoursState() !== 'open') {
    const mode = request.nextUrl.searchParams.get('mode');
    if (mode !== 'fuera-horario') {
      return NextResponse.redirect(new URL('/fuera-horario', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tipo', '/datos', '/servicio', '/detalle', '/resultado'],
};
