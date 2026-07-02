import { NextResponse } from 'next/server';

import { checkRateLimit, getClientIp } from '@/lib/server/api-utilities';
import { getScheduleConfigSnapshot } from '@/lib/server/schedule-service';

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { store, resolved, state, meta } = await getScheduleConfigSnapshot();

    return NextResponse.json(
      {
        horarios: store.horarios,
        resolved,
        state,
        updatedAt: store.updatedAt,
        meta,
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
        meta: {
          source: 'empty',
          redisEnabled: false,
          mockActive: false,
          ecuadorTime: null,
          isWeekday: null,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
