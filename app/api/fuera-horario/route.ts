import { google, sheets_v4 } from 'googleapis';
import { NextResponse } from 'next/server';

import {
  checkRateLimit,
  getClientIp,
  sanitizeInput,
  validateCedula,
  validatePhone,
  validateRequired,
} from '@/lib/api-utilities';
import {
  applySheetStyling,
  ensureAsesorValidation,
  ensureHeadersAndFormat,
  getAuth,
  getSheetIdByName,
  SHEETS_ID,
} from '@/lib/sheets-auth';

const SHEET_NAME = 'FUERA_HORARIO';

const HEADERS = [
  'Hora Contacto Preferida',
  'Fecha',
  'Nombres',
  'Cédula',
  'Correo',
  'País',
  'Prefijo',
  'Teléfono',
  'Modalidad',
  'Servicio',
  'Detalle',
  'Origen',
  'Asesor',
];

interface FueraHorarioData {
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

function parseTimeRange(
  range: string
): { startHour: number; startMinute: number; endHour: number; endMinute: number } | null {
  const match = range.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return {
    startHour: Number.parseInt(match[1], 10),
    startMinute: Number.parseInt(match[2], 10),
    endHour: Number.parseInt(match[3], 10),
    endMinute: Number.parseInt(match[4], 10),
  };
}

async function sortByContactTime(auth: ReturnType<typeof getAuth>, sheets: sheets_v4.Sheets) {
  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: SHEETS_ID,
    range: 'FUERA_HORARIO!A:M',
  });

  const rows = response.data.values ?? [];
  if (rows.length <= 1) return;

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  function getNextBusinessDay(fechaStr: string): number {
    const datePart = (fechaStr ?? '').split(',')[0].trim();
    if (!datePart) return Number.POSITIVE_INFINITY;
    const parts = datePart.split('/').map(Number);
    if (parts.length !== 3) return Number.POSITIVE_INFINITY;
    const date = new Date(parts[2], parts[1] - 1, parts[0]);
    if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
    const dayOfWeek = date.getDay();
    const nextBiz = new Date(date);
    if (dayOfWeek === 5) nextBiz.setDate(date.getDate() + 3);
    else if (dayOfWeek === 6) nextBiz.setDate(date.getDate() + 2);
    else nextBiz.setDate(date.getDate() + 1);
    return nextBiz.getTime();
  }

  dataRows.sort((a, b) => {
    const bizDayA = getNextBusinessDay(a[1] ?? '');
    const bizDayB = getNextBusinessDay(b[1] ?? '');
    if (bizDayA !== bizDayB) return bizDayA - bizDayB;

    const timeA = parseTimeRange(a[0] ?? '');
    const timeB = parseTimeRange(b[0] ?? '');
    if (!timeA && !timeB) return 0;
    if (!timeA) return 1;
    if (!timeB) return -1;
    return timeA.startHour * 60 + timeA.startMinute - (timeB.startHour * 60 + timeB.startMinute);
  });

  const sortedRows = [headerRow, ...dataRows];

  await sheets.spreadsheets.values.clear({
    auth,
    spreadsheetId: SHEETS_ID,
    range: 'FUERA_HORARIO!A1:M',
  });

  await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId: SHEETS_ID,
    range: 'FUERA_HORARIO!A1',
    valueInputOption: 'RAW',
    requestBody: { values: sortedRows },
  });
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

    const cedulaError = validateCedula(data.cedula);
    if (cedulaError) errors.push(cedulaError);

    const phoneError = validatePhone(data.telefono);
    if (phoneError) errors.push(phoneError);

    const validErrors = errors.filter((errorMessage) => errorMessage !== '');
    if (validErrors.length > 0) {
      return NextResponse.json({ error: validErrors.join(', ') }, { status: 400 });
    }

    const auth = getAuth();
    await auth.authorize();

    const sheets = google.sheets({ version: 'v4', auth });

    const sheetId = await getSheetIdByName(sheets, SHEET_NAME);

    await ensureHeadersAndFormat(auth, sheets, SHEET_NAME, sheetId, HEADERS);
    await ensureAsesorValidation(sheets, SHEET_NAME, sheetId, 12);
    await applySheetStyling(auth, sheets, SHEET_NAME, sheetId, 12);

    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SHEETS_ID,
      range: 'FUERA_HORARIO!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            sanitizeInput(data.horaContactoPreferida),
            sanitizeInput(data.fecha),
            sanitizeInput(data.nombres),
            sanitizeInput(data.cedula),
            sanitizeInput(data.email),
            sanitizeInput(data.pais ?? 'Ecuador'),
            sanitizeInput(data.prefijoTelefonico ?? '+593'),
            sanitizeInput(data.telefono),
            sanitizeInput(data.modalidad ?? '-'),
            sanitizeInput(data.servicio),
            sanitizeInput(data.freeText ?? ''),
            sanitizeInput(data.origen),
            sanitizeInput(''),
          ],
        ],
      },
    });

    try {
      await sortByContactTime(auth, sheets);
    } catch (sortError) {
      console.warn('Warning: Could not sort sheet by contact time:', String(sortError));
    }

    console.log(' Solicitud fuera de horario guardada en Google Sheet');
    return NextResponse.json({ success: true, message: 'Solicitud fuera de horario guardada' });
  } catch (error) {
    console.error(' Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
