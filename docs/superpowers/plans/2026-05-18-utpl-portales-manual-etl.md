# UTPL Portales Manual ETL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cargar manualmente datos de `https://portales.utpl.edu.ec/servicios-academicos` a Neon con máxima normalización, sin tocar esquema, descartando solo filas sin tipo de estudiante válido.

**Architecture:** Mantener pipeline actual `fetch -> transform -> seed -> validate`, pero ajustar reglas de mapeo: dejar de descartar filas estructurales por título (`disableblock`, prefijos emoji), normalizar títulos agresivamente y descartar únicamente filas sin tipo válido. Encapsular corrida manual en un comando orquestado para precisión operativa y auditoría consistente.

**Tech Stack:** TypeScript, tsx scripts, Prisma + Neon, Vitest, pnpm.

---

## File Structure

- Modify: `lib/seed/map-utpl-portal-api.ts`
  - Nueva normalización de títulos.
  - Nueva regla de descarte (solo tipo inválido/vacío).
  - Ajuste de reporte de importación.
- Modify: `lib/seed/classify-utpl-portal-row.ts`
  - Eliminar descarte por título estructural.
  - Mantener utilidad mínima de clasificación o convertirla en helper de metadata.
- Modify: `tests/lib/seed/map-utpl-portal-api.test.ts`
  - Cobertura de reglas nuevas (keep structural rows, drop empty-type rows, normalization).
- Modify: `tests/lib/seed/classify-utpl-portal-row.test.ts`
  - Alinear comportamiento nuevo (no descartar por `disableblock` ni headers visuales).
- Create: `scripts/run-utpl-portal-manual-etl.ts`
  - Orquestador manual único: fetch + transform + seed + validate.
- Modify: `package.json`
  - Script nuevo `import:servicios:manual`.
- Modify: `README.md`
  - Runbook manual preciso para operación humana.

---

### Task 1: Red Tests for New ETL Policy

**Files:**
- Modify: `tests/lib/seed/map-utpl-portal-api.test.ts`
- Modify: `tests/lib/seed/classify-utpl-portal-row.test.ts`
- Test: `tests/lib/seed/map-utpl-portal-api.test.ts`
- Test: `tests/lib/seed/classify-utpl-portal-row.test.ts`

- [ ] **Step 1: Add failing tests for mapping policy (keep structural titles, drop empty type)**

```ts
it('keeps structural-looking titles when student type is valid', () => {
  const rows: UtplPortalApiRow[] = [
    {
      field_tipo_estudiante: 'CONTINUO',
      field_categoria_servicio: 'SERVICIOS-MATRÍCULA',
      field_nombre_servicio: '🟡 SERVICIOS DE VALIDACION',
      field_nombre_servicio_1: '🟡 SERVICIOS DE VALIDACION',
      field_descripcion_servicio: '<p>Contenido útil</p>',
    },
  ];

  const { studentTypes, report } = mapUtplPortalApiToSeed(rows);
  const service = studentTypes[0]?.categories[0]?.services[0];

  expect(report.discardedRows).toBe(0);
  expect(service?.title).toBe('SERVICIOS DE VALIDACION');
});

it('discards rows with empty student type after normalization', () => {
  const rows: UtplPortalApiRow[] = [
    {
      field_tipo_estudiante: '   ',
      field_categoria_servicio: 'SERVICIOS-EVALUACIONES',
      field_nombre_servicio: 'Solicitar cambio de centro',
      field_nombre_servicio_1: 'Solicitar cambio de centro',
      field_descripcion_servicio: '<p>Texto</p>',
    },
  ];

  const { studentTypes, report } = mapUtplPortalApiToSeed(rows);
  expect(studentTypes).toHaveLength(0);
  expect(report.discardedRows).toBe(1);
  expect(report.discardedRowDetails[0]?.reason).toBe('missing-valid-student-type');
});

it('normalizes emoji and bullet prefixes from service title', () => {
  const rows: UtplPortalApiRow[] = [
    {
      field_tipo_estudiante: 'NUEVO',
      field_categoria_servicio: 'SERVICIOS-MATRÍCULA',
      field_nombre_servicio: '🟢 •  Solicitar edición de matrícula',
      field_nombre_servicio_1: '🟢 •  Solicitar edición de matrícula',
      field_descripcion_servicio: '<p>Texto</p>',
    },
  ];

  const { studentTypes } = mapUtplPortalApiToSeed(rows);
  const service = studentTypes[0]?.categories[0]?.services[0];
  expect(service?.title).toBe('Solicitar edición de matrícula');
});
```

