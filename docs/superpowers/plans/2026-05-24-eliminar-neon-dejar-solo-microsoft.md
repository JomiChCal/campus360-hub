# Plan: Eliminar Neon — dejar solo el provider Microsoft (Power Automate)

> **Para agentes:** Ejecutar tarea por tarea en el orden indicado. Verificar que TypeScript compile sin errores (`pnpm tsc --noEmit`) al completar cada tarea que modifique código.

**Goal:** Borrar todo el código Neon/Prisma del proyecto. El único proveedor de datos del portal de servicios académicos será `microsoft` con `MICROSOFT_PROVIDER_MODE=powerautomate` (ya funcional). El wizard de turnos del compañero (Google Sheets) **no se toca**.

**Contexto:**
- El compañero (JoeChuroC) construyó el wizard de turnos (`app/(form)/`, `app/api/turno/`, `components/`, `apps-script/`). Todo en commits `db0daa4` y `029ae75`. No se toca nada de eso.
- Abraham construyó el portal de servicios académicos sobre Neon. Ahora migró a Microsoft Power Automate. Neon ya no se usa en runtime.
- El provider `powerautomate` ya está funcionando. `MICROSOFT_PROVIDER_MODE=powerautomate` en `.env.local`.

**Tech Stack:** TypeScript, Next.js 16, Prisma 7, Neon/Postgres, pnpm.

---

## File Structure

### Eliminar (directorios completos)
- Delete: `lib/academic-services/providers/neon/` — provider completo (read-port, write-port, mappers)
- Delete: `lib/seed/` — utilidades ETL (map-utpl-portal-api, classify-utpl-portal-row, etc.)
- Delete: `prisma/migrations/` — migraciones de Neon

### Eliminar (archivos individuales)
- Delete: `lib/db.ts` — cliente Prisma (solo usado por Neon y sync route)
- Delete: `prisma/schema.prisma` — modelos Neon
- Delete: `prisma.config.ts` — configuración Prisma
- Delete: `app/api/microsoft-lists/sync/route.ts` — endpoint que usaba `prisma.catalogCache`
- Delete: `scripts/seed-neon-mock.ts`
- Delete: `scripts/seed-academic-services.ts`
- Delete: `scripts/validate-neon-seed.ts`
- Delete: `scripts/run-utpl-portal-manual-etl.ts`
- Delete: `scripts/fetch-utpl-portal-api.ts`
- Delete: `scripts/transform-utpl-portal-api.ts`
- Delete: `scripts/seed-data.ts`
- Delete: `tests/lib/academic-services/repositories/services.test.ts` — tests de Neon con prisma
- Delete: `tests/lib/academic-services/providers/registry.test.ts` — incluye test de 'neon'
- Delete: `data/utpl-servicios-academicos.json` — input del ETL (ya no se usa)
- Delete: `data/dataverse-seed/` — CSVs de seed para Neon
- Delete: `ServiceCategories.csv`, `ServiceDocumentation.csv`, `ServiceManuals.csv`, `ServicePeriods.csv`, `ServiceRequirements.csv`, `Services.csv`, `StudentTypes.csv` (raíz del proyecto — artefactos de ETL)

### Modificar
- Modify: `lib/academic-services/providers/microsoft/read-port.ts`
  - Eliminar `loadCatalogFromCache()` y variable `liveCache`
  - Eliminar `CACHE_MODES` y función `isCacheMode()`
  - Eliminar import de `prisma` y `{ prisma } from '@/lib/db'`
  - El único modo activo queda: prototype, fixture/mock (test) y powerautomate/flow/direct
- Modify: `lib/academic-services/providers/registry.ts`
  - Eliminar import de neon providers
  - Eliminar tipo `'neon'` de `AcademicServicesProvider`
  - Hardcodear retorno a `microsoftReadPort` / `microsoftWritePort`
  - Mantener `getAcademicServicesProvider()` pero solo aceptar `'microsoft'`
- Modify: `package.json`
  - Eliminar de `dependencies`: `@prisma/adapter-pg`, `@prisma/client`, `pg`
  - Eliminar de `devDependencies`: `prisma`, `@types/pg`
  - Eliminar de `scripts`: `db:generate`, `db:migrate`, `db:studio`, `db:seed:servicios`, `db:seed:mock`, `validate:servicios:seed`, `import:servicios:fetch`, `import:servicios:transform`, `import:servicios:manual`
  - Actualizar `"dev"`: de `"prisma generate && next dev"` → `"next dev"`
  - Eliminar `"postinstall": "prisma generate"`
- Modify: `.env.example`
  - Eliminar `DATABASE_URL` y su bloque de comentario Neon

---

### Tarea 1: Limpiar `microsoft/read-port.ts`

**Files:**
- Modify: `lib/academic-services/providers/microsoft/read-port.ts`

