import { NextResponse, type NextRequest } from 'next/server';

function isBusinessOpen(): boolean {
  const mock = process.env.NEXT_PUBLIC_MOCK_BUSINESS_HOURS;
  if (mock === 'after-hours' || mock === 'lunch') return false;
  if (mock === 'open') return true;

  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const utcDay = now.getUTCDay();

  if (utcDay === 0 || utcDay === 6) return false;

  const ecuadorMinutes = (utcMinutes - 5 * 60 + 24 * 60) % (24 * 60);

  const MORNING_START = 8 * 60;
  const MORNING_END = 12 * 60 + 45;
  const AFTERNOON_START = 15 * 60;
  const AFTERNOON_END = 17 * 60 + 45;

  if (
    (ecuadorMinutes >= MORNING_START && ecuadorMinutes < MORNING_END) ||
    (ecuadorMinutes >= AFTERNOON_START && ecuadorMinutes < AFTERNOON_END)
  ) {
    return true;
  }

  return false;
}

const FORM_ROUTES = ['/tipo', '/datos', '/servicio', '/detalle', '/resultado'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isFormRoute = FORM_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}?`));

  if (isFormRoute && !isBusinessOpen()) {
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
