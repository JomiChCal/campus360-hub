# UTPL Services Neon Migration Design

**Problem**

`Campus360 Hub` ya tiene portal estudiante (`/servicios`) y panel administrativo (`/administrativo`), pero hoy el catálogo UTPL sigue arrastrando supuestos del endpoint externo y de su HTML. Necesitamos tomar snapshot del endpoint `https://portales.utpl.edu.ec/servicios-academicos`, normalizarlo a Neon/Postgres y convertirlo en fuente de verdad editable desde el panel admin.

**Goal**

Migrar catálogo UTPL a Neon de forma que:
- estudiantes lean solo desde base de datos propia
- personal administrativo pueda crear, editar, ocultar y ordenar tipos, categorías y servicios
- se preserven casos complejos como requisitos por modalidad, tabs dinámicos, periodos y manuales
- no exista dependencia runtime del HTML UTPL ni del endpoint externo

## Decisions

### 1. Jerarquía de negocio

La jerarquía aprobada es:
- `student_type`
- `student_type_category`
- `service`

Consecuencias:
- una categoría pertenece directamente a un tipo de estudiante
- un servicio pertenece directamente a una categoría de ese tipo
- mismo nombre visible en otro tipo de estudiante no implica reutilización
- mismo nombre visible en otra categoría no implica reutilización

Ejemplo: `SERVICIOS-MATRÍCULA` en `CONTINUO` y `SERVICIOS-MATRÍCULA` en `NUEVO` son registros distintos.

### 2. Fuente de verdad runtime

La aplicación no debe depender de HTML crudo UTPL para render estudiante ni para edición admin.

Se acepta este flujo:
- guardar snapshot bruto del endpoint en archivos de auditoría local
- transformar a estructura normalizada
- sembrar Neon con estructura normalizada
- corregir manualmente desde admin cualquier servicio incompleto o imperfecto

No se acepta este flujo:
- usar `raw_html` como fallback de render en producción
- seguir consumiendo endpoint externo en runtime

### 3. Limpieza de filas estructurales

Durante importación se deben eliminar filas visuales que no representan servicios reales:
- `disableblock`
- encabezados visuales como `🟡 SERVICIOS DE VALIDACION`
- otros bloques sin descripción útil que solo sirven para maquetación del portal original

Regla de clasificación aprobada:
- emoji en título no basta para descartar
- si la fila tiene contenido real de servicio, se conserva aunque el título tenga emoji
- si la fila es encabezado visual y no tiene descripción útil, se descarta

### 4. Casos complejos

El modelo debe soportar:
- descripción general
- modalidad y nivel
- tiempo de respuesta
- costo
- nota
- calendario / periodos
- requisitos generales
- requisitos por modalidad con tabs dinámicos
- manuales y enlaces

Los tabs no van en columnas fijas. Deben ser registros dinámicos para soportar `DISTANCIA`, `PRESENCIAL`, `TECNOLOGÍAS` y modalidades futuras.

### 5. Tolerancia demo

El objetivo de la primera migración no es perfección absoluta del parser. El objetivo es:
- capturar snapshot completo del endpoint
- pasar la mayor cantidad posible de servicios reales a Neon
- dejar panel admin listo para corrección manual

Si un servicio entra incompleto en la primera importación, se corrige manualmente. Esto es aceptable para la demo.

## Data Model

### `StudentType`
- `id`
- `code`
- `name`
- `description`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

### `ServiceCategory`
- `id`
- `studentTypeId`
- `name`
- `slug`
- `description`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

### `Service`
- `id`
- `categoryId`
- `sourceKey`
- `sourceRowIndex`
- `title`
- `slug`
- `description`
- `modalityLevel`
- `responseTime`
- `cost`
- `note`
- `calendarText`
- `status` (`draft | published | needs_review`)
- `isActive`
- `sortOrder`
- `createdAt`
- `updatedAt`

### `ServiceRequirement`
Requisitos generales del servicio.
- `id`
- `serviceId`
- `text`
- `sortOrder`

### `ServiceRequirementTab`
Grupo/tab dinámico, normalmente por modalidad.
- `id`
- `serviceId`
- `tabName`
- `title`
- `sortOrder`

### `ServiceRequirementItem`
Item dentro de tab dinámico.
- `id`
- `tabId`
- `text`
- `pdfUrl`
- `sortOrder`

