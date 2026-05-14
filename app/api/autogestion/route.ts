import { google } from 'googleapis';
import { NextResponse } from 'next/server';

import { checkRateLimit, getClientIp, sanitizeInput, validateRequired } from '@/lib/api-utilities';
import {
  applySheetStyling,
  ensureAsesorValidation,
  ensureHeadersAndFormat,
  getAuth,
  SHEETS_ID,
} from '@/lib/sheets-auth';

const SHEET_ID = 2_087_838_389;

const HEADERS = [
  'Fecha',
  'Nombres',
  'Cédula',
  'Correo',
  'Teléfono',
  'Servicio',
  'País',
  'Prefijo',
  'Modalidad',
  'Resultado',
  'Asesor',
];

interface AutogestionData {
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

    const validErrors = errors.filter((errorMessage) => errorMessage !== '');
    if (validErrors.length > 0) {
      return NextResponse.json({ error: validErrors.join(', ') }, { status: 400 });
    }

    const auth = getAuth();
    await auth.authorize();

    const sheets = google.sheets({ version: 'v4', auth });

    await ensureHeadersAndFormat(auth, sheets, 'AUTOGESTION', SHEET_ID, HEADERS);
    await ensureAsesorValidation(sheets, 'AUTOGESTION', SHEET_ID, 10);
    await applySheetStyling(auth, sheets, 'AUTOGESTION', SHEET_ID, 10);

    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SHEETS_ID,
      range: 'AUTOGESTION!A:K',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            sanitizeInput(data.fecha),
            sanitizeInput(data.nombres),
            sanitizeInput(data.cedula),
            sanitizeInput(data.email),
            sanitizeInput(data.telefono ?? ''),
            sanitizeInput(data.servicio),
            sanitizeInput(data.pais ?? 'Ecuador'),
            sanitizeInput(data.prefijoTelefonico ?? '+593'),
            sanitizeInput(data.modalidad ?? '-'),
            sanitizeInput(data.resultado),
            sanitizeInput(''),
          ],
        ],
      },
    });

    console.log(' Autogestión guardada en Google Sheet');
    return NextResponse.json({ success: true, message: 'Autogestión guardada' });
  } catch (error) {
    console.error(' Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
