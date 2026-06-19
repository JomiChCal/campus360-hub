import { NextResponse } from 'next/server';

import {
  getCategoriesForAudience,
  parseAudienceParam,
} from '@/lib/server/category-service';
import { checkRateLimit, getClientIp } from '@/lib/server/api-utilities';

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const audience = parseAudienceParam(searchParams.get('audience'));

  if (!audience) {
    return NextResponse.json(
      { error: 'Query param audience must be continuo or nuevo' },
      { status: 400 }
    );
  }

  try {
    const categories = await getCategoriesForAudience(audience);
    return NextResponse.json(
      { categories },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[api/categorias] Error:', error);
    return NextResponse.json(
      { categories: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
