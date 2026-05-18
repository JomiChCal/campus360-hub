import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  mapUtplPortalApiToSeed,
  toUtplServicesJson,
} from '../lib/seed/map-utpl-portal-api';
import type { UtplPortalApiRow } from '../lib/seed/utpl-portal-api-types';

const RAW_PATH = path.join(process.cwd(), 'data/utpl-portal-raw.json');
const OUTPUT_PATH = path.join(process.cwd(), 'data/utpl-servicios-academicos.json');
const REPORT_PATH = path.join(process.cwd(), 'data/utpl-portal-import-report.json');

async function main() {
  const raw = await readFile(RAW_PATH, 'utf8');
  const rows = JSON.parse(raw) as UtplPortalApiRow[];

  const { studentTypes, report } = mapUtplPortalApiToSeed(rows);
  const json = toUtplServicesJson(studentTypes);

  await writeFile(OUTPUT_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('Transform complete');
  console.log(JSON.stringify(report, null, 2));
  console.log('Written to', OUTPUT_PATH);
  console.log('Report written to', REPORT_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
