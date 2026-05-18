# Portal de Servicios Académicos UTPL — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir al monorepo `campus360-hub` **dos vistas** (dos rutas de página, sin árbol dinámico):

1. **`/servicios`** — una sola pantalla “Servicios por tipo de estudiante” (layout como el portal UTPL de referencia): sidebar de tipos, buscador, categorías y grilla de servicios; filtrado en cliente sin navegar a `/servicios/[tipo]/...`.
2. **`/administrativo`** — una sola pantalla: si no hay sesión, muestra el formulario de login **en la misma URL**; si hay sesión, muestra el panel (tabs: tipos, categorías, servicios). **Sin** `/administrativo/login`.

Backend **desacoplado del proveedor** (`ACADEMIC_SERVICES_DATA_PROVIDER`). Fase 1: Neon + Prisma + seed JSON UTPL.

**Architecture:** Subsistema nuevo convive con el wizard de turnos (Google Sheets — **otro dominio, otro proveedor**). El portal académico sigue **hexagonal / ports & adapters**:

1. **Dominio** — tipos y reglas (`lib/academic-services/domain/`) sin Prisma, sin Microsoft SDK, sin SQL.
2. **Puertos** — interfaces de repositorio (`lib/academic-services/ports/`) que definen *qué* necesita la app, no *cómo* se persiste.
3. **Adaptadores** — implementaciones por proveedor (`lib/academic-services/providers/neon/`, `.../microsoft/` stub).
4. **Fachada** — `lib/academic-services/repositories/*` delega al adaptador activo; **Server Components, Server Actions y rutas API solo importan la fachada**, nunca `prisma` ni SDKs de Microsoft directamente.
5. **Selección por env** — un solo proveedor activo por despliegue (`ACADEMIC_SERVICES_DATA_PROVIDER=neon|microsoft`).

**UX (obligatorio):** no usar rutas dinámicas `[tipoCode]`, `[categoriaId]`, `[serviceId]` para el flujo principal. El detalle de un servicio se abre en **modal / sheet** sobre `/servicios`, no en otra URL.

Páginas: Server Component carga catálogo → Client Component filtra y renderiza. Admin: NextAuth + Server Actions → write port. Varias filas `ServiceRequirementTab` con el mismo `tabName` = bloques dentro de una pestaña en el modal de detalle.

**Tech Stack (Fase 1):** Next.js 16 App Router, React 19, TypeScript 5, Prisma 6.x (solo adaptador `neon`), Neon Postgres, NextAuth.js v5 (`next-auth@beta`), Tailwind 4, shadcn/ui, Zod, Vitest, bcryptjs.

**Tech Stack (futuro, adaptador `microsoft`):** TBD (Graph API + SharePoint Lists, Dataverse, Excel Online, etc.). El plan reserva contrato y stub; no implementar Microsoft en Fase 1 salvo el adaptador vacío que falla con mensaje claro si se activa por error.

---

## Decisiones de diseño (acordadas)

| Tema | Decisión |
|------|----------|
| Rutas de usuario | Solo **`/servicios`** y **`/administrativo`** |
| Portal público | Una pantalla estilo UTPL: sidebar tipos + categorías + grilla; filtros en cliente |
| Detalle de trámite | Modal/sheet en `/servicios`, sin URL hija |
| Admin | Una pantalla: login embebido si no hay sesión, panel con tabs si hay sesión |
| Login admin | **Misma URL** `/administrativo` — no `/administrativo/login` |
| Backend | Ports & adapters; `ACADEMIC_SERVICES_DATA_PROVIDER` = `neon` o `microsoft` |
| Fase 1 datos | Neon + Prisma; Microsoft = stub |
| Wizard turnos | Intocable (`/tipo`, `/servicio`, etc.) — otro dominio (Google Sheets) |

### Índice de fases y tareas

| Fase | Objetivo | Tasks |
|------|----------|-------|
| **1** | DB, seed, `/servicios` | 0 → 8 (infra + vista única + modal) |
| **2** | `/administrativo` + CRUD | 10b, 11 → 13 |
| **3** | Mejoras opcionales | 21 → 23 |

---

## Contexto del repo actual

| Existente | Ruta | Notas |
|-----------|------|-------|
| Wizard de turnos | `app/(form)/*`, `middleware.ts` | **No modificar** la lógica de turnos; no redirigir `/administrativo` a otra ruta |
| Catálogo estático (otro dominio) | `data/services.ts` | Distinto del PRD; no reutilizar para el portal |
| Paleta UTPL | `tailwind.config.ts`, `app/globals.css` | Reutilizar tokens `utpl-*` |
| Sin tests | — | Introducir Vitest en este plan |
| Sin Prisma/Neon | — | Greenfield dentro del mismo app |
| Wizard usa Google Sheets | `lib/sheets-auth.ts`, APIs turno | **No mezclar** con el portal académico; otro bounded context |

---

## Backend desacoplado (obligatorio en todo el plan)

### Principio

El **frontend no conoce Neon ni Microsoft**. Las páginas y componentes reciben DTOs del dominio. Toda persistencia vive detrás de puertos. Cambiar de Neon a SharePoint/Excel equivale a: nuevo adaptador + env + credenciales; **sin** reescribir `app/servicios/*` ni `components/servicios/*`.

### Variable de entorno (única fuente de verdad)

```env
# Proveedor de datos del portal académico (exactamente uno activo por despliegue)
ACADEMIC_SERVICES_DATA_PROVIDER=neon   # neon | microsoft

# Solo si provider=neon (Prisma)
DATABASE_URL="postgresql://..."

# Solo si provider=microsoft (futuro — nombres provisionales)
# MICROSOFT_TENANT_ID=
# MICROSOFT_CLIENT_ID=
# MICROSOFT_CLIENT_SECRET=
# MICROSOFT_SHAREPOINT_SITE_ID=
# MICROSOFT_LIST_ID=
```

**Reglas:**

| Regla | Detalle |
|-------|---------|
| Un proveedor por proceso | No mezclar lecturas Neon + escrituras Microsoft en el mismo request. |
| Fail-fast al arranque | Si `ACADEMIC_SERVICES_DATA_PROVIDER` falta o es inválido → error explícito en `getAcademicServicesProvider()`. |
| `neon` en Fase 1 | Implementación completa con Prisma. |
| `microsoft` en Fase 1 | Stub que lanza `ProviderNotImplementedError` con enlace a este plan — evita código muerto y documenta el contrato. |
| Seed / migraciones | Solo corren con `provider=neon` (`pnpm db:seed:servicios` verifica env antes de ejecutar). |
| Tests de repositorio | Mockean el **puerto**, o usan adaptador `neon` con DB de test; nunca importan Prisma desde `app/`. |

### Diagrama de capas

