import { NextResponse } from 'next/server';

import { BANNER_ROTATION_INTERVAL_MS, getActiveBanners } from '@/lib/server/banner-service';
import { checkRateLimit, getClientIp } from '@/lib/server/api-utilities';

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const messages = await getActiveBanners();

    return NextResponse.json(
      { messages, rotationIntervalMs: BANNER_ROTATION_INTERVAL_MS },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[api/avisos] Error:', error);
    return NextResponse.json(
      { messages: [], rotationIntervalMs: BANNER_ROTATION_INTERVAL_MS },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
