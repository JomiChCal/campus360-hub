# UTPL Portales Manual ETL Design

**Problem**

Necesitamos poblar Neon con catálogo de `https://portales.utpl.edu.ec/servicios-academicos` sin tocar el modelo actual de base de datos. La fuente trae contenido mixto: servicios reales, títulos con prefijos visuales (`⚪ 🟡 🟢 🔵`), HTML ruidoso, filas con tipos múltiples y casos incompletos.

**Goal**

Implementar un proceso manual, preciso y auditable de ETL `Portales UTPL -> Neon` que:
- no haga cambios de esquema en Neon
- conserve máxima cobertura de contenido útil del portal
- normalice datos agresivamente antes de cargar
- descarte solo filas imposible de mapear por tipo vacío
- deje trazabilidad completa por corrida

## Scope

Incluye:
- extracción manual del endpoint de portal
- validación de contrato del payload
- normalización y transformación al modelo interno existente
- carga total transaccional en Neon
- validación posterior con reportes

No incluye:
- migraciones Prisma o cambios en tablas
- ejecución automática por cron
- cambios en UX del portal estudiante/admin

## Source Contract

Endpoint oficial:
- `https://portales.utpl.edu.ec/servicios-academicos`

Contrato esperado por fila:
- `field_tipo_estudiante`
- `field_categoria_servicio`
- `field_nombre_servicio`
- `field_nombre_servicio_1`
- `field_descripcion_servicio`

Si cambia contrato (faltan campos o aparecen campos incompatibles), corrida debe fallar antes del seed.

## ETL Architecture (Manual)

1. **Fetch**
- Leer endpoint y guardar snapshot en `data/utpl-portal-raw.json`.
- Generar manifiesto en `data/utpl-portal-fetch-manifest.json` con:
  - fecha/hora
  - URL origen
  - conteo filas
  - hash SHA-256 del payload
  - llaves detectadas

2. **Normalize + Transform**
- Convertir filas raw al shape de seed del sistema.
- Generar salida normalizada en `data/utpl-servicios-academicos.json`.
- Generar reporte de importación en `data/utpl-portal-import-report.json`.

3. **Seed Neon (Full Refresh)**
- Ejecutar recarga total de tablas de catálogo de servicios (sin alterar schema).
- Operación en transacción única:
  - si falla, rollback completo
  - si pasa, commit único

4. **Post-Validation**
- Validar integridad funcional (conteos, relaciones, consistencia catálogos).
- Falla en validación = corrida inválida.

## Mapping Rules

Base:
- `field_tipo_estudiante` -> `StudentType`
- `field_categoria_servicio` -> `ServiceCategory`
- `field_nombre_servicio` -> `Service.title`
- `field_descripcion_servicio` -> `Service` + tablas hijas parseadas

Identidad técnica:
- `sourceKey = sha256(type|category|rawTitle|rowIndex).slice(0, 40)`
- `sourceRowIndex = índice global de fila`

Expansión por tipo:
- Si una fila trae múltiples tipos (`NUEVO, CONTINUO`), se expande a una colocación por tipo.

## Normalization Rules

### 1. Título del servicio
- Trim de extremos.
- Colapso de espacios internos repetidos.
- Remover prefijo visual inicial `⚪`, `🟡`, `🟢`, `🔵` cuando exista.
- Remover bullets iniciales redundantes (`-`, `•`, `*`) si aparecen.
- Mantener acentos y texto original restante.

### 2. Tipo y categoría
- `field_tipo_estudiante`: trim, split por coma, uppercase.
- Validar contra set permitido: `CONTINUO`, `NUEVO`, `POSTULANTE`, `ALUMNI`.
- `field_categoria_servicio`: trim y normalización de espacios.

### 3. HTML de descripción
- Quitar scripts y ruido no estructural.
- Absolutizar URLs relativas:
  - `/sites/...` -> `https://portales.utpl.edu.ec/sites/...`
  - `/themes/...` -> `https://portales.utpl.edu.ec/themes/...`
- Parsear bloques para alimentar:
  - `ServiceRequirement`
  - `ServiceRequirementTab`
  - `ServiceRequirementItem`
  - `ServiceRequirementTabGuide`
  - `ServicePeriod`
  - `ServicePeriodModality`
  - `ServiceManual`

### 4. Fechas y ventanas
- Parsear fechas válidas a `Date`.
- Valor inválido o ambiguo -> `null` y warning en reporte.

## Discard Policy

Descartar únicamente cuando:
- `field_tipo_estudiante` venga totalmente vacío, o
- después de normalizar no quede ningún tipo válido.

No descartar por:
- prefijos `⚪ 🟡 🟢 🔵`
- texto `disableblock`
- descripción vacía

Esos casos se deben normalizar/adaptar y mapear cuando exista tipo válido.

## Status and Activation Rules

- Filas con tipo válido entran como catálogo normal (`status` e `isActive` según reglas actuales del mapeo).
- Filas descartadas por tipo vacío se registran en reporte (`discardedRowDetails`) y no se insertan.

## Manual Runbook

Orden de ejecución manual:
1. `pnpm import:servicios:fetch`
2. `pnpm import:servicios:transform`
3. `ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm db:seed:servicios`
4. `ACADEMIC_SERVICES_DATA_PROVIDER=neon pnpm validate:servicios:seed`

Artefactos obligatorios por corrida:
- `data/utpl-portal-raw.json`
- `data/utpl-portal-fetch-manifest.json`
- `data/utpl-servicios-academicos.json`
- `data/utpl-portal-import-report.json`

## Error Handling

- Error de red o respuesta no JSON: abortar en fetch.
- Contrato inválido de payload: abortar antes de transformar.
- Error de parse específico por fila: registrar warning; continuar si fila sigue mapeable.
- Error en seed: rollback transaccional.
- Error en post-validación: corrida marcada no válida.

## Testing and Verification

Mínimo por corrida:
- validar que endpoint responda array con llaves esperadas
- validar existencia de artefactos generados
- validar seed sin errores de FK/constraints
- validar conteos mínimos y consistencia admin/public con `validate:servicios:seed`

## Decision Log

- Modelo de Neon no se modifica.
- Flujo es manual (no cron).
- Carga es full refresh transaccional.
- Se normaliza todo lo posible.
- Solo se descarta fila con tipo de estudiante vacío/inválido.
