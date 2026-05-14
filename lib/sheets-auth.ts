import { JWT } from 'google-auth-library';
import type { sheets_v4 } from 'googleapis';

const SHEETS_ID = process.env.GOOGLE_SHEETS_ID ?? '';
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY ?? '';

const requiredEnvironmentVariables: Record<string, string> = {
  GOOGLE_SHEETS_ID: SHEETS_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: SERVICE_EMAIL,
  GOOGLE_PRIVATE_KEY: PRIVATE_KEY,
};

const missingEnvironmentVariables = Object.entries(requiredEnvironmentVariables)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`
  );
}

export { SHEETS_ID };

export function getAuth() {
  return new JWT({
    email: SERVICE_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const sheetIdCache = new Map<string, number>();

export async function getSheetIdByName(
  sheets: sheets_v4.Sheets,
  sheetName: string
): Promise<number> {
  if (sheetIdCache.has(sheetName)) return sheetIdCache.get(sheetName)!;

  const meta = await sheets.spreadsheets.get({
    auth: getAuth(),
    spreadsheetId: SHEETS_ID,
  });

  for (const s of meta.data.sheets ?? []) {
    if (s.properties?.title === sheetName && s.properties?.sheetId != null) {
      const id = s.properties.sheetId;
      sheetIdCache.set(sheetName, id);
      return id;
    }
  }

  throw new Error(`Sheet "${sheetName}" not found in spreadsheet`);
}

export async function ensureHeadersAndFormat(
  auth: JWT,
  sheets: sheets_v4.Sheets,
  sheetName: string,
  sheetId: number,
  headers: string[]
) {
  const countResponse = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: SHEETS_ID,
    range: `${sheetName}!A1:A1`,
  });
  const expectedHeader = headers[0];
  const hasHeaders = (countResponse.data.values?.[0]?.[0] ?? '') === expectedHeader;

  if (!hasHeaders) {
    const range = `${sheetName}!A1:${String.fromCodePoint(64 + headers.length)}1`;
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: SHEETS_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });

    const requests = [
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
    ];

    try {
      await sheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId: SHEETS_ID,
        requestBody: { requests },
      });
    } catch (error) {
      console.warn('Warning: Could not apply formatting:', String(error));
    }
  }
}

export async function ensureAsesorValidation(
  sheets: sheets_v4.Sheets,
  sheetName: string,
  sheetId: number,
  asesorColumnIndex: number
) {
  try {
    await sheets.spreadsheets.values.get({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!A1',
    });
  } catch {
    await sheets.spreadsheets.batchUpdate({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'ASESORES',
                gridProperties: { columnCount: 1 },
              },
            },
          },
        ],
      },
    });

    await sheets.spreadsheets.values.update({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [['Nombre']] },
    });

    await sheets.spreadsheets.values.append({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      range: 'ASESORES!A:A',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Lionel Messi'],
          ['Cristiano Ronaldo'],
          ['Neymar Jr'],
          ['Kylian Mbappé'],
          ['Luis Suárez'],
          ['Robert Lewandowski'],
          ['Luka Modrić'],
          ['Kevin De Bruyne'],
          ['Vinícius Júnior'],
          ['Erling Haaland'],
        ],
      },
    });
  }

  try {
    await sheets.spreadsheets.batchUpdate({
      auth: getAuth(),
      spreadsheetId: SHEETS_ID,
      requestBody: {
        requests: [
          {
            setDataValidation: {
              range: {
                sheetId,
                startRowIndex: 1,
                startColumnIndex: asesorColumnIndex,
                endColumnIndex: asesorColumnIndex + 1,
              },
              rule: {
                condition: {
                  type: 'ONE_OF_RANGE',
                  values: [{ userEnteredValue: '=ASESORES!A:A' }],
                },
                showCustomUi: true,
                strict: true,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.warn('Warning: Could not set Asesor validation:', String(error));
  }
}

const COLUMN_WIDTHS: Record<string, number[]> = {
  TURNOS_ASESORIA: [60, 160, 200, 110, 220, 100, 70, 130, 100, 220, 200, 70, 160],
  AUTOGESTION: [160, 200, 110, 220, 130, 220, 100, 70, 100, 130, 160],
  FUERA_HORARIO: [130, 160, 200, 110, 220, 100, 70, 130, 100, 220, 200, 70, 160],
};

export async function applySheetStyling(
  auth: JWT,
  sheets: sheets_v4.Sheets,
  sheetName: string,
  sheetId: number,
  asesorColumnIndex: number
) {
  const columnWidths = COLUMN_WIDTHS[sheetName];
  const asesorColumnLetter = String.fromCodePoint(65 + asesorColumnIndex);

  // Clear all existing conditional format rules first to prevent accumulation
  try {
    const meta = await sheets.spreadsheets.get({
      auth,
      spreadsheetId: SHEETS_ID,
      includeGridData: false,
    });
    const targetSheet = (meta.data.sheets ?? []).find(
      (s) => s.properties?.sheetId === sheetId
    );
    const existingRules = targetSheet?.conditionalFormats ?? [];
    if (existingRules.length > 0) {
      const deleteRequests: sheets_v4.Schema$Request[] = [];
      for (let i = existingRules.length - 1; i >= 0; i--) {
        deleteRequests.push({ deleteConditionalFormatRule: { sheetId, index: i } });
      }
      await sheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId: SHEETS_ID,
        requestBody: { requests: deleteRequests },
      });
    }
  } catch (error) {
    console.warn('Warning: Could not clear existing conditional formats:', String(error));
  }

  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 1 },
        },
        fields: 'gridProperties.frozenRowCount',
      },
    },
  ];

  if (columnWidths) {
    for (let col = 0; col < columnWidths.length; col++) {
      requests.push({
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: col,
            endIndex: col + 1,
          },
          properties: { pixelSize: columnWidths[col] },
          fields: 'pixelSize',
        },
      });
    }
  }

  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [
              {
                userEnteredValue: `=AND(NOT(ISBLANK($${asesorColumnLetter}1));NOT(ISEVEN(ROW()));ROW()>1)`,
              },
            ],
          },
          format: {
            backgroundColor: { red: 0.92, green: 0.98, blue: 0.92 },
          },
        },
      },
    },
  });

  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [
              {
                userEnteredValue: `=AND(NOT(ISBLANK($${asesorColumnLetter}1));ISEVEN(ROW());ROW()>1)`,
              },
            ],
          },
          format: {
            backgroundColor: { red: 0.82, green: 0.94, blue: 0.82 },
          },
        },
      },
    },
  });

  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [
              {
                userEnteredValue: `=AND(ISBLANK($${asesorColumnLetter}1);NOT(ISEVEN(ROW()));ROW()>1)`,
              },
            ],
          },
          format: {
            backgroundColor: { red: 1, green: 1, blue: 1 },
          },
        },
      },
    },
  });

  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [
              {
                userEnteredValue: `=AND(ISBLANK($${asesorColumnLetter}1);ISEVEN(ROW());ROW()>1)`,
              },
            ],
          },
          format: {
            backgroundColor: { red: 0.97, green: 0.98, blue: 0.99 },
          },
        },
      },
    },
  });

  try {
    await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId: SHEETS_ID,
      requestBody: { requests },
    });
  } catch (error) {
    console.warn('Warning: Could not apply sheet styling:', String(error));
  }
}
