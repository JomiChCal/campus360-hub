import { NextResponse } from 'next/server';

import { normalizeSharePointPayload, resolveActiveSchedule } from '@/lib/schedule-config-core';
import { readScheduleStore, upsertHorarioRow } from '@/lib/schedule-config-store';
import { getScheduleStorageBackend } from '@/lib/schedule-kv';

function verifyAuth(request: Request): boolean {
  const secret = process.env.REFRESH_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('Authorization');
  return auth === `Bearer ${secret}`;
}

export async function handleRefreshConfigPost(request: Request): Promise<NextResponse> {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const currentStore = await readScheduleStore();
    const tituloHint = String(
      body.Titulo ?? body.Title ?? body.titulo ?? body.title ?? ''
    ).trim();
    const existing = tituloHint ? currentStore.horarios[tituloHint] : undefined;
    const { titulo, row } = normalizeSharePointPayload(body, existing);
    const store = await upsertHorarioRow(titulo, row);
    const resolved = resolveActiveSchedule(store);

    return NextResponse.json({
      success: true,
      resolved,
      horarios: store.horarios,
      updatedAt: store.updatedAt,
      storage: getScheduleStorageBackend(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function handleScheduleConfigGet(): Promise<NextResponse> {
  const store = await readScheduleStore();
  const resolved = resolveActiveSchedule(store);

  return NextResponse.json(
    {
      horarios: store.horarios,
      resolved,
      updatedAt: store.updatedAt,
      storage: getScheduleStorageBackend(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
