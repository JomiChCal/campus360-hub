import { NextResponse } from 'next/server';

import { checkRateLimit, getClientIp } from '@/lib/api-utilities';

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json({
      currentTurno: 0,
      nextTurno: 1,
      totalAtendidos: 0,
      message: 'Sistema de turnos operativo',
    });
  } catch (error) {
    console.error('Error en turnos-dinamicos:', String(error));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
