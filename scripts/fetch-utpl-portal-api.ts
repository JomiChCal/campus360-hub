import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  STUDENT_TYPE_ORDER,
  UTPL_PORTAL_API_URL,
  type UtplPortalApiRow,
} from '../lib/seed/utpl-portal-api-types';

const OUTPUT_PATH = path.join(process.cwd(), 'data/utpl-portal-raw.json');
const MANIFEST_PATH = path.join(process.cwd(), 'data/utpl-portal-fetch-manifest.json');

const KNOWN_API_KEYS = [
  'field_tipo_estudiante',
  'field_descripcion_servicio',
  'field_nombre_servicio',
  'field_categoria_servicio',
  'field_nombre_servicio_1',
] as const satisfies ReadonlyArray<keyof UtplPortalApiRow>;

function isStructuralRow(title: string): boolean {
  const trimmed = title.trim();
  if (trimmed.toLowerCase() === 'disableblock') return true;
  return /^[🟡🟢🔵⚪]/.test(trimmed);
}

function assertRow(
  row: unknown,
  index: number,
  unknownKeys: Set<string>,
): asserts row is UtplPortalApiRow {
  if (!row || typeof row !== 'object') {
    throw new Error(`Row ${index} is not an object`);
  }
  const record = row as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!(KNOWN_API_KEYS as readonly string[]).includes(key)) {
      unknownKeys.add(key);
    }
  }

  for (const key of KNOWN_API_KEYS) {
    if (typeof record[key] !== 'string') {
      throw new Error(`Row ${index} missing or invalid field: ${key}`);
    }
  }
}

type FetchManifest = {
  fetchedAt: string;
  apiUrl: string;
  recordCount: number;
  payloadSha256: string;
  apiKeys: string[];
  unknownApiKeys: string[];
  studentTypes: string[];
  missingStudentTypes: string[];
  categories: string[];
  structuralRows: number;
  contentRows: number;
  emptyDescriptionRows: number;
  rowsWithImages: number;
  rowsWithExternalLinks: number;
  duplicateTitlePairs: number;
};

function buildManifest(rows: UtplPortalApiRow[]): FetchManifest {
  const studentTypes = new Set<string>();
  const categories = new Set<string>();
  let structuralRows = 0;
  let emptyDescriptionRows = 0;
  let rowsWithImages = 0;
  let rowsWithExternalLinks = 0;
  let duplicateTitlePairs = 0;

  for (const row of rows) {
    row.field_tipo_estudiante
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((type) => studentTypes.add(type));

    categories.add(row.field_categoria_servicio.trim());

    if (isStructuralRow(row.field_nombre_servicio)) {
      structuralRows += 1;
    }

    if (!row.field_descripcion_servicio.trim()) {
      emptyDescriptionRows += 1;
    }

    if (row.field_descripcion_servicio.includes('<img')) {
      rowsWithImages += 1;
    }

    if (/href=["']https?:\/\//i.test(row.field_descripcion_servicio)) {
      rowsWithExternalLinks += 1;
    }

    if (row.field_nombre_servicio !== row.field_nombre_servicio_1) {
      duplicateTitlePairs += 1;
    }
  }

  const payloadSha256 = createHash('sha256')
    .update(JSON.stringify(rows))
    .digest('hex');

  return {
    fetchedAt: new Date().toISOString(),
    apiUrl: UTPL_PORTAL_API_URL,
    recordCount: rows.length,
    payloadSha256,
    apiKeys: [...KNOWN_API_KEYS],
    unknownApiKeys: [],
    studentTypes: [...studentTypes].sort(),
    missingStudentTypes: STUDENT_TYPE_ORDER.filter((code) => !studentTypes.has(code)),
    categories: [...categories].sort(),
    structuralRows,
    contentRows: rows.length - structuralRows,
    emptyDescriptionRows,
    rowsWithImages,
    rowsWithExternalLinks,
    duplicateTitlePairs,
  };
}

function printManifest(manifest: FetchManifest) {
  console.log('--- UTPL portal fetch audit ---');
  console.log('API:', manifest.apiUrl);
  console.log('Records:', manifest.recordCount);
  console.log('Payload SHA-256:', manifest.payloadSha256);
  console.log('API fields captured:', manifest.apiKeys.join(', '));

  if (manifest.unknownApiKeys.length > 0) {
    console.warn('WARNING: unknown API fields (not in our types):', manifest.unknownApiKeys);
  } else {
    console.log('Unknown API fields: none (schema matches portal response)');
  }

  console.log('Student types:', manifest.studentTypes.join(', '));
  if (manifest.missingStudentTypes.length > 0) {
    console.warn('WARNING: expected student types missing:', manifest.missingStudentTypes);
  }

  console.log('Categories:', manifest.categories.length);
  console.log(
    'Row breakdown: structural (headers/spacers)=',
    manifest.structuralRows,
    '| content services=',
    manifest.contentRows,
  );
  console.log(
    'HTML in descriptions: empty=',
    manifest.emptyDescriptionRows,
    '| with <img>=',
    manifest.rowsWithImages,
    '| with external links=',
    manifest.rowsWithExternalLinks,
  );

  if (manifest.duplicateTitlePairs > 0) {
    console.warn(
      'WARNING: rows where field_nombre_servicio !== field_nombre_servicio_1:',
      manifest.duplicateTitlePairs,
    );
  }

  console.log('Manifest written to', MANIFEST_PATH);
}

async function main() {
  const response = await fetch(UTPL_PORTAL_API_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Expected JSON array from UTPL portal API');
  }

  const unknownKeys = new Set<string>();
  data.forEach((row, index) => assertRow(row, index, unknownKeys));

  const rows = data as UtplPortalApiRow[];
  const manifest = buildManifest(rows);
  manifest.unknownApiKeys = [...unknownKeys].sort();

  await writeFile(OUTPUT_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log('Saved', rows.length, 'records to', OUTPUT_PATH);
  printManifest(manifest);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