```mermaid
flowchart TB
  subgraph presentation["Presentación (Next.js)"]
    SC["Server Components /servicios"]
    SA["Server Actions /administrativo"]
  end

  subgraph application["Aplicación"]
    FAC["lib/academic-services/repositories/*"]
  end

  subgraph ports["Puertos"]
    P1["AcademicServicesReadPort"]
    P2["AcademicServicesWritePort"]
  end

  subgraph adapters["Adaptadores (env)"]
    NEON["providers/neon → Prisma"]
    MS["providers/microsoft → stub / futuro Graph"]
  end

  SC --> FAC
  SA --> FAC
  FAC --> P1
  FAC --> P2
  P1 --> NEON
  P2 --> NEON
  P1 -.-> MS
  P2 -.-> MS
```

### Contrato de dominio (resumen)

Los puertos usan IDs `number` y DTOs planos (sin tipos `Prisma.*`). Ejemplo de lectura pública:

```typescript
// lib/academic-services/ports/academic-services-read.ts
export type StudentTypeSummary = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type ServiceListItem = {
  id: number;
  title: string;
  responseTime: string | null;
  cost: string | null;
  modalityLevel: string | null;
};

export interface AcademicServicesReadPort {
  listStudentTypes(): Promise<StudentTypeSummary[]>;
  getStudentTypeByCode(code: string): Promise<StudentTypeSummary | null>;
  listCategoriesWithActiveCounts(studentTypeId: number): Promise<CategoryWithCount[]>;
  getCategoryForStudentType(
    studentTypeId: number,
    categoryId: number,
  ): Promise<CategorySummary | null>;
  listActiveServicesByCategoryId(categoryId: number): Promise<ServiceListItem[]>;
  getActiveServiceDetail(
    categoryId: number,
    serviceId: number,
  ): Promise<ServiceDetail | null>;
  /** Catálogo completo para la vista única /servicios (solo activos) */
  getPublicPortalCatalog(): Promise<PublicPortalCatalog>;
}

export type PublicPortalCatalog = {
  studentTypes: StudentTypeSummary[];
  categories: Array<{
    id: number;
    studentTypeId: number;
    name: string;
    description: string | null;
  }>;
  services: Array<
    ServiceListItem & {
      categoryId: number;
      studentTypeId: number;
    }
  >;
};
```

`AcademicServicesWritePort` expone CRUD admin (`upsertService`, `deleteService`, etc.) con los mismos DTOs que valida Zod — el adaptador Neon mapea a Prisma; el adaptador Microsoft mapeará a listas/columnas cuando exista.

### Registro de proveedor

```typescript
// lib/academic-services/providers/registry.ts
export type AcademicServicesProvider = 'neon' | 'microsoft';

export function getAcademicServicesProvider(): AcademicServicesProvider {
  const raw = process.env.ACADEMIC_SERVICES_DATA_PROVIDER?.trim().toLowerCase();
  if (raw === 'neon' || raw === 'microsoft') return raw;
  throw new Error(
    'ACADEMIC_SERVICES_DATA_PROVIDER must be "neon" or "microsoft" (see .env.example)',
  );
}

export function getReadPort(): AcademicServicesReadPort { /* switch por env */ }
export function getWritePort(): AcademicServicesWritePort { /* switch por env */ }
```

La fachada `lib/academic-services/repositories/*` delega a `getReadPort()` / `getWritePort()` — nunca importa `@/lib/db` desde `app/` o `components/`.

### Mapeo futuro Microsoft (sin implementar aún)

| Entidad dominio | Neon (ahora) | Microsoft (candidatos) |
|-----------------|--------------|-------------------------|
| StudentType | tabla `StudentType` | SharePoint List / Dataverse table |
| ServiceCategory | tabla | lista relacionada |
| Service + hijos | tablas + FK | lista maestro + sublistas o JSON column |
| Seed JSON | `scripts/seed-academic-services.ts` | import one-shot o Power Automate |
| Búsqueda global (Fase 3) | `ILIKE` Prisma | Search API / indexed columns |

### Anti-patrones prohibidos

- `import { prisma } from '@/lib/db'` en `app/**`, `components/**`, `middleware.ts`.
- Tipos `Prisma.ServiceGetPayload` en props de React.
- Ramas `if (process.env....)` en componentes — la rama vive en `providers/registry.ts`.
- Reutilizar `lib/sheets-auth.ts` para el portal académico.
- Rutas dinámicas `/servicios/[...]` o `/administrativo/login` para flujos de usuario.

---

## Rutas de la aplicación (solo estas)

| Ruta | Vista | Auth |
|------|-------|------|
| `/servicios` | Portal público (una pantalla) | No |
| `/administrativo` | Login embebido **o** panel admin (misma pantalla, según sesión) | Parcial |

**No crear:** `/servicios/[tipoCode]`, `/administrativo/login`, `/administrativo/tipos`, etc.

**Rutas técnicas internas (sí):** `/api/auth/[...nextauth]` — solo el handler de Auth.js, no es una pantalla para el usuario.

**Opcional (no Fase 1):** query params en `/servicios?tipo=continuo&categoria=12` solo para restaurar selección al recargar — **sin** cambiar de página ni de layout.

---

## Especificación UI — `/servicios` (referencia visual obligatoria)

Replicar la pantalla **“SERVICIOS POR TIPO DE ESTUDIANTE”** (captura UTPL):

```
┌─────────────────────────────────────────────────────────────────┐
│  SERVICIOS POR TIPO DE ESTUDIANTE.                              │
│  Selecciona tu perfil y escoge el servicio que requieres        │
├──────────────┬──────────────────────────────────────────────────┤
│ Tipos de     │  [ Buscar ...                                    ]│
│ estudiante   │  Categorías de servicio                          │
│              │  [MATRÍCULA] [FINANCIEROS] [GRADUACIÓN] ...       │
│ [CONTINUO]◀  │  Servicios                                       │
│  NUEVO       │  ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  POSTULANTE  │  │ card    │ │ card    │ │ card    │  (grid 3)   │
│  ALUMNI      │  └─────────┘ └─────────┘ └─────────┘             │
└──────────────┴──────────────────────────────────────────────────┘
```

| Zona | Comportamiento |
|------|----------------|
| Título | Mayúsculas, azul UTPL (`utpl-blue`), punto final como en referencia |
| Subtítulo | `text-utpl-muted` |
| Sidebar izquierda | Botones apilados, fondo blanco, sombra suave; **activo** = texto `utpl-gold` + borde/fondo sutil |
| Buscador | Input ancho “Buscar …”; filtra tarjetas de servicios del tipo + categoría seleccionados |
| Categorías | Fila de botones/chips; **activo** = texto dorado; al cambiar categoría actualiza la grilla |
| Grilla servicios | 3 columnas en desktop, 1–2 en móvil; tarjeta = título del trámite; **clic** abre modal de detalle (requisitos, pestañas, periodos, manuales) |
| Fondo página | `bg-utpl-surface` o gris claro como referencia |

**Componente raíz (client):** `components/servicios/ServiciosPortal.tsx` — recibe `initialCatalog` del server y maneja `selectedStudentTypeId`, `selectedCategoryId`, `searchQuery`, `selectedServiceId` (modal).

