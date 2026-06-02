import { NextResponse } from 'next/server';

import { getScheduleConfig } from '@/lib/schedule-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getScheduleConfig();
  return NextResponse.json(config);
}
