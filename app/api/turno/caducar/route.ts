import { NextResponse } from 'next/server';

import { callPowerAutomate } from '@/lib/server/power-automate';

const PA_ACTUALIZAR_TURNO_URL = process.env.PA_ACTUALIZAR_TURNO_URL ?? '';

export async function POST(request: Request) {
  try {
    if (!PA_ACTUALIZAR_TURNO_URL) {
      return NextResponse.json(
        { error: 'PA_ACTUALIZAR_TURNO_URL no configurado' },
        { status: 500 }
      );
    }

    const { requestId, turno, nuevoEstado, fechaCaducidad } = await request.json();

    if (!requestId || !turno || !nuevoEstado) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: requestId, turno, nuevoEstado' },
        { status: 400 }
      );
    }

    await callPowerAutomate(PA_ACTUALIZAR_TURNO_URL, {
      requestId,
      turno,
      nuevoEstado,
      fechaCaducidad: fechaCaducidad || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Turno marcado como caducado' });
  } catch (error) {
    console.error('[api/turno/caducar] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