---

## Especificación UI — `/administrativo` (una pantalla)

| Estado sesión | Qué se renderiza en `/administrativo` |
|---------------|----------------------------------------|
| Sin sesión | Formulario centrado (usuario + contraseña) — **misma URL** |
| Con sesión | `AdministrativoPortal` con tabs CRUD |

| Zona (autenticado) | Comportamiento |
|------|----------------|
| Shell | Tabs: **Resumen** \| **Tipos** \| **Categorías** \| **Servicios** + botón cerrar sesión |
| CRUD | Tablas + formularios; edición de servicio en **sheet** (4 sub-pestañas) |
| Sin rutas hijas | Estado `view = 'edit-service' | 'list-services'` en cliente |

**Patrón de página (server):**

```tsx
// app/administrativo/page.tsx
import { auth } from '@/auth';
import { AdministrativoLogin } from '@/components/administrativo/AdministrativoLogin';
import { AdministrativoPortal } from '@/components/administrativo/AdministrativoPortal';

export default async function AdministrativoPage() {
  const session = await auth();
  if (!session) return <AdministrativoLogin />;
  return <AdministrativoPortal />;
}
```

**Middleware:** no redirigir `/administrativo` a otra URL. Proteger mutaciones en Server Actions con `auth()`. La página decide si muestra login o panel.

**Auth técnico:** `/api/auth/[...nextauth]` (cookies/JWT). Sin `pages.signIn` en NextAuth.

---

## Mapa de archivos (objetivo final)

```
prisma/
  schema.prisma
  migrations/
lib/
  db.ts                              # solo importado por providers/neon/*
  auth.ts
  academic-services/
    domain/
      service-detail.ts              # DTOs compartidos dominio
      grouping.ts                    # groupRequirementTabsByName (puro)
    ports/
      academic-services-read.ts
      academic-services-write.ts
    providers/
      registry.ts
      neon/
        read-port.ts
        write-port.ts
        mappers.ts                   # Prisma ↔ dominio
      microsoft/
        read-port.ts                 # stub Fase 1
        write-port.ts                # stub Fase 1
    repositories/                    # fachada — única entrada para app/
      portal-catalog.ts              # getPublicPortalCatalog()
      student-types.ts
      service-categories.ts
      services.ts
      index.ts                       # re-export groupRequirementTabsByName
  validations/
    academic-service.ts
  seed/
    map-utpl-json.ts
    types.ts
data/
  utpl-servicios-academicos.json    # fuente PRD (colocar manualmente)
scripts/
  seed-academic-services.ts
tests/
  lib/academic-services/providers/registry.test.ts
  lib/academic-services/domain/grouping.test.ts
app/
  servicios/
    layout.tsx
    page.tsx                         # única ruta pública
    actions.ts                       # fetchServiceDetail (modal)
  administrativo/
    layout.tsx
    page.tsx                         # AdministrativoLogin | AdministrativoPortal
    actions.ts                       # CRUD; validar auth() al inicio
  api/
    auth/[...nextauth]/route.ts
components/
  servicios/
    ServiciosPortal.tsx              # client: sidebar + filtros + grilla
    StudentTypeSidebar.tsx
    CategoryChips.tsx
    ServiceCardGrid.tsx
    ServiceSearchBar.tsx
    ServiceDetailModal.tsx           # detalle completo (sheet/dialog)
    RequirementTabs.tsx
    PeriodsTable.tsx
    ManualsList.tsx
  administrativo/
    AdministrativoLogin.tsx          # signIn redirect: false + router.refresh()
    AdministrativoPortal.tsx         # client: tabs + CRUD
    AdministrativoShell.tsx
    AdminTabs.tsx
    DataTable.tsx
    StudentTypeForm.tsx
    CategoryForm.tsx
    ServiceForm/
      ServiceForm.tsx
      GeneralTab.tsx
      RequirementsTab.tsx
      PeriodsTab.tsx
      ManualsTab.tsx
tests/
  lib/seed/map-utpl-json.test.ts
  lib/academic-services/repositories/services.test.ts
  lib/academic-services/providers/registry.test.ts
  lib/validations/academic-service.test.ts
vitest.config.ts
auth.ts                             # export handlers + auth (raíz, convención Auth.js)
.env.example                        # ampliar con DATABASE_URL, AUTH_*
```

---

## Variables de entorno nuevas

Añadir a `.env.example` y documentar en README (sección aparte, no reescribir todo el README):

```env
# --- Portal académico: proveedor de datos (obligatorio) ---
ACADEMIC_SERVICES_DATA_PROVIDER=neon   # neon | microsoft

# Neon — solo cuando ACADEMIC_SERVICES_DATA_PROVIDER=neon
# Usar URL con pooling en Vercel: ...-pooler.neon.tech
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"

# Microsoft — solo cuando ACADEMIC_SERVICES_DATA_PROVIDER=microsoft (futuro)
# MICROSOFT_TENANT_ID=
# MICROSOFT_CLIENT_ID=
# MICROSOFT_CLIENT_SECRET=

# NextAuth / Auth.js
AUTH_SECRET="generar-con: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Admin credentials (Fase 2)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="cambiar-en-produccion"
```

**Desarrollo local (Fase 1):** dejar `ACADEMIC_SERVICES_DATA_PROVIDER=neon`. Para probar que el stub Microsoft falla bien: `ACADEMIC_SERVICES_DATA_PROVIDER=microsoft pnpm dev` → error claro al primer acceso a datos.

---

## Formato JSON de seed (`data/utpl-servicios-academicos.json`)

Colocar el JSON extraído del portal estático UTPL en esta ruta. Estructura esperada por el mapper:

