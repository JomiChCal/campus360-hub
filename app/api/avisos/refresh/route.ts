import { NextResponse } from 'next/server';

import { persistBanners, refreshBannersFromPayload } from '@/lib/server/banner-service';
import { verifyRefreshSecret } from '@/lib/server/refresh-auth';

export async function POST(request: Request) {
  if (!verifyRefreshSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw: unknown = await request.json();
    const messages = refreshBannersFromPayload(raw);
    await persistBanners(messages);

    return NextResponse.json({ success: true, count: messages.length });
  } catch (error) {
    console.error('[api/avisos/refresh] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
