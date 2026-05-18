# UTPL Services Neon Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace runtime dependence on the UTPL portal feed with a normalized Neon-backed catalog that admins can edit end-to-end and students can consume safely.

**Architecture:** Keep the existing ports-and-adapters boundary, but refactor the Neon schema and seed pipeline around the approved hierarchy `StudentType -> ServiceCategory -> Service`. Import starts from a raw endpoint snapshot, filters structural rows, expands multi-type rows, parses HTML into normalized child tables, marks ambiguous rows as `needs_review`, and exposes only `published + active` data to `/servicios`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Prisma, Neon Postgres, Vitest, tsx, Zod, NextAuth v5.

---

## File Structure Map

**Seed ingestion and normalization**
- Modify: `scripts/fetch-utpl-portal-api.ts`
- Modify: `scripts/transform-utpl-portal-api.ts`
- Modify: `scripts/seed-academic-services.ts`
- Modify: `scripts/validate-neon-seed.ts`
- Create: `lib/seed/classify-utpl-portal-row.ts`
- Modify: `lib/seed/map-utpl-portal-api.ts`
- Modify: `lib/seed/parse-utpl-description-html.ts`
- Modify: `lib/seed/types.ts`
- Modify: `lib/seed/map-utpl-json.ts`

**Persistence and provider layer**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_normalize_utpl_catalog/`
- Modify: `lib/academic-services/domain/service-detail.ts`
- Modify: `lib/academic-services/ports/academic-services-read.ts`
- Modify: `lib/academic-services/ports/academic-services-write.ts`
- Modify: `lib/academic-services/providers/neon/mappers.ts`
- Modify: `lib/academic-services/providers/neon/read-port.ts`
- Modify: `lib/academic-services/providers/neon/write-port.ts`

**Admin presentation**
- Modify: `app/administrativo/actions.ts`
- Modify: `components/administrativo/StudentTypeForm.tsx`
- Modify: `components/administrativo/CategoryForm.tsx`
- Modify: `components/administrativo/ServiceForm/ServiceForm.tsx`
- Modify: `components/administrativo/AdministrativoPortal.tsx`

**Student presentation**
- Modify: `app/servicios/actions.ts`
- Modify: `components/servicios/ServiciosPortal.tsx`
- Modify: `components/servicios/ServiceCardGrid.tsx`
- Modify: `components/servicios/ServiceDetailContent.tsx`
- Modify: `components/servicios/RequirementTabs.tsx`
- Modify: `components/servicios/PeriodsTable.tsx`

**Tests**
- Modify: `tests/lib/seed/map-utpl-portal-api.test.ts`
- Modify: `tests/lib/seed/parse-utpl-description-html.test.ts`
- Modify: `tests/lib/academic-services/repositories/services.test.ts`
- Create: `tests/lib/seed/classify-utpl-portal-row.test.ts`

### Task 1: Snapshot and structural-row classifier

**Files:**
- Create: `lib/seed/classify-utpl-portal-row.ts`
- Modify: `lib/seed/map-utpl-portal-api.ts`
- Modify: `tests/lib/seed/map-utpl-portal-api.test.ts`
- Create: `tests/lib/seed/classify-utpl-portal-row.test.ts`

- [ ] **Step 1: Write the failing classifier test suite**

```ts
import { describe, expect, it } from 'vitest';

import { classifyUtplPortalRow } from '@/lib/seed/classify-utpl-portal-row';