```json
{
  "studentTypes": [
    {
      "code": "CONTINUO",
      "name": "Estudiante continuo",
      "description": "Opcional",
      "categories": [
        {
          "name": "SERVICIOS-RECONOCIMIENTO DE ESTUDIOS",
          "description": null,
          "services": [
            {
              "title": "Solicitar reconocimiento de prácticum por experiencia laboral MP/MAD/TEC",
              "description": "Texto largo...",
              "modalityLevel": "Distancia/En línea/ Presencial -Nivel Grado/ Técnico Tecnológico",
              "responseTime": "15 días",
              "cost": "96 dólares por asignatura (72 horas para pagar tras validar el servicio)",
              "note": null,
              "isActive": true,
              "requirements": ["Tener aprobado o validado el pre-requisito…"],
              "requirementTabs": [
                {
                  "tabName": "DISTANCIA",
                  "title": "Estudiantes ECTS",
                  "items": [
                    { "text": "Ingeniería en Sistemas", "pdfUrl": "https://..." }
                  ]
                },
                {
                  "tabName": "DISTANCIA",
                  "title": "Estudiantes REDISEÑO",
                  "items": [{ "text": "...", "pdfUrl": null }]
                }
              ],
              "periods": [
                {
                  "name": "Calendario para matrícula del periodo octubre 2026 – febrero 2027",
                  "modalities": [
                    {
                      "modality": "General",
                      "requestWindow": "desde el 13 de abril al 28 de septiembre de 2026",
                      "responseWindow": null
                    }
                  ]
                }
              ],
              "manuals": [
                { "label": "Descargar aquí", "url": "https://..." }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

> **Regla de pestañas:** cada combinación `(tabName, title)` es **una fila** `ServiceRequirementTab`. La UI agrupa por `tabName`.

---

# FASE 1 — Infraestructura, seed y `/servicios` (vista única)

### Task 0: Puertos, registro de proveedor y adaptador Neon (antes de repositorios)

**Files:**
- Create: `lib/academic-services/domain/service-detail.ts`
- Create: `lib/academic-services/domain/grouping.ts`
- Create: `lib/academic-services/ports/academic-services-read.ts`
- Create: `lib/academic-services/ports/academic-services-write.ts`
- Create: `lib/academic-services/providers/registry.ts`
- Create: `lib/academic-services/providers/neon/read-port.ts`
- Create: `lib/academic-services/providers/neon/write-port.ts` (esqueleto vacío hasta Fase 2)
- Create: `lib/academic-services/providers/neon/mappers.ts`
- Create: `lib/academic-services/providers/microsoft/read-port.ts` (stub)
- Create: `lib/academic-services/providers/microsoft/write-port.ts` (stub)
- Create: `tests/lib/academic-services/providers/registry.test.ts`

- [ ] **Step 1: Test — proveedor inválido falla**

```typescript
// tests/lib/academic-services/providers/registry.test.ts
import { afterEach, describe, expect, it } from 'vitest';

describe('getAcademicServicesProvider', () => {
  const prev = process.env.ACADEMIC_SERVICES_DATA_PROVIDER;

  afterEach(() => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = prev;
  });

  it('throws when env is missing', async () => {
    delete process.env.ACADEMIC_SERVICES_DATA_PROVIDER;
    const { getAcademicServicesProvider } = await import(
      '@/lib/academic-services/providers/registry'
    );
    expect(() => getAcademicServicesProvider()).toThrow(/ACADEMIC_SERVICES_DATA_PROVIDER/);
  });

  it('accepts neon', async () => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = 'neon';
    const { getAcademicServicesProvider } = await import(
      '@/lib/academic-services/providers/registry'
    );
    expect(getAcademicServicesProvider()).toBe('neon');
  });
});
```

- [ ] **Step 2: Implementar `registry.ts`, stubs Microsoft y DTOs de dominio**

- [ ] **Step 3: Tras Task 2 (Prisma), implementar `neon/read-port.ts`** delegando en `prisma` + `mappers.ts`.

- [ ] **Step 4: Run tests**

Run: `pnpm test tests/lib/academic-services/providers/registry.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/academic-services/ tests/lib/academic-services/
git commit -m "feat(academic-services): add provider ports and neon adapter registry"
```

> **Orden:** Task 0 (esqueleto) → Task 2 (schema) → Task 3 (`lib/db.ts`) → completar adaptador Neon en Task 0 step 3 → Task 6 (fachada).

---

### Task 1: Dependencias y Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Instalar dependencias**

```bash
pnpm add @prisma/client zod bcryptjs
pnpm add -D prisma vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @types/bcryptjs
pnpm add next-auth@beta
pnpm dlx shadcn@latest init -y
```

Cuando `shadcn` pregunte, usar: TypeScript, estilo **New York**, base color **slate**, CSS variables en `app/globals.css`, alias `@/components`.

Instalar componentes usados en el plan:

```bash
pnpm dlx shadcn@latest add button card input label textarea select switch tabs table badge separator alert-dialog dialog sheet
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```typescript
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Añadir scripts en `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest",
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:seed:servicios": "npx tsx --env-file=.env.local scripts/seed-academic-services.ts",
"db:studio": "prisma studio"
```

- [ ] **Step 4: Ejecutar verificación**

Run: `pnpm test`
Expected: `No test files found` o 0 tests (exit 0 tras añadir tests en Task 4).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts components.json app/globals.css
git commit -m "chore: add prisma, vitest, and shadcn foundation for academic portal"
```

---

