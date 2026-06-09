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
import { getNextTurnoNumber } from '@/lib/server/turno-counter';
import { generateZoomLink, generateWebZoomLink } from '@/lib/server/zoom';

function todayDateOnly(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function getFechaHora(): string {
  return new Date().toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface AsignarTurnoData {
  requestId?: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  telefono: string;
  servicio: string;
  freeText?: string;
  modalidad?: string;
  origen: string;
  pais?: string;
  prefijoTelefonico?: string;
}

export async function PUT(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'asignar') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const data: AsignarTurnoData = await request.json();

    const errors: string[] = [
      validateRequired(data.nombres, 'Nombres') ?? '',
      validateRequired(data.apellidos, 'Apellidos') ?? '',
      validateRequired(data.cedula, 'Cédula') ?? '',
      validateRequired(data.email, 'Correo') ?? '',
      validateRequired(data.telefono, 'Teléfono') ?? '',
      validateRequired(data.servicio, 'Servicio') ?? '',
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

    const today = todayDateOnly();
    const turnoNumber = getNextTurnoNumber(today);
    const fechaHora = getFechaHora();
    const nombreCompleto = `${data.nombres} ${data.apellidos}`;

    await callPowerAutomate(WEBHOOK_URLS.crearTurno, {
      requestId: data.requestId,
      turno: sanitizeInput(turnoNumber),
      fecha: sanitizeInput(fechaHora),
      nombres: sanitizeInput(nombreCompleto),
      cedula: sanitizeInput(data.cedula),
      correo: sanitizeInput(data.email),
      pais: sanitizeInput(data.pais ?? 'Ecuador'),
      prefijo: sanitizeInput(data.prefijoTelefonico ?? '+593'),
      telefono: sanitizeInput(data.telefono),
      modalidad: sanitizeInput(data.modalidad ?? '-'),
      servicio: sanitizeInput(data.servicio),
      detalle: sanitizeInput(data.freeText ?? ''),
      origen: sanitizeInput(data.origen),
      asesor: '',
    });

    const zoomLink = generateZoomLink(turnoNumber, data.nombres, data.apellidos);
    const webZoomLink = generateWebZoomLink(turnoNumber, data.nombres, data.apellidos);

    console.log(`Turno ${turnoNumber} asignado a ${nombreCompleto}`);
    return NextResponse.json({ success: true, turnoNumber, zoomLink, webZoomLink });
  } catch (error) {
    console.error('Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