- [ ] **Step 2: Update classifier tests to new behavior contract**

```ts
it('does not discard disableblock rows anymore', () => {
  expect(
    classifyUtplPortalRow({
      field_tipo_estudiante: 'NUEVO',
      field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
      field_nombre_servicio: 'disableblock',
      field_nombre_servicio_1: 'disableblock',
      field_descripcion_servicio: '',
    }).kind,
  ).toBe('SERVICE');
});

it('does not discard visual header rows by title alone', () => {
  expect(
    classifyUtplPortalRow({
      field_tipo_estudiante: 'NUEVO, CONTINUO',
      field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
      field_nombre_servicio: '🟢 SERVICIOS DE HOMOLOGACION EXTERNA.',
      field_nombre_servicio_1: '🟢 SERVICIOS DE HOMOLOGACION EXTERNA.',
      field_descripcion_servicio: '',
    }).kind,
  ).toBe('SERVICE');
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:
```bash
pnpm vitest run tests/lib/seed/map-utpl-portal-api.test.ts tests/lib/seed/classify-utpl-portal-row.test.ts
```

Expected:
- FAIL on old discard behavior (`disableblock`/visual headers).
- FAIL on missing-type discard reason not implemented yet.

- [ ] **Step 4: Commit failing tests**

```bash
git add tests/lib/seed/map-utpl-portal-api.test.ts tests/lib/seed/classify-utpl-portal-row.test.ts
git commit -m "test(seed): codify new UTPL ETL keep-vs-discard policy"
```

---

### Task 2: Implement New Mapping + Normalization Rules

**Files:**
- Modify: `lib/seed/map-utpl-portal-api.ts`
- Modify: `lib/seed/classify-utpl-portal-row.ts`
- Test: `tests/lib/seed/map-utpl-portal-api.test.ts`
- Test: `tests/lib/seed/classify-utpl-portal-row.test.ts`

- [ ] **Step 1: Add robust title normalization helper**

```ts
export function normalizeServiceTitle(rawTitle: string): string {
  return rawTitle
    .trim()
    .replace(/^(\p{Extended_Pictographic}|\s)+/gu, '')
    .replace(/^[•*\-]+\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}
```

- [ ] **Step 2: Remove discard-by-title behavior in classifier**

```ts
export type UtplRowClassification = { kind: 'SERVICE'; hasStudentTypes: boolean };

export function classifyUtplPortalRow(row: UtplPortalApiRow): UtplRowClassification {
  const hasStudentTypes =
    row.field_tipo_estudiante
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean).length > 0;

  return { kind: 'SERVICE', hasStudentTypes };
}
```

- [ ] **Step 3: Change map flow to discard only missing/invalid type rows**

```ts
const types = normalizeTypeCodes(row.field_tipo_estudiante);
if (types.length === 0) {
  discardedRowDetails.push({
    globalIndex,
    title: row.field_nombre_servicio,
    reason: 'missing-valid-student-type',
  });
  return;
}
```

- [ ] **Step 4: Use new title normalizer in service mapping**

```ts
const rawTitle = row.field_nombre_servicio.trim();
const title = normalizeServiceTitle(rawTitle);
```

- [ ] **Step 5: Run focused tests to verify pass**

Run:
```bash
pnpm vitest run tests/lib/seed/map-utpl-portal-api.test.ts tests/lib/seed/classify-utpl-portal-row.test.ts
```

Expected:
- PASS for new keep/discard policy.
- PASS for title normalization cases.

- [ ] **Step 6: Commit implementation**

```bash
git add lib/seed/map-utpl-portal-api.ts lib/seed/classify-utpl-portal-row.ts
git commit -m "feat(seed): normalize UTPL rows and discard only missing-type records"
```

---

### Task 3: Add Manual One-Command ETL Orchestrator

**Files:**
- Create: `scripts/run-utpl-portal-manual-etl.ts`
- Modify: `package.json`
- Test: CLI run in local shell

- [ ] **Step 1: Add orchestrator script with strict sequential execution**

```ts
import { spawn } from 'node:child_process';

