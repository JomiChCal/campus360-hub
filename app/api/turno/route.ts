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
  SHEETS_ID,
} from '@/lib/sheets-auth';

const SHEET_ID = 0;
const HEADERS = [
  'Turno',
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

interface TurnoData {
  fecha: string;
  nombres: string;
  cedula: string;
  email: string;
  telefono: string;
  turno: string;
  origen: string;
  modalidad?: string;
  servicio: string;
  pais?: string;
  prefijoTelefonico?: string;
}

interface AsignarTurnoData {
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

function todayDateOnly(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

async function insertDaySeparator(
  auth: ReturnType<typeof getAuth>,
  sheets: sheets_v4.Sheets,
  lastDate: string,
  todayDate: string,
  existingRows: string[][]
) {
  let previousCount = 0;
  for (let index = 1; index < existingRows.length; index++) {
    const t = existingRows[index]?.[0] ?? '';
    if (t && !Number.isNaN(Number.parseInt(t, 10))) {
      const d = (existingRows[index]?.[1] ?? '').split(',')[0].trim();
      if (d === lastDate) {
        previousCount++;
      }
    }
  }

  const separatorResp = await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId: SHEETS_ID,
    range: 'TURNOS_ASESORIA!A:A',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[`--- Día anterior: ${previousCount} atenciones | Nuevo día: ${todayDate} ---`]],
    },
  });

  const updatedRange = separatorResp.data?.updates?.updatedRange ?? '';
  const rowMatch = updatedRange.match(/(\d+)/);
  if (rowMatch) {
    const separatorRow = Number.parseInt(rowMatch[0], 10);
    await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId: SHEETS_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: SHEET_ID,
                startRowIndex: separatorRow - 1,
                endRowIndex: separatorRow,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 0.9, blue: 0.2 },
                  textFormat: { bold: true },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });
  }

  console.log(
    ` Inserted separator: Día anterior: ${previousCount} atenciones | Nuevo día: ${todayDate}`
  );
}