describe('classifyUtplPortalRow', () => {
  it('drops disableblock rows', () => {
    expect(
      classifyUtplPortalRow({
        field_tipo_estudiante: 'NUEVO',
        field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
        field_nombre_servicio: 'disableblock',
        field_nombre_servicio_1: 'disableblock',
        field_descripcion_servicio: '',
      }).kind,
    ).toBe('DISCARD');
  });

  it('drops visual headers with no meaningful description', () => {
    expect(
      classifyUtplPortalRow({
        field_tipo_estudiante: 'NUEVO, CONTINUO',
        field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
        field_nombre_servicio: '🟢 SERVICIOS DE HOMOLOGACION EXTERNA.',
        field_nombre_servicio_1: '🟢 SERVICIOS DE HOMOLOGACION EXTERNA.',
        field_descripcion_servicio: '',
      }).kind,
    ).toBe('DISCARD');
  });

  it('keeps service rows even when title starts with emoji', () => {
    expect(
      classifyUtplPortalRow({
        field_tipo_estudiante: 'NUEVO, CONTINUO',
        field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
        field_nombre_servicio: '🟡 Solicitar validación general de inglés.',
        field_nombre_servicio_1: '🟡 Solicitar validación general de inglés.',
        field_descripcion_servicio: '<p><strong>Descripción:</strong> Dirigido a estudiantes...</p>',
      }).kind,
    ).toBe('SERVICE');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/seed/classify-utpl-portal-row.test.ts`
Expected: FAIL with `Cannot find module '@/lib/seed/classify-utpl-portal-row'`.

- [ ] **Step 3: Implement row classification**

```ts
import type { UtplPortalApiRow } from '@/lib/seed/utpl-portal-api-types';

export type UtplRowClassification =
  | { kind: 'DISCARD'; reason: 'disableblock' | 'visual-header' }
  | { kind: 'SERVICE'; hasStudentTypes: boolean };

const VISUAL_HEADER_PATTERN =
  /^[🟡🟢🔵⚪]\s*SERVICIOS DE\s+/i;

export function classifyUtplPortalRow(row: UtplPortalApiRow): UtplRowClassification {
  const title = row.field_nombre_servicio.trim();
  const plainDescription = row.field_descripcion_servicio.replace(/<[^>]+>/g, ' ').trim();

  if (title.toLowerCase() === 'disableblock') {
    return { kind: 'DISCARD', reason: 'disableblock' };
  }

  if (VISUAL_HEADER_PATTERN.test(title) && plainDescription.length === 0) {
    return { kind: 'DISCARD', reason: 'visual-header' };
  }

  return {
    kind: 'SERVICE',
    hasStudentTypes:
      row.field_tipo_estudiante
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean).length > 0,
  };
}
```

- [ ] **Step 4: Wire classifier into the mapper and report discarded rows**

```ts
import { classifyUtplPortalRow } from '@/lib/seed/classify-utpl-portal-row';

rows.forEach((row, globalIndex) => {
  const classification = classifyUtplPortalRow(row);
  if (classification.kind === 'DISCARD') {
    discardedRows.push({ globalIndex, title: row.field_nombre_servicio, reason: classification.reason });
    return;
  }

  const types = row.field_tipo_estudiante
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  if (types.length === 0) {
    reviewRows.push({ globalIndex, title: row.field_nombre_servicio, reason: 'missing-student-type' });
  }

  // existing bucket expansion continues here
});
```

- [ ] **Step 5: Extend mapper tests with real portal expectations**

```ts
it('drops structural rows before expansion', () => {
  const { report } = mapUtplPortalApiToSeed(rawRows);
  expect(report.discardedRows).toBeGreaterThan(0);
  expect(report.services).toBeGreaterThan(0);
  expect(report.sectionHeaders).toBe(0);
  expect(report.spacers).toBe(0);
});
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run tests/lib/seed/classify-utpl-portal-row.test.ts tests/lib/seed/map-utpl-portal-api.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/seed/classify-utpl-portal-row.ts lib/seed/map-utpl-portal-api.ts tests/lib/seed/classify-utpl-portal-row.test.ts tests/lib/seed/map-utpl-portal-api.test.ts
git commit -m "refactor: classify utpl structural rows before import"
```

### Task 2: Normalize parsed service payload for editability

**Files:**
- Modify: `lib/seed/types.ts`
- Modify: `lib/seed/parse-utpl-description-html.ts`
- Modify: `tests/lib/seed/parse-utpl-description-html.test.ts`
- Modify: `lib/seed/map-utpl-portal-api.ts`

- [ ] **Step 1: Write failing parser tests for tabs, periods, and calendar text**

```ts
it('extracts modality tabs from practicum recognition service', () => {
  const parsed = parseUtplDescriptionHtml(practicumHtml);
  expect(parsed.requirementTabs.map((tab) => tab.tabName)).toEqual([
    'DISTANCIA',
    'PRESENCIAL',
    'TECNOLOGÍAS',
  ]);
});

it('keeps a plain calendar summary for manual correction', () => {
  const parsed = parseUtplDescriptionHtml(practicumHtml);
  expect(parsed.calendarText).toContain('octubre 2026');
  expect(parsed.periods.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/seed/parse-utpl-description-html.test.ts`
Expected: FAIL because `calendarText` is missing and tabs are parsed incorrectly.

- [ ] **Step 3: Update normalized seed types**

```ts
export type UtplService = {
  sourceKey?: string;
  sourceRowIndex?: number;
  title: string;
  description?: string | null;
  modalityLevel?: string | null;
  responseTime?: string | null;
  cost?: string | null;
  note?: string | null;
  calendarText?: string | null;
  status?: 'draft' | 'published' | 'needs_review';
  isActive?: boolean;
  sortOrder?: number;
  requirements?: string[];
  requirementTabs?: UtplRequirementTab[];
  periods?: UtplPeriod[];
  manuals?: UtplManual[];
};
```

- [ ] **Step 4: Fix the HTML parser to populate normalized fields only**

```ts
export type ParsedDescription = {
  description: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  calendarText: string | null;
  requirements: string[];
  requirementTabs: ParsedRequirementTab[];
  periods: ParsedPeriod[];
  manuals: Array<{ label: string; url: string }>;
};

const calendarSections: string[] = [];

if (/periodo|calendario/i.test(label) || /periodo|calendario/i.test(plain.slice(0, 40))) {
  periods.push(...parsePeriodSection(sectionHtml, plain));
  calendarSections.push(plain);
  continue;
}

return {
  description,
  modalityLevel,
  responseTime,
  cost,
  note,
  calendarText: calendarSections.join('\n\n') || null,
  requirements,
  requirementTabs,
  periods,
  manuals,
};
```

- [ ] **Step 5: Map parser output to published vs needs-review services**

```ts
const normalizedStatus = types.length === 0 ? 'needs_review' : 'published';

return {
  sourceKey: buildSourceKey(typeCode, category, rawTitle, globalIndex),
  sourceRowIndex: globalIndex,
  title,
  description: parsed.description,
  modalityLevel: parsed.modalityLevel,
  responseTime: parsed.responseTime,
  cost: parsed.cost,
  note: parsed.note,
  calendarText: parsed.calendarText,
  status: normalizedStatus,
  isActive: normalizedStatus === 'published',
  requirements: parsed.requirements,
  requirementTabs: parsed.requirementTabs,
  periods: parsed.periods,
  manuals: parsed.manuals,
};
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run tests/lib/seed/parse-utpl-description-html.test.ts tests/lib/seed/map-utpl-portal-api.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/seed/types.ts lib/seed/parse-utpl-description-html.ts lib/seed/map-utpl-portal-api.ts tests/lib/seed/parse-utpl-description-html.test.ts tests/lib/seed/map-utpl-portal-api.test.ts
git commit -m "refactor: normalize parsed utpl service payload"
```

### Task 3: Refactor Prisma schema and seed pipeline around normalized runtime data

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_normalize_utpl_catalog/migration.sql`
- Modify: `scripts/seed-academic-services.ts`
- Modify: `scripts/transform-utpl-portal-api.ts`
- Modify: `scripts/validate-neon-seed.ts`

- [ ] **Step 1: Write a failing repository expectation for published-only catalog rows**

```ts
it('excludes needs_review services from the public catalog', async () => {
  const catalog = await getPublicPortalCatalog();
  expect(catalog.services.some((service) => service.status === 'needs_review')).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/lib/academic-services/repositories/services.test.ts`
Expected: FAIL because the current schema and mapper do not expose `status`.

- [ ] **Step 3: Update Prisma models to match the approved runtime shape**

```prisma
enum ServiceStatus {
  draft
  published
  needs_review
}

model StudentType {
  id          Int               @id @default(autoincrement())
  code        String            @unique
  name        String
  description String?
  sortOrder   Int               @default(0)
  isActive    Boolean           @default(true)
  categories  ServiceCategory[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model ServiceCategory {
  id            Int         @id @default(autoincrement())
  studentTypeId Int
  name          String
  slug          String
  description   String?
  sortOrder     Int         @default(0)
  isActive      Boolean     @default(true)
  studentType   StudentType @relation(fields: [studentTypeId], references: [id], onDelete: Restrict)
  services      Service[]

  @@unique([studentTypeId, slug])
}

model Service {
  id             Int                  @id @default(autoincrement())
  categoryId     Int
  sourceKey      String               @unique
  sourceRowIndex Int?
  title          String
  slug           String
  description    String?
  modalityLevel  String?
  responseTime   String?
  cost           String?
  note           String?
  calendarText   String?
  status         ServiceStatus        @default(draft)
  isActive       Boolean              @default(true)
  sortOrder      Int                  @default(0)
  category       ServiceCategory      @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  requirements   ServiceRequirement[]
  requirementTabs ServiceRequirementTab[]
  periods        ServicePeriod[]
  manuals        ServiceManual[]

  @@unique([categoryId, slug])
}
```

- [ ] **Step 4: Add a migration that preserves existing tables but drops portal-only runtime assumptions**

```sql
ALTER TABLE "StudentType" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ServiceCategory" ADD COLUMN "slug" TEXT;
ALTER TABLE "ServiceCategory" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Service" ADD COLUMN "slug" TEXT;
ALTER TABLE "Service" ADD COLUMN "sourceRowIndex" INTEGER;
ALTER TABLE "Service" ADD COLUMN "calendarText" TEXT;
ALTER TABLE "Service" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE "Service" DROP COLUMN "descriptionHtml";
ALTER TABLE "Service" DROP COLUMN "displayKind";
UPDATE "ServiceCategory" SET "slug" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'));
UPDATE "Service" SET "slug" = lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'));
ALTER TABLE "ServiceCategory" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Service" ALTER COLUMN "slug" SET NOT NULL;
```

- [ ] **Step 5: Seed directly from raw endpoint snapshot via the normalized mapper**

```ts
const filePath = path.join(process.cwd(), 'data/utpl-portal-raw.json');
const raw = await readFile(filePath, 'utf8');
const rows = JSON.parse(raw) as UtplPortalApiRow[];
const { studentTypes, report } = mapUtplPortalApiToSeed(rows);

for (const st of studentTypes) {
  const studentType = await tx.studentType.create({
    data: {
      code: st.code,
      name: st.name,
      description: st.description,
      sortOrder: st.sortOrder,
      isActive: true,
    },
  });

  // create categories and services using status, slug, calendarText, tabs, periods, manuals
}

await writeFile(
  path.join(process.cwd(), 'data/utpl-portal-import-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
```

- [ ] **Step 6: Add a post-seed validator that checks only normalized rows remain**

```ts
const counts = {
  studentTypes: await prisma.studentType.count({ where: { isActive: true } }),
  categories: await prisma.serviceCategory.count({ where: { isActive: true } }),
  publishedServices: await prisma.service.count({ where: { status: 'published', isActive: true } }),
  needsReviewServices: await prisma.service.count({ where: { status: 'needs_review' } }),
};

if (counts.publishedServices === 0) {
  throw new Error('Expected published services after normalized seed');
}
```

- [ ] **Step 7: Run schema and seed verification**

Run:
```bash
pnpm prisma validate
pnpm prisma migrate dev --name normalize_utpl_catalog
ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm import:servicios:fetch
ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm db:seed:servicios
npx tsx scripts/validate-neon-seed.ts
```
Expected: all commands succeed; validator prints non-zero published services and a small `needs_review` count.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations scripts/seed-academic-services.ts scripts/transform-utpl-portal-api.ts scripts/validate-neon-seed.ts
git commit -m "refactor: normalize utpl prisma schema and seed pipeline"
```

### Task 4: Update read and write ports for status, activity, and normalized details

**Files:**
- Modify: `lib/academic-services/domain/service-detail.ts`
- Modify: `lib/academic-services/ports/academic-services-read.ts`
- Modify: `lib/academic-services/ports/academic-services-write.ts`
- Modify: `lib/academic-services/providers/neon/mappers.ts`
- Modify: `lib/academic-services/providers/neon/read-port.ts`
- Modify: `lib/academic-services/providers/neon/write-port.ts`
- Modify: `tests/lib/academic-services/repositories/services.test.ts`

- [ ] **Step 1: Write failing repository tests for public filtering and admin detail fields**

```ts
it('returns only active published services in the public catalog', async () => {
  const catalog = await getPublicPortalCatalog();
  expect(catalog.services.every((service) => service.isActive)).toBe(true);
  expect(catalog.services.every((service) => service.status === 'published')).toBe(true);
});

it('returns tabs, periods, manuals, and calendarText for admin detail', async () => {
  const detail = await getServiceDetailForAdmin(1);
  expect(detail?.calendarText).toBeTypeOf('string');
  expect(detail?.requirementTabs.length).toBeGreaterThanOrEqual(0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/lib/academic-services/repositories/services.test.ts`
Expected: FAIL because `status` and `calendarText` are not wired through the ports.

- [ ] **Step 3: Extend domain and port types with normalized runtime fields**

```ts
export type ServiceDetail = {
  id: number;
  title: string;
  description: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  calendarText: string | null;
  status: 'draft' | 'published' | 'needs_review';
  isActive: boolean;
  requirements: Array<{ text: string }>;
  requirementTabs: Array<{
    tabName: string;
    title: string | null;
    items: Array<{ text: string; pdfUrl: string | null }>;
  }>;
  periods: Array<{
    name: string;
    modalities: Array<{
      modality: string;
      requestWindow: string | null;
      responseWindow: string | null;
    }>;
  }>;
  manuals: Array<{ label: string; url: string }>;
};
```

- [ ] **Step 4: Update the read port to filter by active + published and drop structural assumptions**

```ts
const services = await prisma.service.findMany({
  where: {
    categoryId,
    status: 'published',
    isActive: true,
  },
  orderBy: { sortOrder: 'asc' },
  select: serviceListSelect,
});

const publicServices = await prisma.service.findMany({
  where: {
    status: 'published',
    isActive: true,
    category: { isActive: true, studentType: { isActive: true } },
  },
  orderBy: [{ category: { studentType: { sortOrder: 'asc' } } }, { sortOrder: 'asc' }],
  select: {
    ...serviceListSelect,
    status: true,
    isActive: true,
    categoryId: true,
    category: { select: { studentTypeId: true } },
  },
});
```

- [ ] **Step 5: Update the write port to persist normalized service shape**

```ts
const nestedData = {
  title: input.title,
  slug: input.slug,
  description: input.description,
  modalityLevel: input.modalityLevel,
  responseTime: input.responseTime,
  cost: input.cost,
  note: input.note,
  calendarText: input.calendarText,
  status: input.status,
  isActive: input.isActive,
  sortOrder: input.sortOrder ?? 0,
  categoryId: input.categoryId,
  requirements: { create: input.requirements },
  requirementTabs: {
    create: input.requirementTabs.map((tab) => ({
      tabName: tab.tabName,
      title: tab.title,
      sortOrder: tab.sortOrder,
      items: { create: tab.items },
    })),
  },
  periods: {
    create: input.periods.map((period) => ({
      name: period.name,
      sortOrder: period.sortOrder,
      modalities: { create: period.modalities },
    })),
  },
  manuals: { create: input.manuals },
};
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run tests/lib/academic-services/repositories/services.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/academic-services/domain/service-detail.ts lib/academic-services/ports/academic-services-read.ts lib/academic-services/ports/academic-services-write.ts lib/academic-services/providers/neon/mappers.ts lib/academic-services/providers/neon/read-port.ts lib/academic-services/providers/neon/write-port.ts tests/lib/academic-services/repositories/services.test.ts
git commit -m "refactor: expose normalized service status through neon ports"
```

### Task 5: Refit admin actions and forms around normalized editability

**Files:**
- Modify: `app/administrativo/actions.ts`
- Modify: `components/administrativo/StudentTypeForm.tsx`
- Modify: `components/administrativo/CategoryForm.tsx`
- Modify: `components/administrativo/ServiceForm/ServiceForm.tsx`
- Modify: `components/administrativo/AdministrativoPortal.tsx`

- [ ] **Step 1: Write a failing action validation test for service status and calendar text**

```ts
const servicePayload = {
  categoryId: 1,
  title: 'Solicitar reconocimiento de prácticum por experiencia laboral MP/ MAD/TEC',
  slug: 'solicitar-reconocimiento-practicum-experiencia-laboral-mp-mad-tec',
  description: 'Dirigido a estudiantes...',
  modalityLevel: 'Distancia/En línea/Presencial - Nivel Grado/Técnico Tecnológico',
  responseTime: '15 días.',
  cost: '$96 dólares por asignatura',
  note: null,
  calendarText: 'Calendario para matrícula del periodo octubre 2026 – febrero 2027',
  status: 'published',
  isActive: true,
  requirements: [{ text: 'Tener aprobado el pre-requisito...', sortOrder: 0 }],
  requirementTabs: [],
  periods: [],
  manuals: [],
};
```

- [ ] **Step 2: Run existing admin action path to verify it rejects the new shape**

Run: `pnpm vitest run tests/lib/academic-services/repositories/services.test.ts`
Expected: FAIL or type error because `slug`, `calendarText`, and `status` are not present in `ServiceUpsertInput`.

- [ ] **Step 3: Extend action schemas and form state to include active/status fields**

```ts
const serviceSchema = z.object({
  id: z.number().optional(),
  categoryId: z.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  modalityLevel: z.string().nullable(),
  responseTime: z.string().nullable(),
  cost: z.string().nullable(),
  note: z.string().nullable(),
  calendarText: z.string().nullable(),
  status: z.enum(['draft', 'published', 'needs_review']),
  isActive: z.boolean(),
  requirements: z.array(requirementSchema),
  requirementTabs: z.array(requirementTabSchema),
  periods: z.array(periodSchema),
  manuals: z.array(manualSchema),
});
```

- [ ] **Step 4: Update service form UI to edit tabs, periods, and publication state explicitly**

```tsx
<FormSelect
  label="Estado"
  value={form.status}
  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ServiceStatus }))}
  options={[
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'needs_review', label: 'Revisión' },
  ]}
/>
<FormCheckbox
  label="Activo"
  checked={form.isActive}
  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
/>
<Textarea
  label="Calendario"
  value={form.calendarText ?? ''}
  onChange={(event) => setForm((current) => ({ ...current, calendarText: event.target.value || null }))}
/>
```

- [ ] **Step 5: Add active toggles to type and category forms**

```tsx
<FormCheckbox
  label="Activo"
  checked={form.isActive}
  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
/>
```

- [ ] **Step 6: Manually verify admin editing flow**

Run: `pnpm dev`
Expected:
- `/administrativo` shows current catalog data
- service form edits `status`, `calendarText`, tabs, and period rows
- toggling `Activo` persists for types, categories, and services

- [ ] **Step 7: Commit**

```bash
git add app/administrativo/actions.ts components/administrativo/StudentTypeForm.tsx components/administrativo/CategoryForm.tsx components/administrativo/ServiceForm/ServiceForm.tsx components/administrativo/AdministrativoPortal.tsx
git commit -m "feat: edit normalized utpl catalog from admin portal"
```

### Task 6: Simplify student portal to consume only normalized published data

**Files:**
- Modify: `components/servicios/ServiciosPortal.tsx`
- Modify: `components/servicios/ServiceCardGrid.tsx`
- Modify: `components/servicios/ServiceDetailContent.tsx`
- Modify: `components/servicios/RequirementTabs.tsx`
- Modify: `components/servicios/PeriodsTable.tsx`
- Modify: `app/servicios/actions.ts`

- [ ] **Step 1: Write a failing portal test for absence of structural rows**

```ts
expect(catalog.services.some((service) => service.title === 'disableblock')).toBe(false);
expect(catalog.services.some((service) => /SERVICIOS DE/i.test(service.title))).toBe(false);
```

- [ ] **Step 2: Run the public repository test to verify it fails against old assumptions**

Run: `pnpm vitest run tests/lib/academic-services/repositories/services.test.ts`
Expected: FAIL if structural rows are still present or filters still depend on `displayKind`.

- [ ] **Step 3: Remove structural-row rendering branches from the student portal**

```tsx
const visibleServices = initialCatalog.services.filter(
  (service) => service.studentTypeId === selectedStudentTypeId && service.categoryId === selectedCategoryId,
);

return <ServiceCardGrid services={visibleServices} onSelectService={setSelectedServiceId} />;
```

- [ ] **Step 4: Render calendar text and normalized tabs in detail view**

```tsx
{service.calendarText ? (
  <section>
    <h3 className="h6 mb-2">Calendario</h3>
    <p className="mb-0 whitespace-pre-line">{service.calendarText}</p>
  </section>
) : null}

{service.requirementTabs.length > 0 ? (
  <RequirementTabs tabs={service.requirementTabs} />
) : null}
```

- [ ] **Step 5: Render periods and manuals from normalized child rows only**

```tsx
{service.periods.length > 0 ? <PeriodsTable periods={service.periods} /> : null}
{service.manuals.length > 0 ? <ManualsList manuals={service.manuals} /> : null}
```

- [ ] **Step 6: Manually verify the student flow**

Run: `pnpm dev`
Expected:
- `/servicios` shows only active published services
- category counts ignore `needs_review` rows
- practicum recognition service shows tabs, calendar, periods, and manuals from Neon data

- [ ] **Step 7: Commit**

```bash
git add app/servicios/actions.ts components/servicios/ServiciosPortal.tsx components/servicios/ServiceCardGrid.tsx components/servicios/ServiceDetailContent.tsx components/servicios/RequirementTabs.tsx components/servicios/PeriodsTable.tsx
git commit -m "refactor: render student portal from normalized published catalog"
```

### Task 7: Final verification, import rehearsal, and documentation cleanup

**Files:**
- Modify: `package.json`
- Modify: `docs/superpowers/specs/2026-05-16-utpl-services-neon-migration-design.md`
- Modify: `docs/superpowers/plans/2026-05-16-utpl-services-neon-migration.md`

- [ ] **Step 1: Add explicit import and validation commands to `package.json`**

```json
{
  "scripts": {
    "import:servicios:fetch": "npx tsx scripts/fetch-utpl-portal-api.ts",
    "import:servicios:transform": "npx tsx scripts/transform-utpl-portal-api.ts",
    "db:seed:servicios": "npx tsx scripts/seed-academic-services.ts",
    "validate:servicios:seed": "npx tsx scripts/validate-neon-seed.ts"
  }
}
```

- [ ] **Step 2: Run the complete rehearsal on a fresh Neon database**

Run:
```bash
ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm import:servicios:fetch
ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm import:servicios:transform
ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm db:seed:servicios
ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm validate:servicios:seed
pnpm vitest run tests/lib/seed/classify-utpl-portal-row.test.ts tests/lib/seed/map-utpl-portal-api.test.ts tests/lib/seed/parse-utpl-description-html.test.ts tests/lib/academic-services/repositories/services.test.ts
```
Expected:
- snapshot files exist in `data/`
- import report exists in `data/utpl-portal-import-report.json`
- validator prints active/published counts and a bounded `needs_review` count
- all tests pass

- [ ] **Step 3: Record known manual review cases in the spec**

```md
## Manual Review Queue
- Rows with missing `field_tipo_estudiante`
- Services whose requirement tabs still need content reshaping after HTML parsing
- Any imported row left as `needs_review`
```

- [ ] **Step 4: Verify there are no placeholders in the plan or spec**

Run:
```bash
node - <<'NODE'
const fs = require('node:fs');
const files = [
  'docs/superpowers/specs/2026-05-16-utpl-services-neon-migration-design.md',
  'docs/superpowers/plans/2026-05-16-utpl-services-neon-migration.md',
];
const banned = [
  'TB' + 'D',
  'TO' + 'DO',
  'implement' + ' later',
  'appropriate' + ' error handling',
  'edge' + ' cases',
  'Similar to ' + 'Task',
];
const hits = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const token of banned) {
    if (text.includes(token)) hits.push(`: `);
  }
}
if (hits.length > 0) {
  console.error(hits.join(
));
  process.exit(1);
}
NODE
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add package.json docs/superpowers/specs/2026-05-16-utpl-services-neon-migration-design.md docs/superpowers/plans/2026-05-16-utpl-services-neon-migration.md
git commit -m "docs: add normalized utpl neon migration spec and plan"
```
