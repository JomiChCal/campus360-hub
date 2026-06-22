import { NextResponse } from 'next/server';

import { getBusinessHoursStateFromResolved, getEcuadorClock } from '@/lib/schedule-core';
import { checkRateLimit, getClientIp } from '@/lib/server/api-utilities';
import { getResolvedSchedule, getScheduleStore } from '@/lib/server/schedule-service';

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const store = await getScheduleStore();
    const resolved = await getResolvedSchedule();
    const state = getBusinessHoursStateFromResolved(resolved, getEcuadorClock());

    return NextResponse.json(
      {
        horarios: store.horarios,
        resolved,
        state,
        updatedAt: store.updatedAt,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[api/schedule-config] Error:', error);
    return NextResponse.json(
      {
        horarios: {},
        resolved: { hasActiveSchedule: false },
        state: 'after-hours',
        updatedAt: null,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