- [ ] **Step 1: Eliminar código de modo cache (Neon)**

  Eliminar de `read-port.ts`:
  1. El import de `prisma`: `import { prisma } from '@/lib/db';`
  2. La constante `CACHE_MODES`
  3. La función `isCacheMode()`
  4. La variable `liveCache` y su tipo
  5. La función completa `loadCatalogFromCache()`
  6. La rama `if (isCacheMode())` en `getMicrosoftDataOrThrow()`

  Resultado esperado: `getMicrosoftDataOrThrow()` solo tiene prototype mode y flow mode.

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  pnpm tsc --noEmit
  ```

---

### Tarea 2: Simplificar `registry.ts`

**Files:**
- Modify: `lib/academic-services/providers/registry.ts`

- [ ] **Step 1: Eliminar Neon del registry**

  Antes:
  ```typescript
  import { neonReadPort } from '@/lib/academic-services/providers/neon/read-port';
  import { neonWritePort } from '@/lib/academic-services/providers/neon/write-port';
  // ...
  export type AcademicServicesProvider = 'neon' | 'microsoft';

  export function getAcademicServicesProvider(): AcademicServicesProvider {
    const raw = process.env.ACADEMIC_SERVICES_DATA_PROVIDER?.trim().toLowerCase();
    if (raw === 'neon' || raw === 'microsoft') return raw;
    throw new Error(...)
  }

  export function getReadPort() {
    return getAcademicServicesProvider() === 'neon' ? neonReadPort : microsoftReadPort;
  }
  ```

  Después:
  ```typescript
  import type { AcademicServicesReadPort } from '@/lib/academic-services/ports/academic-services-read';
  import type { AcademicServicesWritePort } from '@/lib/academic-services/ports/academic-services-write';
  import { microsoftReadPort } from '@/lib/academic-services/providers/microsoft/read-port';
  import { microsoftWritePort } from '@/lib/academic-services/providers/microsoft/write-port';

  export function getReadPort(): AcademicServicesReadPort {
    return microsoftReadPort;
  }

  export function getWritePort(): AcademicServicesWritePort {
    return microsoftWritePort;
  }
  ```

  Nota: eliminar `getAcademicServicesProvider` si no hay nada más que la use. Si algo la usa, mantenerla devolviendo `'microsoft'` siempre.

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  pnpm tsc --noEmit
  ```

---

### Tarea 3: Eliminar provider Neon

**Files:**
- Delete: `lib/academic-services/providers/neon/read-port.ts`
- Delete: `lib/academic-services/providers/neon/write-port.ts`
- Delete: `lib/academic-services/providers/neon/mappers.ts`

- [ ] **Step 1: Borrar la carpeta `lib/academic-services/providers/neon/`**

  ```bash
  rm -rf lib/academic-services/providers/neon/
  ```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  pnpm tsc --noEmit
  ```

---

### Tarea 4: Eliminar `lib/db.ts` y Prisma

**Files:**
- Delete: `lib/db.ts`
- Delete: `prisma/schema.prisma`
- Delete: `prisma.config.ts`
- Delete: `prisma/migrations/` (directorio completo)
- Delete: `lib/generated/prisma/` (cliente generado — ya en .gitignore pero borrar si está presente)

- [ ] **Step 1: Borrar archivos Prisma**

  ```bash
  rm -f lib/db.ts
  rm -f prisma/schema.prisma
  rm -f prisma.config.ts
  rm -rf prisma/migrations/
  rm -rf lib/generated/
  ```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  pnpm tsc --noEmit
  ```

---

### Tarea 5: Eliminar endpoint de sync (usaba `prisma.catalogCache`)

**Files:**
- Delete: `app/api/microsoft-lists/sync/route.ts`

La ruta `/api/microsoft-lists/sync` era el mecanismo de cache en Neon vía webhooks de Power Automate. Ya no se usa — el portal llama directamente al flow.

La ruta `/api/microsoft-lists/webhook/route.ts` usa **SQLite local** (no Neon) para debugging de eventos entrantes. Se puede mantener o eliminar según conveniencia.

- [ ] **Step 1: Eliminar sync route**

  ```bash
  rm app/api/microsoft-lists/sync/route.ts
  rmdir app/api/microsoft-lists/sync/ 2>/dev/null || true
  ```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  pnpm tsc --noEmit
  ```

---

### Tarea 6: Eliminar scripts ETL y utilidades de seed

**Files:**
- Delete: `scripts/seed-neon-mock.ts`
- Delete: `scripts/seed-academic-services.ts`
- Delete: `scripts/validate-neon-seed.ts`
- Delete: `scripts/run-utpl-portal-manual-etl.ts`
- Delete: `scripts/fetch-utpl-portal-api.ts`
- Delete: `scripts/transform-utpl-portal-api.ts`
- Delete: `scripts/seed-data.ts`
- Delete: `lib/seed/` (directorio completo)

- [ ] **Step 1: Borrar scripts y utilidades ETL**

  ```bash
  rm scripts/seed-neon-mock.ts
  rm scripts/seed-academic-services.ts
  rm scripts/validate-neon-seed.ts
  rm scripts/run-utpl-portal-manual-etl.ts
  rm scripts/fetch-utpl-portal-api.ts
  rm scripts/transform-utpl-portal-api.ts
  rm scripts/seed-data.ts
  rm -rf lib/seed/
  ```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  pnpm tsc --noEmit
  ```