### Task 2: Esquema Prisma

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Escribir schema completo**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model StudentType {
  id          Int               @id @default(autoincrement())
  code        String            @unique
  name        String
  description String?
  categories  ServiceCategory[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model ServiceCategory {
  id            Int         @id @default(autoincrement())
  name          String
  description   String?
  studentType   StudentType @relation(fields: [studentTypeId], references: [id], onDelete: Restrict)
  studentTypeId Int
  services      Service[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([studentTypeId])
}

model Service {
  id              Int                     @id @default(autoincrement())
  title           String
  description     String?
  modalityLevel   String?
  responseTime    String?
  cost            String?
  note            String?
  isActive        Boolean                 @default(true)
  category        ServiceCategory         @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  categoryId      Int
  requirements    ServiceRequirement[]
  requirementTabs ServiceRequirementTab[]
  periods         ServicePeriod[]
  manuals         ServiceManual[]
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt

  @@index([categoryId])
  @@index([isActive])
}

model ServiceRequirement {
  id        Int     @id @default(autoincrement())
  text      String
  sortOrder Int     @default(0)
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId Int
}

model ServiceRequirementTab {
  id        Int                      @id @default(autoincrement())
  tabName   String
  title     String?
  sortOrder Int                      @default(0)
  service   Service                  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId Int
  items     ServiceRequirementItem[]
}

model ServiceRequirementItem {
  id        Int                   @id @default(autoincrement())
  text      String
  pdfUrl    String?
  sortOrder Int                   @default(0)
  tab       ServiceRequirementTab @relation(fields: [tabId], references: [id], onDelete: Cascade)
  tabId     Int
}

model ServicePeriod {
  id         Int                     @id @default(autoincrement())
  name       String
  sortOrder  Int                     @default(0)
  service    Service                 @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId  Int
  modalities ServicePeriodModality[]
}

model ServicePeriodModality {
  id             Int           @id @default(autoincrement())
  modality       String
  requestWindow  String?
  responseWindow String?
  sortOrder      Int           @default(0)
  period         ServicePeriod @relation(fields: [periodId], references: [id], onDelete: Cascade)
  periodId       Int
}

model ServiceManual {
  id        Int     @id @default(autoincrement())
  label     String
  url       String
  sortOrder Int     @default(0)
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId Int
}
```

- [ ] **Step 2: Crear proyecto Neon y migración**

1. Crear proyecto en [Neon Console](https://console.neon.tech) o `npx neonctl@latest init --agent cursor`.
2. Copiar `DATABASE_URL` (preferir **pooled** en producción).
3. Run:

```bash
pnpm db:migrate --name init_academic_portal
pnpm db:generate
```

Expected: carpeta `prisma/migrations/*_init_academic_portal/` creada sin errores.

- [ ] **Step 3: Commit**

```bash
git add prisma/
git commit -m "feat(db): add prisma schema for academic services portal"
```

---

### Task 3: Cliente Prisma singleton (solo adaptador `neon`)

**Files:**
- Create: `lib/db.ts`

> `lib/db.ts` **no** se exporta a `app/` ni `components/`. Solo `lib/academic-services/providers/neon/*` y scripts de seed/migración.

- [ ] **Step 1: Implementar singleton**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: Smoke test manual**

Create `scripts/prisma-smoke.ts`:

```typescript
import { prisma } from '../lib/db';

async function main() {
  const count = await prisma.studentType.count();
  console.log('studentType.count =', count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `npx tsx --env-file=.env.local scripts/prisma-smoke.ts`
Expected: `studentType.count = 0`

- [ ] **Step 3: Commit**

```bash
git add lib/db.ts scripts/prisma-smoke.ts
git commit -m "feat(db): add prisma singleton client"
```

---

### Task 4: Tipos y mapper JSON → Prisma create input

**Files:**
- Create: `lib/seed/types.ts`
- Create: `lib/seed/map-utpl-json.ts`
- Create: `tests/lib/seed/map-utpl-json.test.ts`

- [ ] **Step 1: Escribir test que falla**

```typescript
// tests/lib/seed/map-utpl-json.test.ts
import { describe, expect, it } from 'vitest';

import { mapUtplJsonToSeedPayload } from '@/lib/seed/map-utpl-json';
import type { UtplServicesJson } from '@/lib/seed/types';

const sample: UtplServicesJson = {
  studentTypes: [
    {
      code: 'CONTINUO',
      name: 'Continuo',
      categories: [
        {
          name: 'CAT-A',
          services: [
            {
              title: 'Servicio demo',
              isActive: true,
              requirements: ['Req 1'],
              requirementTabs: [
                {
                  tabName: 'DISTANCIA',
                  title: 'Bloque A',
                  items: [{ text: 'Item 1', pdfUrl: 'https://x.pdf' }],
                },
              ],
              periods: [
                {
                  name: 'Periodo 2026',
                  modalities: [
                    {
                      modality: 'General',
                      requestWindow: 'desde abril',
                      responseWindow: null,
                    },
                  ],
                },
              ],
              manuals: [{ label: 'Manual', url: 'https://manual' }],
            },
          ],
        },
      ],
    },
  ],
};

describe('mapUtplJsonToSeedPayload', () => {
  it('maps nested hierarchy with tabs grouped as separate rows', () => {
    const payload = mapUtplJsonToSeedPayload(sample);
    expect(payload).toHaveLength(1);
    expect(payload[0].code).toBe('CONTINUO');
    expect(payload[0].categories[0].services[0].title).toBe('Servicio demo');
    expect(payload[0].categories[0].services[0].requirementTabs[0].tabName).toBe(
      'DISTANCIA',
    );
    expect(payload[0].categories[0].services[0].requirements[0].text).toBe('Req 1');
  });
});
```

- [ ] **Step 2: Run test — debe fallar**

Run: `pnpm test tests/lib/seed/map-utpl-json.test.ts`
Expected: FAIL — cannot find module `@/lib/seed/map-utpl-json`

- [ ] **Step 3: Implementar `lib/seed/types.ts`**

```typescript
export type UtplRequirementItem = {
  text: string;
  pdfUrl?: string | null;
};

export type UtplRequirementTab = {
  tabName: string;
  title?: string | null;
  items: UtplRequirementItem[];
};

export type UtplPeriodModality = {
  modality: string;
  requestWindow?: string | null;
  responseWindow?: string | null;
};

export type UtplPeriod = {
  name: string;
  modalities: UtplPeriodModality[];
};

export type UtplManual = {
  label: string;
  url: string;
};

export type UtplService = {
  title: string;
  description?: string | null;
  modalityLevel?: string | null;
  responseTime?: string | null;
  cost?: string | null;
  note?: string | null;
  isActive?: boolean;
  requirements?: string[];
  requirementTabs?: UtplRequirementTab[];
  periods?: UtplPeriod[];
  manuals?: UtplManual[];
};

export type UtplCategory = {
  name: string;
  description?: string | null;
  services: UtplService[];
};

export type UtplStudentType = {
  code: string;
  name: string;
  description?: string | null;
  categories: UtplCategory[];
};

export type UtplServicesJson = {
  studentTypes: UtplStudentType[];
};
```

- [ ] **Step 4: Implementar mapper**

```typescript
// lib/seed/map-utpl-json.ts
import type { UtplServicesJson } from './types';

export type SeedRequirement = { text: string; sortOrder: number };
export type SeedRequirementItem = { text: string; pdfUrl: string | null; sortOrder: number };
export type SeedRequirementTab = {
  tabName: string;
  title: string | null;
  sortOrder: number;
  items: SeedRequirementItem[];
};
export type SeedPeriodModality = {
  modality: string;
  requestWindow: string | null;
  responseWindow: string | null;
  sortOrder: number;
};
export type SeedPeriod = {
  name: string;
  sortOrder: number;
  modalities: SeedPeriodModality[];
};
export type SeedManual = { label: string; url: string; sortOrder: number };
export type SeedService = {
  title: string;
  description: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  isActive: boolean;
  requirements: SeedRequirement[];
  requirementTabs: SeedRequirementTab[];
  periods: SeedPeriod[];
  manuals: SeedManual[];
};
export type SeedCategory = {
  name: string;
  description: string | null;
  services: SeedService[];
};
export type SeedStudentType = {
  code: string;
  name: string;
  description: string | null;
  categories: SeedCategory[];
};

export function mapUtplJsonToSeedPayload(json: UtplServicesJson): SeedStudentType[] {
  return json.studentTypes.map((st) => ({
    code: st.code.trim().toUpperCase(),
    name: st.name.trim(),
    description: st.description?.trim() ?? null,
    categories: st.categories.map((cat) => ({
      name: cat.name.trim(),
      description: cat.description?.trim() ?? null,
      services: cat.services.map((svc) => ({
        title: svc.title.trim(),
        description: svc.description?.trim() ?? null,
        modalityLevel: svc.modalityLevel?.trim() ?? null,
        responseTime: svc.responseTime?.trim() ?? null,
        cost: svc.cost?.trim() ?? null,
        note: svc.note?.trim() ?? null,
        isActive: svc.isActive ?? true,
        requirements: (svc.requirements ?? []).map((text, index) => ({
          text: text.trim(),
          sortOrder: index,
        })),
        requirementTabs: (svc.requirementTabs ?? []).map((tab, tabIndex) => ({
          tabName: tab.tabName.trim(),
          title: tab.title?.trim() ?? null,
          sortOrder: tabIndex,
          items: tab.items.map((item, itemIndex) => ({
            text: item.text.trim(),
            pdfUrl: item.pdfUrl?.trim() ?? null,
            sortOrder: itemIndex,
          })),
        })),
        periods: (svc.periods ?? []).map((period, periodIndex) => ({
          name: period.name.trim(),
          sortOrder: periodIndex,
          modalities: period.modalities.map((mod, modIndex) => ({
            modality: mod.modality.trim(),
            requestWindow: mod.requestWindow?.trim() ?? null,
            responseWindow: mod.responseWindow?.trim() ?? null,
            sortOrder: modIndex,
          })),
        })),
        manuals: (svc.manuals ?? []).map((manual, manualIndex) => ({
          label: manual.label.trim(),
          url: manual.url.trim(),
          sortOrder: manualIndex,
        })),
      })),
    })),
  }));
}
```

- [ ] **Step 5: Run test — debe pasar**

Run: `pnpm test tests/lib/seed/map-utpl-json.test.ts`
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
git add lib/seed/ tests/lib/seed/
git commit -m "feat(seed): add UTPL JSON mapper with unit tests"
```

---

### Task 5: Script de seed transaccional

**Files:**
- Create: `scripts/seed-academic-services.ts`
- Create: `data/utpl-servicios-academicos.json` (mínimo 1 tipo para CI local; el equipo reemplaza con export real)

- [ ] **Step 1: JSON mínimo de desarrollo** (`data/utpl-servicios-academicos.json`)

Usar el objeto `sample` del test de Task 4, envuelto como `{ "studentTypes": [ ... ] }`.

- [ ] **Step 2: Script de seed**

```typescript
// scripts/seed-academic-services.ts
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '../lib/db';
import { mapUtplJsonToSeedPayload } from '../lib/seed/map-utpl-json';
import type { UtplServicesJson } from '../lib/seed/types';

async function main() {
  if (process.env.ACADEMIC_SERVICES_DATA_PROVIDER !== 'neon') {
    throw new Error('db:seed:servicios requires ACADEMIC_SERVICES_DATA_PROVIDER=neon');
  }

  const filePath = path.join(process.cwd(), 'data/utpl-servicios-academicos.json');
  const raw = await readFile(filePath, 'utf8');
  const json = JSON.parse(raw) as UtplServicesJson;
  const payload = mapUtplJsonToSeedPayload(json);

  await prisma.$transaction(async (tx) => {
    await tx.serviceManual.deleteMany();
    await tx.servicePeriodModality.deleteMany();
    await tx.servicePeriod.deleteMany();
    await tx.serviceRequirementItem.deleteMany();
    await tx.serviceRequirementTab.deleteMany();
    await tx.serviceRequirement.deleteMany();
    await tx.service.deleteMany();
    await tx.serviceCategory.deleteMany();
    await tx.studentType.deleteMany();

    for (const st of payload) {
      await tx.studentType.create({
        data: {
          code: st.code,
          name: st.name,
          description: st.description,
          categories: {
            create: st.categories.map((cat) => ({
              name: cat.name,
              description: cat.description,
              services: {
                create: cat.services.map((svc) => ({
                  title: svc.title,
                  description: svc.description,
                  modalityLevel: svc.modalityLevel,
                  responseTime: svc.responseTime,
                  cost: svc.cost,
                  note: svc.note,
                  isActive: svc.isActive,
                  requirements: { create: svc.requirements },
                  requirementTabs: {
                    create: svc.requirementTabs.map((tab) => ({
                      tabName: tab.tabName,
                      title: tab.title,
                      sortOrder: tab.sortOrder,
                      items: { create: tab.items },
                    })),
                  },
                  periods: {
                    create: svc.periods.map((period) => ({
                      name: period.name,
                      sortOrder: period.sortOrder,
                      modalities: { create: period.modalities },
                    })),
                  },
                  manuals: { create: svc.manuals },
                })),
              },
            })),
          },
        },
      });
    }
  });

  const counts = {
    studentTypes: await prisma.studentType.count(),
    categories: await prisma.serviceCategory.count(),
    services: await prisma.service.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Ejecutar seed**

Run: `pnpm db:seed:servicios`
Expected: `Seed complete: { studentTypes: 1, categories: 1, services: 1 }` (con JSON mínimo)

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-academic-services.ts data/utpl-servicios-academicos.json
git commit -m "feat(seed): load academic services JSON into neon"
```

---

### Task 6: Fachada de repositorios (lectura pública)

**Files:**
- Create: `lib/academic-services/repositories/student-types.ts`
- Create: `lib/academic-services/repositories/service-categories.ts`
- Create: `lib/academic-services/repositories/services.ts`
- Create: `lib/academic-services/repositories/index.ts`
- Create: `tests/lib/academic-services/repositories/services.test.ts`

> Los archivos en `repositories/` son **una línea por método**: `return getReadPort().listStudentTypes()`. La lógica de filtro `isActive` vive en el adaptador Neon, no en React.

- [ ] **Step 1: Test — servicio inactivo no aparece** (contra adaptador Neon + DB)

```typescript
// tests/lib/academic-services/repositories/services.test.ts
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/db';
import { listActiveServicesByCategoryId } from '@/lib/academic-services/repositories/services';

describe('listActiveServicesByCategoryId', () => {
  beforeEach(async () => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = 'neon';
    await prisma.serviceManual.deleteMany();
    await prisma.servicePeriodModality.deleteMany();
    await prisma.servicePeriod.deleteMany();
    await prisma.serviceRequirementItem.deleteMany();
    await prisma.serviceRequirementTab.deleteMany();
    await prisma.serviceRequirement.deleteMany();
    await prisma.service.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.studentType.deleteMany();

    const st = await prisma.studentType.create({
      data: { code: 'TEST', name: 'Test' },
    });
    const cat = await prisma.serviceCategory.create({
      data: { name: 'Cat', studentTypeId: st.id },
    });
    await prisma.service.createMany({
      data: [
        { title: 'Visible', categoryId: cat.id, isActive: true },
        { title: 'Oculto', categoryId: cat.id, isActive: false },
      ],
    });
  });

  it('returns only active services', async () => {
    const cat = await prisma.serviceCategory.findFirstOrThrow();
    const services = await listActiveServicesByCategoryId(cat.id);
    expect(services).toHaveLength(1);
    expect(services[0].title).toBe('Visible');
  });
});
```

- [ ] **Step 2: Run test — FAIL**

Run: `pnpm test tests/lib/academic-services/repositories/services.test.ts`

- [ ] **Step 3: Implementar fachada** (delegación a `getReadPort()`)

```typescript
// lib/academic-services/repositories/student-types.ts
import { getReadPort } from '@/lib/academic-services/providers/registry';

export async function listStudentTypes() {
  return getReadPort().listStudentTypes();
}

export async function getStudentTypeByCode(code: string) {
  return getReadPort().getStudentTypeByCode(code);
}
```

Implementar `service-categories.ts` y `services.ts` igual. Mover `groupRequirementTabsByName` a `lib/academic-services/domain/grouping.ts` (función pura sobre DTOs) y re-exportar desde `repositories/index.ts`.

- [ ] **Step 4: Run test — PASS**

Run: `pnpm test tests/lib/academic-services/repositories/services.test.ts`

- [ ] **Step 5: Commit**

```bash
git add lib/academic-services/repositories/ tests/lib/academic-services/
git commit -m "feat(data): add provider-agnostic facade for academic services reads"
```

---

### Task 6b: Puerto `getPublicPortalCatalog` + fachada

**Files:**
- Modify: `lib/academic-services/ports/academic-services-read.ts`
- Modify: `lib/academic-services/providers/neon/read-port.ts`
- Create: `lib/academic-services/repositories/portal-catalog.ts`
- Create: `tests/lib/academic-services/repositories/portal-catalog.test.ts`

- [ ] **Step 1:** Query única en Neon: tipos, categorías y servicios activos (`studentTypeId`, `categoryId` en cada servicio).

- [ ] **Step 2:** `getPublicPortalCatalog()` en fachada.

- [ ] **Step 3: Test** — excluye `isActive: false`.

- [ ] **Step 4: Commit** `feat(data): add public portal catalog for single-page servicios view`

---

### Task 7: Vista única `/servicios` (layout referencia UTPL)

**Files:**
- Create: `app/servicios/layout.tsx`
- Create: `app/servicios/page.tsx`
- Create: `components/servicios/ServiciosPortal.tsx`
- Create: `components/servicios/StudentTypeSidebar.tsx`
- Create: `components/servicios/CategoryChips.tsx`
- Create: `components/servicios/ServiceSearchBar.tsx`
- Create: `components/servicios/ServiceCardGrid.tsx`

- [ ] **Step 1: Layout** — `PageHeader` + `main` con `bg-utpl-surface`, contenedor `max-w-7xl`.

- [ ] **Step 2: Server page**

```tsx
// app/servicios/page.tsx
import { ServiciosPortal } from '@/components/servicios/ServiciosPortal';
import { getPublicPortalCatalog } from '@/lib/academic-services/repositories/portal-catalog';

export const metadata = { title: 'Servicios por tipo de estudiante | UTPL' };

export default async function ServiciosPage() {
  const catalog = await getPublicPortalCatalog();
  return <ServiciosPortal initialCatalog={catalog} />;
}
```

- [ ] **Step 3: `ServiciosPortal` (client)** — título “SERVICIOS POR TIPO DE ESTUDIANTE.”, sidebar tipos, buscador “Buscar …”, chips de categoría, grilla 3 columnas; **sin `Link` a subrutas**.

- [ ] **Step 4: Verificación** — solo `http://localhost:3000/servicios`; cambiar tipo/categoría no cambia la URL.

- [ ] **Step 5: Commit** `feat(servicios): single-page portal matching UTPL layout`

---

### Task 8: Modal de detalle (misma ruta `/servicios`)

**Files:**
- Create: `components/servicios/ServiceDetailModal.tsx`
- Create: `components/servicios/ServiceDetailContent.tsx`
- Create: `components/servicios/RequirementTabs.tsx`
- Create: `components/servicios/PeriodsTable.tsx`
- Create: `components/servicios/ManualsList.tsx`
- Create: `app/servicios/actions.ts` (Server Action `fetchServiceDetail`)
- Modify: `components/servicios/ServiciosPortal.tsx`

- [ ] **Step 1:** Clic en tarjeta → `Dialog`/`Sheet` shadcn; cargar detalle con Server Action.

- [ ] **Step 2:** Requisitos, pestañas (`groupRequirementTabsByName`), periodos (ocultar si vacío), manuales; costo **“Sin costo”** si null.

- [ ] **Step 3: Criterio Fase 1** — modal con datos completos; `isActive = false` → tarjeta no visible.

- [ ] **Step 4: Commit** `feat(servicios): service detail modal on single-page portal`

---

# FASE 2 — Autenticación `/administrativo` y CRUD (una vista)

### Task 10b (Fase 2, junto con write port): Completar `AcademicServicesWritePort` en Neon

**Files:**
- Modify: `lib/academic-services/providers/neon/write-port.ts`
- Modify: `lib/academic-services/ports/academic-services-write.ts`

- [ ] **Step 1:** Definir métodos: `getDashboardCounts`, `createStudentType`, `updateStudentType`, `deleteStudentType`, CRUD categorías, `upsertService`, `deleteService`, listados admin.

- [ ] **Step 2:** Implementación transaccional Prisma (mover lógica que antes vivía en Server Actions).

- [ ] **Step 3:** Tests de integración mínimos por método crítico (`upsertService`, delete guards).

- [ ] **Step 4: Commit** `feat(academic-services): implement neon write port for admin crud`

---

### Task 11: NextAuth credentials

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Modify: `middleware.ts`

- [ ] **Step 1: `auth.ts`**

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== 'string' || typeof password !== 'string') return null;

        const expectedUser = process.env.ADMIN_USERNAME;
        const expectedPassword = process.env.ADMIN_PASSWORD;
        if (!expectedUser || !expectedPassword) return null;
        if (username !== expectedUser) return null;

        const ok =
          expectedPassword.startsWith('$2')
            ? await bcrypt.compare(password, expectedPassword)
            : password === expectedPassword;

        if (!ok) return null;
        return { id: 'admin', name: expectedUser };
      },
    }),
  ],
  session: { strategy: 'jwt' },
});
// Sin pages.signIn — el formulario vive en /administrativo
```

- [ ] **Step 2: Route handler** — `app/api/auth/[...nextauth]/route.ts`.

- [ ] **Step 3: Middleware** — no redirigir `/administrativo` a otra URL; conservar lógica del wizard de turnos.

- [ ] **Step 4: `AdministrativoLogin` + `page.tsx`** — si `!auth()` → login; si sesión → portal. Tras login: `signIn(..., { redirect: false })` + `router.refresh()`.

- [ ] **Step 5: Server Actions** — `if (!await auth()) throw …` al inicio de cada mutación.

- [ ] **Step 6: Verificación**

1. `/administrativo` sin sesión → formulario (misma URL).
2. Login OK → panel en la misma URL.
3. `signOut` → vuelve el formulario.

- [ ] **Step 7: Commit**

```bash
git add auth.ts app/api/auth/ app/administrativo/ components/administrativo/AdministrativoLogin.tsx
git commit -m "feat(administrativo): inline login on single admin page"
```

---

### Task 12: Validaciones Zod compartidas

**Files:**
- Create: `lib/validations/academic-service.ts`
- Create: `tests/lib/validations/academic-service.test.ts`

- [ ] **Step 1: Test obligatorios**

```typescript
import { describe, expect, it } from 'vitest';

import { serviceGeneralSchema } from '@/lib/validations/academic-service';

describe('serviceGeneralSchema', () => {
  it('requires title and categoryId', () => {
    const parsed = serviceGeneralSchema.safeParse({ title: '', categoryId: 0 });
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Schemas**

```typescript
import { z } from 'zod';

export const studentTypeSchema = z.object({
  code: z.string().min(1).transform((v) => v.trim().toUpperCase()),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  studentTypeId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const serviceGeneralSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  modalityLevel: z.string().optional().nullable(),
  responseTime: z.string().optional().nullable(),
  cost: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export const serviceFullSchema = serviceGeneralSchema.extend({
  requirements: z.array(z.object({ text: z.string().min(1), sortOrder: z.number().int() })),
  requirementTabs: z.array(
    z.object({
      tabName: z.string().min(1),
      title: z.string().optional().nullable(),
      sortOrder: z.number().int(),
      items: z.array(
        z.object({
          text: z.string().min(1),
          pdfUrl: z.string().url().optional().nullable(),
          sortOrder: z.number().int(),
        }),
      ),
    }),
  ),
  periods: z.array(
    z.object({
      name: z.string().min(1),
      sortOrder: z.number().int(),
      modalities: z.array(
        z.object({
          modality: z.string().min(1),
          requestWindow: z.string().optional().nullable(),
          responseWindow: z.string().optional().nullable(),
          sortOrder: z.number().int(),
        }),
      ),
    }),
  ),
  manuals: z.array(
    z.object({
      label: z.string().min(1),
      url: z.string().url(),
      sortOrder: z.number().int(),
    }),
  ),
});
```

- [ ] **Step 3: Run tests + commit**

---

### Task 13: Vista única `/administrativo` (tabs + CRUD en cliente)

**Files:**
- Create: `app/administrativo/layout.tsx`
- Create: `app/administrativo/page.tsx`
- Create: `app/administrativo/actions.ts` (todas las Server Actions)
- Create: `components/administrativo/AdministrativoPortal.tsx` (client)
- Create: `components/administrativo/AdministrativoShell.tsx`
- Create: `components/administrativo/AdminTabs.tsx`
- Create: `components/administrativo/DataTable.tsx`
- Create: `components/administrativo/StudentTypeForm.tsx`
- Create: `components/administrativo/CategoryForm.tsx`
- Create: `components/administrativo/ServiceForm/` (4 sub-pestañas)

- [ ] **Step 1:** Server page carga datos iniciales (métricas, tipos, categorías, servicios) vía write/read port → pasa a `AdministrativoPortal`.

- [ ] **Step 2:** Tabs internos (sin cambiar URL): **Resumen** | **Tipos** | **Categorías** | **Servicios**.

- [ ] **Step 3:** CRUD tipos/categorías en tablas + formularios inline o modal.

- [ ] **Step 4:** Tab Servicios: tabla con filtros; **crear/editar** abre `Sheet` ancho con `ServiceForm` (General, Requisitos, Periodos, Manuales) → `upsertService` / `deleteService` en `actions.ts`.

- [ ] **Step 5:** `revalidatePath('/administrativo')` y `revalidatePath('/servicios')` tras mutaciones.

- [ ] **Step 6: Criterios Fase 2**

1. Crear tipo + categoría + servicio → visible en `/servicios` sin recargar rutas hijas.
2. Editar en sheet → modal público en `/servicios` refleja cambios.
3. `isActive = false` → oculto en público, visible en tabla admin.

- [ ] **Step 7: Commit** `feat(administrativo): single-page admin portal with tabbed crud`

---

# FASE 3 — Mejoras UX (opcional, post-MVP)

### Task 21: Buscador global en la misma `/servicios`

**Files:**
- Modify: `components/servicios/ServiciosPortal.tsx`
- Create: `lib/academic-services/repositories/search.ts`

- [ ] **Step 1:** Modo “buscar en todos los tipos/categorías” en el buscador existente (sin nueva ruta).

- [ ] **Step 2: Commit**

### Task 22: Filtros avanzados (costo, modalidad)

- [ ] **Step 1: Extender `ServiceSearch` o nueva página con filtros client-side sobre lista precargada.

- [ ] **Step 2: Commit**

### Task 23: Reordenar con drag-and-drop (nice to have)

- [ ] **Step 1: `@dnd-kit/core` en admin Requirements/Periods, persistir `sortOrder`.

- [ ] **Step 2: Commit**

---

## Self-Review (checklist del autor del plan)

| Requisito PRD | Task(s) |
|---------------|---------|
| Backend desacoplado (ports/adapters) | Task 0, 6; env `ACADEMIC_SERVICES_DATA_PROVIDER` |
| Proveedor Neon por defecto | Task 0, 2–3, adaptador `providers/neon` |
| Stub Microsoft activable por env | Task 0 (`providers/microsoft`) |
| Sin Prisma en `app/` ni `components/` | Tasks 0, 6–8, 10b, 11–13 |
| Login admin en misma URL | Task 11 (sin `/administrativo/login`) |
| Dos rutas de usuario solamente | Tasks 7–8, 13 |
| Neon + Prisma schema | Task 2 |
| Seed JSON | Tasks 4–5 |
| Vista única `/servicios` (referencia UTPL) | Tasks 6b, 7–8 |
| Solo `isActive = true` | Tasks 6b, 7–8 |
| Costo null → "Sin costo" | Task 8 (modal) |
| Ocultar periodos/tabs vacíos | Task 8 |
| Admin auth inline en `/administrativo` | Task 11 |
| Vista única admin + CRUD + delete guards | Task 13 |
| Formulario servicio 4 tabs (sheet) | Task 13 |
| Fase 3 buscador/filtros/dnd | Tasks 21–23 |

**Placeholder scan:** ningún TBD en pasos de implementación; JSON de producción debe aportarlo el equipo en `data/utpl-servicios-academicos.json`.

**Consistencia de tipos:** `groupRequirementTabsByName`, `serviceFullSchema` y mapper seed usan la misma forma de `requirementTabs`.

**Gap conocido:** el JSON fuente en S3 del PRD no está en el repo (403 al fetch); el equipo debe colocar el export real antes del seed de producción.

**Gap conocido (Microsoft):** producto exacto de la suite Microsoft sin definir. El plan reserva puertos y stub; la implementación real será un adaptador nuevo sin cambiar UI.

---

## Verificación final antes de merge

```bash
pnpm lint:all
pnpm test
pnpm build
pnpm db:seed:servicios   # con JSON completo
pnpm dev                 # /servicios: filtros + modal | /administrativo: login inline → CRUD
```

---

## Execution Handoff

**Plan actualizado** en `docs/superpowers/plans/2026-05-16-portal-servicios-academicos-utpl.md`.

**Alcance UX final:** 2 rutas visibles (`/servicios`, `/administrativo`) + `/api/auth/*` técnico.

**Orden sugerido de implementación:**

1. Tasks 0–5 — proveedor, Prisma, seed  
2. Tasks 6b, 7–8 — `/servicios` (vista única + modal)  
3. Tasks 10b, 11–13 — `/administrativo` (login inline + CRUD en tabs)  
4. Tasks 21–23 — opcional post-MVP  

**Opciones de ejecución:**

1. **Subagent-Driven (recommended)** — un subagente por task, revisión entre tasks  
2. **Inline Execution** — mismo hilo con checkpoints tras Fase 1 y Fase 2  
