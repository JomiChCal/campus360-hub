import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';

import {
  applySheetStyling,
  ensureAsesorValidation,
  getAuth,
  getSheetIdByName,
  SHEETS_ID,
} from '@/lib/sheets-auth';

const TURNOS_HEADERS = [
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

const AUTOGESTION_HEADERS = [
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

const FUERA_HEADERS = [
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

const FOOTBALLERS = [
  'Lionel Messi',
  'Cristiano Ronaldo',
  'Neymar Jr',
  'Kylian Mbappé',
  'Luis Suárez',
  'Robert Lewandowski',
  'Luka Modrić',
  'Kevin De Bruyne',
  'Vinícius Júnior',
  'Erling Haaland',
];

async function ensureAsesorSheet(sheets: sheets_v4.Sheets) {
  try {
    await sheets.spreadsheets.values.get({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!A1',
    });
    console.log('  ASESORES sheet already exists, skipping creation');
  } catch {
    console.log('  Creating ASESORES sheet...');
    await sheets.spreadsheets.batchUpdate({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: 'ASESORES', gridProperties: { columnCount: 2 } },
            },
          },
        ],
      },
    });

    await sheets.spreadsheets.values.update({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!A1:B1',
      valueInputOption: 'RAW',
      requestBody: { values: [['Nombre', 'Asesores Externos']] },
    });

    await sheets.spreadsheets.values.append({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!A:A',
      valueInputOption: 'RAW',
      requestBody: { values: FOOTBALLERS.map((n) => [n]) },
    });

    console.log(`  Seeded ${FOOTBALLERS.length} asesores`);
  }

  // Ensure Asesores Externos column header exists
  const asesoresId = await getSheetIdByName(sheets, 'ASESORES');
  try {
    const b1 = await sheets.spreadsheets.values.get({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!B1',
    });
    if ((b1.data.values?.[0]?.[0] ?? '') !== 'Asesores Externos') {
      await sheets.spreadsheets.values.update({
        auth: getAuth(),
        spreadsheetId: SHEETS_ID,
        range: 'ASESORES!B1',
        valueInputOption: 'RAW',
        requestBody: { values: [['Asesores Externos']] },
      });
      console.log('  Added Asesores Externos column (B)');
    }
  } catch (bError) {
    console.log('  Expanding ASESORES sheet to 2 columns...');
    await sheets.spreadsheets.batchUpdate({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: {
              sheetId: asesoresId,
              gridProperties: { columnCount: 2 },
            },
            fields: 'gridProperties.columnCount',
          },
        }],
      },
    });
    await sheets.spreadsheets.values.update({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!B1',
      valueInputOption: 'RAW',
      requestBody: { values: [['Asesores Externos']] },
    });
    console.log('  Added Asesores Externos column (B)');
  }
}

async function clearAndSetupSheet(
  sheets: sheets_v4.Sheets,
  sheetName: string,
  sheetId: number,
  headers: string[]
) {
  const colLetter = String.fromCodePoint(64 + headers.length);
  const response = await sheets.spreadsheets.values.get({
    auth: getAuth(),
    spreadsheetId: SHEETS_ID,
    range: `${sheetName}!A1:${colLetter}1`,
  });

  const currentHeaders = response.data.values?.[0] ?? [];
  const fullMatch =
    currentHeaders.length === headers.length &&
    headers.every((h, i) => h === (currentHeaders[i] ?? ''));

  if (fullMatch) {
    console.log(`  ${sheetName}: headers already match (${headers.length} cols), skipping clear`);
    return;
  }

  console.log(
    `  ${sheetName}: headers mismatch (current: ${currentHeaders.length} cols, expected: ${headers.length}), clearing...`
  );
  await sheets.spreadsheets.values.clear({
    auth: getAuth(),
    spreadsheetId: SHEETS_ID,
    range: `${sheetName}!A:Z`,
  });

  console.log(`  ${sheetName}: writing new headers...`);
  const range = `${sheetName}!A1:${String.fromCodePoint(64 + headers.length)}1`;
  await sheets.spreadsheets.values.update({
    auth: getAuth(),
    spreadsheetId: SHEETS_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  });

  await sheets.spreadsheets.batchUpdate({
    auth: getAuth(),
    spreadsheetId: SHEETS_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0, green: 0.2, blue: 0.4 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  bold: true,
                  fontSize: 11,
                },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        {
          updateBorders: {
            range: { sheetId },
            top: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
            bottom: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
            left: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
            right: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
            innerHorizontal: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
            innerVertical: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
          },
        },
      ],
    },
  });
}

async function main() {
  console.log('\n Setting up Google Sheets...\n');
  console.log(`Spreadsheet ID: ${SHEETS_ID}\n`);

  const auth = getAuth();
  await auth.authorize();
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('--- ASESORES ---');
  await ensureAsesorSheet(sheets);

  const idT = await getSheetIdByName(sheets, 'TURNOS_ASESORIA');
  const idA = await getSheetIdByName(sheets, 'AUTOGESTION');
  const idF = await getSheetIdByName(sheets, 'FUERA_HORARIO');

  console.log('\n--- TURNOS_ASESORIA (sheetId:', idT, ') ---');
  await clearAndSetupSheet(sheets, 'TURNOS_ASESORIA', idT, TURNOS_HEADERS);
  await applySheetStyling(auth, sheets, 'TURNOS_ASESORIA', idT, 12);

  console.log('\n--- AUTOGESTION (sheetId:', idA, ') ---');
  await clearAndSetupSheet(sheets, 'AUTOGESTION', idA, AUTOGESTION_HEADERS);
  await applySheetStyling(auth, sheets, 'AUTOGESTION', idA, 10);

  console.log('\n--- FUERA_HORARIO (sheetId:', idF, ') ---');
  await clearAndSetupSheet(sheets, 'FUERA_HORARIO', idF, FUERA_HEADERS);
  await applySheetStyling(auth, sheets, 'FUERA_HORARIO', idF, 12);

  console.log('\n Setting up data validation on Asesor columns...');
  await ensureAsesorValidation(sheets, 'TURNOS_ASESORIA', idT, 12);
  await ensureAsesorValidation(sheets, 'AUTOGESTION', idA, 10);
  await ensureAsesorValidation(sheets, 'FUERA_HORARIO', idF, 12);

  console.log('\n Setup complete! Open your sheet to see the changes.\n');
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