---

### Tarea 7: Eliminar tests Neon

**Files:**
- Delete: `tests/lib/academic-services/repositories/services.test.ts`
- Delete: `tests/lib/academic-services/providers/registry.test.ts`

- [ ] **Step 1: Borrar tests de integración Neon**

  ```bash
  rm tests/lib/academic-services/repositories/services.test.ts
  rm tests/lib/academic-services/providers/registry.test.ts
  ```

  Si la carpeta `tests/lib/academic-services/repositories/` queda vacía, borrarla también.

- [ ] **Step 2: Correr tests restantes**

  ```bash
  pnpm test
  ```

  Solo deben quedar: `microsoft-catalog-cache.test.ts` y `microsoft-prototype.test.ts`.

---

### Tarea 8: Limpiar `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Eliminar dependencias Prisma/Postgres**

  De `dependencies` eliminar:
  - `@prisma/adapter-pg`
  - `@prisma/client`
  - `pg`

  De `devDependencies` eliminar:
  - `prisma`
  - `@types/pg`

- [ ] **Step 2: Eliminar scripts Neon/ETL**

  Scripts a eliminar:
  - `"dev"`: cambiar `"prisma generate && next dev"` → `"next dev"`
  - `"db:generate"`
  - `"db:migrate"`
  - `"db:studio"`
  - `"db:seed:servicios"`
  - `"db:seed:mock"`
  - `"validate:servicios:seed"`
  - `"import:servicios:fetch"`
  - `"import:servicios:transform"`
  - `"import:servicios:manual"`
  - `"postinstall"` (era `prisma generate`)

- [ ] **Step 3: Reinstalar paquetes**

  ```bash
  pnpm install
  ```

- [ ] **Step 4: Verificar que la app arranca**

  ```bash
  pnpm dev
  ```

---

### Tarea 9: Limpiar `.env.example` y datos de seed

**Files:**
- Modify: `.env.example`
- Delete: `data/utpl-servicios-academicos.json`
- Delete: `data/dataverse-seed/`
- Delete: `ServiceCategories.csv`, `ServiceDocumentation.csv`, `ServiceManuals.csv`, `ServicePeriods.csv`, `ServiceRequirements.csv`, `Services.csv`, `StudentTypes.csv` (raíz)

- [ ] **Step 1: Eliminar `DATABASE_URL` de `.env.example`**

  Borrar el bloque completo:
  ```env
  # Neon — solo cuando ACADEMIC_SERVICES_DATA_PROVIDER=neon
  # Usar URL con pooling en Vercel: ...-pooler.neon.tech
  # Neon pooled: usar sslmode=verify-full (evita warning de pg con sslmode=require)
  DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.neon.tech/neondb?sslmode=verify-full"
  ```

  También eliminar la variable `ACADEMIC_SERVICES_DATA_PROVIDER` si ya no tiene sentido tenerla con opciones (o dejar solo `microsoft`).

- [ ] **Step 2: Borrar datos de seed Neon**

  ```bash
  rm -f data/utpl-servicios-academicos.json
  rm -rf data/dataverse-seed/
  rm -f ServiceCategories.csv ServiceDocumentation.csv ServiceManuals.csv
  rm -f ServicePeriods.csv ServiceRequirements.csv Services.csv StudentTypes.csv
  ```

---

### Tarea 10: Verificación final

- [ ] **Step 1: TypeScript limpio**

  ```bash
  pnpm tsc --noEmit
  ```

- [ ] **Step 2: Tests pasan**

  ```bash
  pnpm test
  ```

- [ ] **Step 3: App corre correctamente**

  ```bash
  pnpm dev
  # Navegar a /servicios y /tipo — deben cargar desde Power Automate
  ```

- [ ] **Step 4: Sin referencias residuales a Neon/Prisma**

  ```bash
  grep -r "prisma\|neonReadPort\|neonWritePort\|from '@/lib/db'" . \
    --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
    | grep -v "// " || echo "✓ Sin referencias"
  ```

---

## Qué NO se toca (wizard del compañero)

| Archivo / carpeta | Razón |
|---|---|
| `app/(form)/` | Wizard de turnos (JoeChuroC) |
| `app/api/turno/`, `app/api/autogestion/`, `app/api/fuera-horario/` | APIs del wizard |
| `app/fuera-horario/` | Página del wizard |
| `components/MobileWarningModal.tsx`, `Modal.tsx`, `PageHeader.tsx`, `ResultCard.tsx`, `StepIndicator.tsx` | Componentes del wizard |
| `apps-script/` | Google Apps Script del wizard |
| `hooks/use-form-wizard.ts` | Hook del wizard |
| `lib/sheets-auth.ts` | Auth de Google Sheets |
| `scripts/setup-sheets.ts` | Setup de Sheets |
| `app/api/microsoft-lists/webhook/route.ts` | Usa SQLite (no Neon) — debugging de webhooks |
