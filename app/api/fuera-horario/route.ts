import { NextResponse } from 'next/server';

import { getCountryByName } from '@/data/countries';
import {
  checkRateLimit,
  getClientIp,
  sanitizeInput,
  validateIdentification,
  validatePhone,
  validateRequired,
} from '@/lib/server/api-utilities';
import { callPowerAutomate, WEBHOOK_URLS } from '@/lib/server/power-automate';

interface FueraHorarioData {
  requestId?: string;
  fecha: string;
  nombres: string;
  cedula: string;
  email: string;
  telefono: string;
  servicio: string;
  origen: string;
  modalidad?: string;
  freeText?: string;
  horaContactoPreferida: string;
  pais?: string;
  prefijoTelefonico?: string;
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

    const data: FueraHorarioData = await request.json();

    const errors: string[] = [
      validateRequired(data.nombres, 'Nombres') ?? '',
      validateRequired(data.cedula, 'Cédula') ?? '',
      validateRequired(data.email, 'Correo') ?? '',
      validateRequired(data.telefono, 'Teléfono') ?? '',
      validateRequired(data.servicio, 'Servicio') ?? '',
      validateRequired(data.horaContactoPreferida, 'Hora de contacto preferida') ?? '',
    ];

    const cedulaError = validateIdentification(data.cedula);
    if (cedulaError) errors.push(cedulaError);

    const country = getCountryByName(data.pais ?? 'Ecuador');
    const phoneError = validatePhone(data.telefono, country?.phoneDigits);
    if (phoneError) errors.push(phoneError);

    const validErrors = errors.filter((errorMessage) => errorMessage !== '');
    if (validErrors.length > 0) {
      return NextResponse.json({ error: validErrors.join(', ') }, { status: 400 });
    }

    await callPowerAutomate(WEBHOOK_URLS.crearFueraHorario, {
      requestId: data.requestId,
      HoraContacto: sanitizeInput(data.horaContactoPreferida),
      fecha: sanitizeInput(data.fecha),
      nombres: sanitizeInput(data.nombres),
      cedula: sanitizeInput(data.cedula),
      email: sanitizeInput(data.email),
      pais: sanitizeInput(data.pais ?? 'Ecuador'),
      prefijo: sanitizeInput(data.prefijoTelefonico ?? '+593'),
      telefono: sanitizeInput(data.telefono),
      modalidad: sanitizeInput(data.modalidad ?? '-'),
      servicio: sanitizeInput(data.servicio),
      detalle: sanitizeInput(data.freeText ?? ''),
      origen: sanitizeInput(data.origen),
      asesor: '',
    });

    console.log('Solicitud fuera de horario guardada exitosamente');
    return NextResponse.json({ success: true, message: 'Solicitud fuera de horario guardada' });
  } catch (error) {
    console.error('Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