export async function GET(request: Request) {
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

    if (action === 'next') {
      const auth = getAuth();
      await auth.authorize();
      const sheets = google.sheets({ version: 'v4', auth });

      const res = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: SHEETS_ID,
        range: 'TURNOS_ASESORIA!A:B',
      });

      const values = res.data.values ?? [];
      const today = todayDateOnly();
      let maxTurno = 0;

      for (let index = 1; index < values.length; index++) {
        const turnoCell = values[index]?.[0] ?? '';
        const turnoNumber = Number.parseInt(turnoCell, 10);
        if (Number.isNaN(turnoNumber)) continue;

        const fechaCell = values[index]?.[1] ?? '';
        const rowDate = fechaCell.split(',')[0].trim();
        if (rowDate === today && turnoNumber > maxTurno) {
          maxTurno = turnoNumber;
        }
      }

      const nextNumber = maxTurno + 1;
      return NextResponse.json({ nextNumber });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(' Error:', String(error));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
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

    const data: TurnoData = await request.json();

    const errors: string[] = [
      validateRequired(data.nombres, 'Nombres') ?? '',
      validateRequired(data.cedula, 'Cédula') ?? '',
      validateRequired(data.email, 'Correo') ?? '',
      validateRequired(data.telefono, 'Teléfono') ?? '',
      validateRequired(data.turno, 'Turno') ?? '',
      validateRequired(data.origen, 'Origen') ?? '',
      validateRequired(data.servicio, 'Servicio') ?? '',
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

    await ensureHeadersAndFormat(auth, sheets, 'TURNOS_ASESORIA', SHEET_ID, HEADERS);
    await ensureAsesorValidation(sheets, 'TURNOS_ASESORIA', SHEET_ID, 12);
    await applySheetStyling(auth, sheets, 'TURNOS_ASESORIA', SHEET_ID, 12);

    const existingResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SHEETS_ID,
      range: 'TURNOS_ASESORIA!A:B',
    });
    const existingRows = (existingResponse.data.values ?? []) as string[][];
    const todayDate = todayDateOnly();

    let lastDataRowIndex = -1;
    for (let index = existingRows.length - 1; index >= 1; index--) {
      const turnoValue = existingRows[index]?.[0] ?? '';
      if (turnoValue && !Number.isNaN(Number.parseInt(turnoValue, 10))) {
        lastDataRowIndex = index;
        break;
      }
    }

    if (lastDataRowIndex > 0) {
      const lastDateRaw = existingRows[lastDataRowIndex]?.[1] ?? '';
      const lastDate = lastDateRaw.split(',')[0].trim();

      if (lastDate !== todayDate) {
        await insertDaySeparator(auth, sheets, lastDate, todayDate, existingRows);
      }
    }

    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SHEETS_ID,
      range: 'TURNOS_ASESORIA!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            sanitizeInput(data.turno),
            sanitizeInput(data.fecha),
            sanitizeInput(data.nombres),
            sanitizeInput(data.cedula),
            sanitizeInput(data.email),
            sanitizeInput(data.pais ?? 'Ecuador'),
            sanitizeInput(data.prefijoTelefonico ?? '+593'),
            sanitizeInput(data.telefono),
            sanitizeInput(data.modalidad ?? '-'),
            sanitizeInput(data.servicio),
            sanitizeInput(''),
            sanitizeInput(data.origen),
            sanitizeInput(''),
          ],
        ],
      },
    });

    console.log(' Turno guardado en Google Sheet');
    return NextResponse.json({ success: true, message: 'Turno guardado' });
  } catch (error) {
    console.error(' Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
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

    const data: AsignarTurnoData = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'asignar') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const errors: string[] = [
      validateRequired(data.nombres, 'Nombres') ?? '',
      validateRequired(data.apellidos, 'Apellidos') ?? '',
      validateRequired(data.cedula, 'Cédula') ?? '',
      validateRequired(data.email, 'Correo') ?? '',
      validateRequired(data.telefono, 'Teléfono') ?? '',
      validateRequired(data.servicio, 'Servicio') ?? '',
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

    await ensureHeadersAndFormat(auth, sheets, 'TURNOS_ASESORIA', SHEET_ID, HEADERS);
    await ensureAsesorValidation(sheets, 'TURNOS_ASESORIA', SHEET_ID, 12);
    await applySheetStyling(auth, sheets, 'TURNOS_ASESORIA', SHEET_ID, 12);

    const MAX_RETRIES = 3;
    let attempt = 0;
    let nextTurno = '001';
    let existingRows: string[][] = [];

    const todayDate = todayDateOnly();
    const fechaHora = new Date().toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const nombreCompleto = `${data.nombres} ${data.apellidos}`;

    while (attempt < MAX_RETRIES) {
      const existingResponse = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: SHEETS_ID,
        range: 'TURNOS_ASESORIA!A:B',
      });
      existingRows = (existingResponse.data.values ?? []) as string[][];

      let maxTurno = 0;
      for (let index = 1; index < existingRows.length; index++) {
        const turnoCell = existingRows[index]?.[0] ?? '';
        const turnoNumber = Number.parseInt(turnoCell, 10);
        if (Number.isNaN(turnoNumber)) continue;
        const fechaCell = existingRows[index]?.[1] ?? '';
        const rowDate = fechaCell.split(',')[0].trim();
        if (rowDate === todayDate && turnoNumber > maxTurno) {
          maxTurno = turnoNumber;
        }
      }

      nextTurno = String(maxTurno + 1).padStart(3, '0');

      let lastDataRowIndex = -1;
      for (let index = existingRows.length - 1; index >= 1; index--) {
        const turnoValue = existingRows[index]?.[0] ?? '';
        if (turnoValue && !Number.isNaN(Number.parseInt(turnoValue, 10))) {
          lastDataRowIndex = index;
          break;
        }
      }

      if (lastDataRowIndex > 0) {
        const lastDateRaw = existingRows[lastDataRowIndex]?.[1] ?? '';
        const lastDate = lastDateRaw.split(',')[0].trim();
        if (lastDate !== todayDate) {
          let previousCount = 0;
          for (let index = 1; index < existingRows.length; index++) {
            const t = existingRows[index]?.[0] ?? '';
            if (t && !Number.isNaN(Number.parseInt(t, 10))) {
              const d = (existingRows[index]?.[1] ?? '').split(',')[0].trim();
              if (d === lastDate) {
                previousCount++;
              }
            }
          }

          await sheets.spreadsheets.values.append({
            auth,
            spreadsheetId: SHEETS_ID,
            range: 'TURNOS_ASESORIA!A:A',
            valueInputOption: 'RAW',
            requestBody: {
              values: [[`--- Día anterior: ${previousCount} atenciones | Nuevo día: ${todayDate} ---`]],
            },
          });
        }
      }

      await sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: SHEETS_ID,
        range: 'TURNOS_ASESORIA!A:M',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [
              sanitizeInput(nextTurno),
              sanitizeInput(fechaHora),
              sanitizeInput(nombreCompleto),
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

      const verifyResponse = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: SHEETS_ID,
        range: 'TURNOS_ASESORIA!A:A',
      });
      const verifyRows = verifyResponse.data.values ?? [];
      const lastTurno = verifyRows[verifyRows.length - 1]?.[0] ?? '';

      if (lastTurno === nextTurno) break;

      attempt++;
      if (attempt < MAX_RETRIES) {
        console.warn(
          `Race condition detected (attempt ${attempt}/${MAX_RETRIES}), retrying turn assignment...`
        );
      }
    }

    if (attempt >= MAX_RETRIES) {
      console.error(`Failed to assign turn after ${MAX_RETRIES} attempts due to race conditions`);
      return NextResponse.json(
        { success: false, error: 'Error de concurrencia al asignar turno. Intenta de nuevo.' },
        { status: 409 }
      );
    }

    console.log(` Turno ${nextTurno} asignado a ${nombreCompleto}`);
    return NextResponse.json({ success: true, turnoNumber: nextTurno, message: 'Turno asignado' });
  } catch (error) {
    console.error(' Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
