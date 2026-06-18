import { NextResponse } from 'next/server';

import { callPowerAutomate, WEBHOOK_URLS } from '@/lib/server/power-automate';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log(`[qstash-worker] Enviando turno ${data.turno} a Power Automate`);

    await callPowerAutomate(WEBHOOK_URLS.crearTurno, {
      requestId: data.requestId,
      turno: data.turno,
      fecha: data.fecha,
      nombres: data.nombres,
      cedula: data.cedula,
      email: data.email,
      pais: data.pais,
      prefijo: data.prefijo,
      telefono: data.telefono,
      modalidad: data.modalidad,
      servicio: data.servicio,
      detalle: data.detalle ?? '',
      origen: data.origen,
      asesor: data.asesor ?? '',
    });

    console.log(`[qstash-worker] Turno ${data.turno} enviado exitosamente a Power Automate`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[qstash-worker] Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