function runStep(
  name: string,
  command: string,
  args: string[],
  env?: Record<string, string>,
): Promise<void> {
  console.log(`\\n==> ${name}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...env },
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${name} failed with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  await runStep('Fetch portal payload', 'pnpm', ['import:servicios:fetch']);
  await runStep('Transform payload', 'pnpm', ['import:servicios:transform']);
  await runStep('Seed Neon', 'pnpm', ['db:seed:servicios'], {
    ACADEMIC_SERVICES_DATA_PROVIDER: 'neon',
  });
  await runStep('Validate seeded catalog', 'pnpm', ['validate:servicios:seed'], {
    ACADEMIC_SERVICES_DATA_PROVIDER: 'neon',
  });
  console.log('\\nUTPL manual ETL completed successfully.');
}

main().catch((error) => {
  console.error('UTPL manual ETL failed:', error);
  process.exit(1);
});
```

- [ ] **Step 2: Register package script**

```json
{
  "scripts": {
    "import:servicios:manual": "npx tsx --env-file=.env.local scripts/run-utpl-portal-manual-etl.ts"
  }
}
```

- [ ] **Step 3: Run command to validate orchestration**

Run:
```bash
pnpm import:servicios:manual
```

Expected:
- Runs 4 stages in order.
- Stops immediately if one stage fails.
- Leaves ETL artifacts in `data/`.

- [ ] **Step 4: Commit orchestration**

```bash
git add scripts/run-utpl-portal-manual-etl.ts package.json
git commit -m "feat(scripts): add single-command manual UTPL ETL pipeline"
```

---

### Task 4: Strengthen End-to-End ETL Verification

**Files:**
- Modify: `scripts/validate-neon-seed.ts`
- Test: `scripts/validate-neon-seed.ts` runtime output

- [ ] **Step 1: Add assertions tied to new policy**

```ts
assert(counts.studentTypes >= 4, 'Expected at least 4 active student types');
assert(counts.servicesPublicList > 0, 'Expected public services after ETL');
assert(counts.servicesDb >= counts.servicesPublicList, 'DB services must include public services');
```

- [ ] **Step 2: Add audit check for discard-only-empty-type expectation**

```ts
const report = JSON.parse(await readFile(path.join(process.cwd(), 'data/utpl-portal-import-report.json'), 'utf8'));
assert(
  report.discardedRowDetails.every((row: { reason: string }) => row.reason === 'missing-valid-student-type'),
  'Discard policy violation: found discard reasons other than missing-valid-student-type',
);
```

- [ ] **Step 3: Run verification script**

Run:
```bash
ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm validate:servicios:seed
```

Expected:
- JSON counts printed.
- No assertion errors.

- [ ] **Step 4: Commit validation hardening**

```bash
git add scripts/validate-neon-seed.ts
git commit -m "test(seed): enforce discard-only-empty-type ETL policy"
```

---

### Task 5: Update Operator Documentation and Final Regression

**Files:**
- Modify: `README.md`
- Validate: ETL artifacts and git diff

- [ ] **Step 1: Add concise manual ETL runbook section**

```md
## Importación manual UTPL -> Neon

Comando único:

```bash
pnpm import:servicios:manual
```

Artefactos generados:
- `data/utpl-portal-raw.json`
- `data/utpl-portal-fetch-manifest.json`
- `data/utpl-servicios-academicos.json`
- `data/utpl-portal-import-report.json`

Regla de descarte:
- Solo se descartan filas sin tipo de estudiante válido.
```
```

- [ ] **Step 2: Run full test pass for touched areas**

Run:
```bash
pnpm vitest run tests/lib/seed/classify-utpl-portal-row.test.ts tests/lib/seed/map-utpl-portal-api.test.ts tests/lib/seed/parse-utpl-description-html.test.ts
pnpm import:servicios:fetch
pnpm import:servicios:transform
```

Expected:
- Tests pass.
- Transform completes and emits report.

- [ ] **Step 3: Run final quality checks**

Run:
```bash
pnpm lint
pnpm test
```

Expected:
- Lint pass.
- Test suite pass.

- [ ] **Step 4: Commit docs + final integration**

```bash
git add README.md
git commit -m "docs(etl): document precise manual UTPL to Neon runbook"
```

---

## Spec Coverage Check

- Manual ETL only: covered by Task 3 + Task 5.
- No schema changes: plan modifies only seed/mapping/scripts/tests/docs.
- Normalize everything possible: Task 2 (title normalization + existing HTML sanitization path).
- Discard only empty/invalid student type: Task 1 + Task 2 + Task 4.
- Precision/auditability: Task 3 artifacts + Task 4 policy assertions.

## Placeholder Scan

- No marcadores de trabajo pendiente o frases ambiguas.
- Every coding step contains concrete snippet + concrete command.

## Type/Interface Consistency Check

- `UtplImportReport.discardedRowDetails[].reason` remains string-compatible.
- `mapUtplPortalApiToSeed` keeps same return shape consumed by `transform` and `seed` scripts.
- New script uses existing package scripts and existing env conventions.
