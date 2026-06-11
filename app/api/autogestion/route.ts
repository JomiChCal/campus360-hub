import { NextResponse } from 'next/server';

import { checkRateLimit, getClientIp, sanitizeInput, validateIdentification, validateRequired } from '@/lib/server/api-utilities';
import { callPowerAutomate, WEBHOOK_URLS } from '@/lib/server/power-automate';

interface AutogestionData {
  requestId?: string;
  fecha: string;
  nombres: string;
  cedula: string;
  email: string;
  telefono?: string;
  servicio: string;
  resultado: string;
  pais?: string;
  prefijoTelefonico?: string;
  modalidad?: string;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const data: AutogestionData = await request.json();

    const errors: string[] = [
      validateRequired(data.nombres, 'Nombres') ?? '',
      validateRequired(data.cedula, 'Cédula') ?? '',
      validateRequired(data.email, 'Correo') ?? '',
      validateRequired(data.servicio, 'Servicio') ?? '',
      validateRequired(data.resultado, 'Resultado') ?? '',
    ];

    const cedulaError = validateIdentification(data.cedula);
    if (cedulaError) errors.push(cedulaError);

    const validErrors = errors.filter((errorMessage) => errorMessage !== '');
    if (validErrors.length > 0) {
      return NextResponse.json({ error: validErrors.join(', ') }, { status: 400 });
    }

    await callPowerAutomate(WEBHOOK_URLS.crearAutogestion, {
      requestId: data.requestId,
      fecha: sanitizeInput(data.fecha),
      nombres: sanitizeInput(data.nombres),
      cedula: sanitizeInput(data.cedula),
      email: sanitizeInput(data.email),
      telefono: sanitizeInput(data.telefono ?? ''),
      servicio: sanitizeInput(data.servicio),
      pais: sanitizeInput(data.pais ?? 'Ecuador'),
      prefijo: sanitizeInput(data.prefijoTelefonico ?? '+593'),
      modalidad: sanitizeInput(data.modalidad ?? '-'),
      resultado: sanitizeInput(data.resultado),
      asesor: '',
    });

    console.log('Autogestión guardada exitosamente');
    return NextResponse.json({ success: true, message: 'Autogestión guardada' });
  } catch (error) {
    console.error('Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