### `ServicePeriod`
Periodo o calendario principal.
- `id`
- `serviceId`
- `name`
- `sortOrder`

### `ServicePeriodModality`
Ventanas por modalidad dentro de un periodo.
- `id`
- `periodId`
- `modality`
- `requestWindow`
- `responseWindow`
- `sortOrder`

### `ServiceManual`
Manual o enlace asociado al servicio.
- `id`
- `serviceId`
- `label`
- `url`
- `sortOrder`

### `ImportBatch`
Auditoría de cada importación.
- `id`
- `source`
- `fetchedAt`
- `recordCount`
- `payloadSha256`
- `snapshotPath`
- `manifestPath`
- `createdAt`

## Import Rules

### Snapshot
Antes de normalizar se deben persistir:
- `data/utpl-portal-raw.json`
- `data/utpl-portal-fetch-manifest.json`
- reporte de importación normalizada

### Expansión por tipo de estudiante
Si una fila trae varios tipos (`NUEVO, CONTINUO`), se expande en servicios separados, uno por tipo de estudiante, cada uno en su propia categoría.

### Filas sin tipo de estudiante
El endpoint actual contiene filas sin `field_tipo_estudiante`. Esas filas no deben publicarse de forma automática.

Decisión aprobada:
- se importan como `status = needs_review`
- quedan disponibles para corrección admin
- no se muestran a estudiantes

### HTML parsing
El parser debe extraer datos estructurados desde `field_descripcion_servicio`:
- descripción
- modalidad y nivel
- requisitos generales
- tabs por modalidad
- items con PDF
- periodos
- solicitud/respuesta
- manuales
- costo
- tiempo de respuesta
- nota

Si algún bloque no se logra estructurar perfectamente, el dato se deja lo mejor posible en columnas/tablas normalizadas y luego se corrige manualmente desde admin.

## Student Experience

La vista estudiante (`/servicios`) debe leer solo desde Neon y mostrar:
- tipos activos
- categorías activas del tipo seleccionado
- servicios `published` y `isActive = true`
- detalle con requisitos, tabs, periodos y manuales

No debe renderizar:
- `disableblock`
- encabezados visuales UTPL
- servicios `draft`
- servicios `needs_review`
- servicios inactivos

## Admin Experience

La vista admin (`/administrativo`) debe permitir:
- crear, editar y desactivar tipos de estudiante
- crear, editar y desactivar categorías por tipo
- crear, editar, duplicar, ocultar y borrar servicios
- editar requisitos generales
- editar tabs dinámicos y sus items
- editar periodos y modalidades
- editar manuales/enlaces
- cambiar `status`

Estados mínimos del servicio:
- `draft`
- `published`
- `needs_review`

## Risks

### 1. Parser imperfecto
Algunos servicios complejos, especialmente en `SERVICIOS-RECONOCIMIENTO DE ESTUDIOS`, incluyen tabs HTML custom y links anidados. La primera pasada puede dejar campos incompletos.

Mitigación:
- snapshot bruto preservado
- import report con filas problemáticas
- corrección manual desde admin

### 2. Heurística de filas estructurales
La clasificación actual basada en emoji es insuficiente porque existen servicios reales con emoji en el título.

Mitigación:
- clasificar por combinación de título y contenido útil, no por emoji aislado
- pruebas unitarias con casos reales del dataset

### 3. Datos faltantes en origen
Hay filas sin tipo de estudiante y fragmentos HTML inconsistentes.

Mitigación:
- `needs_review`
- no publicación automática a estudiantes

## Success Criteria

El trabajo se considera correcto cuando:
- snapshot del endpoint se guarda localmente
- Neon contiene solo categorías y servicios reales, sin filas estructurales
- `/servicios` se alimenta únicamente de Neon
- `/administrativo` permite editar el catálogo normalizado completo
- casos dudosos quedan marcados `needs_review`
- estudiantes nunca ven servicios no publicados o inactivos

## Manual Review Queue
- Filas con `field_tipo_estudiante` vacío se importan en `needs_review`.
- Tabs de requisitos con estructura parcial deben corregirse manualmente en `/administrativo`.
- Todo servicio en `needs_review` requiere validación manual antes de cambiar a `published`.
