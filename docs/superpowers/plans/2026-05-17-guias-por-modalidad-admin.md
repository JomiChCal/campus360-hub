# Guías Por Modalidad (Modal de Servicios) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar en la modal pública una segunda sección `Documento` con `Guías por modalidad`, usando tabs `Distancia`, `Presencial`, `Tecnologías` y subgrupos por tipo de estudiante, editable desde `/administrativo`.

**Architecture:** Reutilizar la estructura existente `requirementTabs` por modalidad para documentos y agregar render explícito de `guides` en la modal. Completar el flujo administrativo para editar `requirementTabs` + `guides` (hoy solo se preservan en edición). Mantener compatibilidad con datos legacy sin guías.

**Tech Stack:** Next.js App Router, React client components, Server Actions, Prisma + Neon, Zod.

---

## Estado Actual (baseline)

- `fetchServiceDetail` ya trae `ServiceDetail` completo desde backend.
- El backend ya tiene modelo para guías por tab: `ServiceRequirementTabGuide`.
- `ServiceDetailContent` renderiza `requirements` y `requirementTabs.items`, pero **no** renderiza `guides`.
- `ServiceForm` en `/administrativo` **no** edita `requirementTabs`; solo los conserva al guardar (`preservedRequirementTabs`).
- Importador `map-utpl-portal-api` inicializa `guides: []`.

## Archivos a tocar

- Modificar: `components/servicios/ServiceDetailContent.tsx`
- Modificar: `components/servicios/service-detail-content.module.css`
- Modificar: `components/administrativo/ServiceForm/ServiceForm.tsx`
- Crear (recomendado): `components/administrativo/ServiceForm/RequirementTabsEditor.tsx`
- Modificar: `lib/validations/academic-service.ts` (solo si se ajusta contrato de payload)
- Modificar: `app/administrativo/actions.ts` (solo si cambia mapeo final)
- Verificar: `lib/academic-services/providers/neon/mappers.ts`, `lib/academic-services/providers/neon/read-port.ts`, `prisma/schema.prisma`, `prisma/migrations/*`

---

### Task 1: Auditoría de contrato de datos y compatibilidad

**Files:**
- Read: `lib/academic-services/domain/service-detail.ts`
- Read: `lib/academic-services/providers/neon/mappers.ts`
- Read: `prisma/schema.prisma`

- [ ] **Step 1: Confirmar contrato actual para guías por modalidad**
- Verificar que `GroupedRequirementTab.blocks[].guides[]` sea la fuente oficial para “Guías por modalidad”.

- [ ] **Step 2: Verificar entorno/migraciones**
- Confirmar que la migración `20260517234500_add_programs_and_tab_guides` esté aplicada en el entorno objetivo.
- Si no está aplicada, ejecutar migración antes de desplegar frontend.

- [ ] **Step 3: Criterio de compatibilidad**
- Definir fallback visual: si no hay guías en un tab, mostrar `No hay guías publicadas para esta modalidad.`

### Task 2: UI pública en modal (`/servicios`) con sección “Documento”

**Files:**
- Modify: `components/servicios/ServiceDetailContent.tsx`
- Modify: `components/servicios/service-detail-content.module.css`

- [ ] **Step 1: Extraer/normalizar dos vistas desde el mismo set de tabs**
- Vista A: `Documentación por modalidad` (items)
- Vista B: `Documento · Guías por modalidad` (guides)

- [ ] **Step 2: Renderizar segundo bloque debajo del primero**
- Mantener tabs de modalidad (`Distancia/Presencial/Tecnologías`) en ambas secciones.
- Mantener agrupación por bloque/título (`Estudiantes ECTS`, `Estudiantes Rediseño`, etc.)

- [ ] **Step 3: Estilos y alineación**
- Alinear spacing, bordes y comportamiento responsive con el bloque existente.
- Evitar desbordes horizontales en tabs y grids en móvil.

- [ ] **Step 4: Empty states claros**
- Si hay tabs pero sin guías: mensaje por modalidad.
- Si no hay tabs: mensaje general del servicio.

### Task 3: Edición administrativa de tabs y guías

**Files:**
- Modify: `components/administrativo/ServiceForm/ServiceForm.tsx`
- Create: `components/administrativo/ServiceForm/RequirementTabsEditor.tsx` (recomendado)
- Modify: `app/administrativo/actions.ts` (si aplica)

- [ ] **Step 1: Agregar editor estructurado de `requirementTabs`**
- Campos por bloque:
- `tabName` (Distancia/Presencial/Tecnologías)
- `title` (ECTS/Rediseño/Tecnologías)
- `items[]` (texto + url opcional PDF)
- `guides[]` (label + url obligatorio)

- [ ] **Step 2: Integrar editor en nueva pestaña del form**
- Añadir tab nueva en `ServiceForm`: `Documentación`.
- Reemplazar preservación pasiva por payload real editable.

- [ ] **Step 3: Mantener “Manuales” separados o deprecarlos explícitamente**
- Decidir una política:
- Opción A: conservar `manuals` como bloque general del servicio.
- Opción B: migrar uso funcional a `guides` por modalidad y ocultar `manuals` del UI.

- [ ] **Step 4: Validación de payload**
- Reusar `serviceFullSchema` y reforzar reglas UX (URLs válidas, labels requeridos en guías).

### Task 4: Seed/import y backfill de datos

**Files:**
- Modify (opcional): `lib/seed/map-utpl-portal-api.ts`
- Modify (opcional): `scripts/seed-neon-mock.ts`

- [ ] **Step 1: Definir estrategia de población inicial de guías**
- Si fuente actual no trae guías, mantener vacío y completar desde `/administrativo`.
- Alternativa temporal: mapear `manuals` globales como `guides` en todas las modalidades (si negocio lo aprueba).

- [ ] **Step 2: Backfill controlado**
- Script/manual SQL solo si negocio pide precarga masiva.

### Task 5: QA funcional y regresión

**Files:**
- Validate: `components/servicios/*`, `components/administrativo/*`, `app/administrativo/actions.ts`

- [ ] **Step 1: Verificación local**
- Abrir servicio con tabs poblados y validar:
- Requisitos visibles
- Documentación por modalidad visible
- Documento/Guías por modalidad visible

- [ ] **Step 2: Verificación CRUD admin**
- Crear servicio con 3 modalidades y grupos ECTS/Rediseño.
- Editar y confirmar persistencia de guías por modalidad.

- [ ] **Step 3: Verificación técnica**
- Ejecutar:
  - `pnpm -s tsc --noEmit`
  - `pnpm -s test` (si hay suite)
  - `pnpm -s lint` (si configuración vigente lo permite)

- [ ] **Step 4: Criterios de aceptación**
- El modal muestra dos secciones distintas bajo “Requisitos”: documentación e indicadores de guías por modalidad.
- Las guías se editan desde `/administrativo` y persisten en DB.
- No se rompe la visualización en servicios legacy sin guías.

---

## Riesgos y decisiones abiertas

1. Duplicación visual: definir si ambas secciones deben compartir estado de tab o tener tab activa independiente.
2. “Manuales” vs “Guías”: confirmar si conviven o si `manuals` se deprecian.
3. Entornos legacy: si hay DB sin tabla `ServiceRequirementTabGuide`, aplicar migración antes de release.

## Estimación

- Diseño/implementación frontend modal: 0.5 día
- Editor administrativo de tabs+guías: 1 a 1.5 días
- QA y ajustes: 0.5 día
- Total: 2 a 2.5 días
