# Tareas para agente AI: Sync Microsoft Lists → Campus360 Hub

**Objetivo:** Que el portal Next.js muestre servicios académicos leyendo el catálogo en Neon (`CatalogCache`) sincronizado desde SharePoint vía Power Automate.

**Contexto conocido:**
- Producción: `https://campus360-hub.vercel.app/api/microsoft-lists/sync`
- Cache key en uso: `services-portal-v2`
- Problema actual en prod: `sources.services` vacío → `catalog.services` vacío → portal sin datos
- SharePoint site: `utpl.sharepoint.com/sites/Encuestasdesatisfaccin`
- Listas: `StudentTypes`, `ServiceCategories`, `Services`, `ServiceRequirements` (a veces llegan como `serviceManuals` por error de `listName`)

---

## Fase 0 — Preparación (repo + entorno)

- [ ] **0.1** Clonar/abrir repo `campus360-hub` y confirmar rama de trabajo.
- [ ] **0.2** Verificar que existen cambios locales en:
  - `lib/academic-services/providers/microsoft/catalog-cache.ts` (mapeo `Title` + `field_N`)
  - `app/api/microsoft-lists/sync/route.ts` (`rebuild=true`, warnings si `items` vacío)
- [ ] **0.3** Ejecutar tests: `pnpm vitest run tests/lib/academic-services/providers/microsoft-catalog-cache.test.ts`
- [ ] **0.4** Documentar variables requeridas en Vercel y `.env.local`:

```env
ACADEMIC_SERVICES_DATA_PROVIDER=microsoft
MICROSOFT_PROVIDER_MODE=cache
MICROSOFT_CATALOG_CACHE_KEY=services-portal-v2
MICROSOFT_LISTS_WEBHOOK_SECRET=<opcional, mismo valor en PA y Vercel>
```

- [ ] **0.5** Confirmar en Vercel Dashboard que las 4 variables anteriores están configuradas para Production (y Preview si aplica).

---

## Fase 1 — Corregir flujos Power Automate (7 listas o mínimo 4)

Cada flujo debe seguir el patrón:

`Disparador (ítem creado/modificado)` → `Obtener elementos` (lista completa) → `Seleccionar` (mapear columnas) → `Componer` (opcional: `length`) → `HTTP POST` sync

### 1.1 Flujo `Sync - StudentTypes`

- [ ] Lista SharePoint: **StudentTypes**
- [ ] Mapeo en **Seleccionar**:

| Clave salida | Expresión |
|--------------|-----------|
| `id` | `item()?['ID']` |
| `code` | `item()?['Title']` |
| `name` | `item()?['field_1']` |
| `description` | `item()?['field_2']` |
| `sortOrder` | `item()?['field_3']` |
| `isActive` | `item()?['field_4']` |

- [ ] HTTP body (modo código, sin comillas en expresión de items):

```json
{
  "cacheKey": "services-portal-v2",
  "listName": "studentTypes",
  "items": @{body('Seleccionar')}
}
```

- [ ] `from` en Select: `@body('Obtener_elementos')?['value']` **sin** `\n` al final.

### 1.2 Flujo `Sync - ServiceCategories`

- [ ] Lista: **ServiceCategories**
- [ ] Mapeo Select:

| Clave | Expresión |
|-------|-----------|
| `id` | `item()?['ID']` |
| `code` | `item()?['Title']` |
| `name` | `item()?['field_1']` |
| `description` | `item()?['field_2']` |
| `sortOrder` | `item()?['field_3']` |
| `isActive` | `item()?['field_4']` |
| `studentTypeCode` | `item()?['field_5']` |

- [ ] HTTP: `"listName": "serviceCategories"`

### 1.3 Flujo `Sync - Services` (crítico)

- [ ] Lista: **Services** (no otra lista)
- [ ] Validar en SharePoint que `field_1` guarda el **slug** de categoría (ej. `servicios-practicum`), **no** el nombre visible (`SERVICIOS-PRÁCTICUM`).
- [ ] Mapeo Select (según columnas reales del sitio):

| Clave | Expresión |
|-------|-----------|
| `id` | `item()?['ID']` |
| `code` | `item()?['Title']` |
| `categoryCode` | `item()?['field_1']` |
| `title` | `item()?['field_2']` |
| `description` | `item()?['field_3']` |
| `modality` | `item()?['field_4']` |
| `level` | `item()?['field_5']` |
| `responseTime` | `item()?['field_6']` |
| `cost` | `item()?['field_7']` |
| `status` | `item()?['field_8']` |
| `sortOrder` | `item()?['field_9']` |
| `isActive` | `item()?['field_10']` |
| `programs` | `item()?['field_11']` |
| `note` | `item()?['field_12']` |
| `calendarText` | `item()?['field_13']` |

- [ ] HTTP: `"listName": "services"`
- [ ] Componer antes de HTTP: `length(body('Seleccionar'))` — debe ser > 0 si hay filas en SharePoint.
- [ ] Corregir cuerpo HTTP: usar `@{body('Seleccionar')}` **sin comillas**, no el literal `"@body('Seleccionar')"`.

### 1.4 Flujo `Sync - ServiceRequirements`

- [ ] Lista: **ServiceRequirements**
- [ ] Mapeo Select:

| Clave | Expresión |
|-------|-----------|
| `serviceCode` | `item()?['Title']` |
| `text` | `item()?['field_1']` |
| `sortOrder` | `item()?['field_2']` |

- [ ] HTTP: `"listName": "serviceRequirements"` (**no** `serviceManuals` para requisitos)

### 1.5 HTTP común (todos los flujos)

- [ ] Método: `POST`
- [ ] URI: `https://campus360-hub.vercel.app/api/microsoft-lists/sync`
- [ ] Header: `Content-Type: application/json`
- [ ] Si existe secreto: `x-webhook-secret: <MICROSOFT_LISTS_WEBHOOK_SECRET>`
- [ ] `cacheKey` siempre: `services-portal-v2`
- [ ] Ejecutar cada flujo manualmente (**Probar**) y guardar captura del historial.

---

## Fase 2 — Desplegar código Next.js en Vercel

- [ ] **2.1** Commit/push de cambios en `catalog-cache.ts` y `sync/route.ts` (si aún no están en prod).
- [ ] **2.2** Esperar deploy exitoso en Vercel.
- [ ] **2.3** Tras los POST de PA, llamar rebuild:

```
GET https://campus360-hub.vercel.app/api/microsoft-lists/sync?cacheKey=services-portal-v2&rebuild=true
```

---

## Fase 3 — Verificación API (criterios de éxito)

- [ ] **3.1** GET cache sin rebuild:

```
GET /api/microsoft-lists/sync?cacheKey=services-portal-v2
```

Esperado:
- `sourceLists` incluye: `studentTypes`, `serviceCategories`, `services`, `serviceRequirements` (o datos en `serviceManuals` solo si son manuales reales)
- `serviceCount` > 0
- `catalog.services` array con longitud > 0
- `catalog.categories` longitud > 0
- `catalog.studentTypes` longitud > 0

- [ ] **3.2** POST de prueba manual (curl) con 1 servicio válido:

```bash
curl -X POST "https://campus360-hub.vercel.app/api/microsoft-lists/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "cacheKey": "services-portal-v2",
    "listName": "services",
    "items": [{
      "code": "SRV-TEST",
      "categoryCode": "servicios-practicum",
      "title": "Servicio de prueba",
      "status": "published",
      "isActive": true,
      "sortOrder": 10
    }]
  }'
```

Esperado en respuesta: `"itemCount": 1` y `"catalog": { "services": 1, ... }` (categorías deben existir antes en cache).

- [ ] **3.3** Si POST de PA devuelve `warnings` con `items llegó vacío` → volver a Fase 1.3 (expresión HTTP incorrecta).

---

## Fase 4 — Verificación portal (UI)

- [ ] **4.1** Con `ACADEMIC_SERVICES_DATA_PROVIDER=microsoft` en Vercel, abrir portal público de servicios académicos.
- [ ] **4.2** Confirmar que aparecen tipos de estudiante y categorías.
- [ ] **4.3** Confirmar tarjetas de servicios con `status: published` e `isActive: true`.
- [ ] **4.4** Abrir detalle de un servicio y verificar requisitos/manuales si aplica.
- [ ] **4.5** Panel `/administrativo`: listados no vacíos (servicios, categorías, tipos).

---

## Fase 5 — Limpieza datos SharePoint (opcional pero recomendado)

- [ ] Eliminar filas de prueba en listas (`s`, `n`, `we`, `34`, etc.) creadas durante pruebas.
- [ ] Re-ejecutar los 4 flujos de sync para refrescar cache.

---

## Fase 6 — Entregables del agente

Al terminar, el agente debe reportar:

1. **Estado de cada flujo PA** (nombre, última ejecución, `length(Seleccionar)` en historial).
2. **JSON resumido** del GET sync (`serviceCount`, conteos de `catalog.*`).
3. **Variables Vercel** confirmadas (sin exponer secretos).
4. **URL de commit/deploy** desplegado.
5. **Bloqueos pendientes** (permisos SharePoint, columnas distintas a `field_1`…`field_13`, etc.).

---

## Errores frecuentes (no repetir)

| Síntoma | Causa | Fix |
|---------|--------|-----|
| `sources.services: []` | HTTP envía `items` vacío o literal `@body(...)` | `items: @{body('Seleccionar')}` |
| `catalog` todo vacío con sources llenos | Código viejo en Vercel o falta `services` | Deploy + sync lista Services |
| Servicios no enlazan | `categoryCode` ≠ slug de categoría | `field_1` = `Title` de ServiceCategories |
| Portal vacío con cache OK | `ACADEMIC_SERVICES_DATA_PROVIDER` ≠ `microsoft` | Cambiar env en Vercel |
| 401 en POST | Secreto webhook | Header `x-webhook-secret` o quitar secreto en ambos lados |
| Requisitos no aparecen | `listName: serviceManuals` para requisitos | Usar `serviceRequirements` |

---

## Comandos útiles (repo local)

```bash
pnpm vitest run tests/lib/academic-services/providers/microsoft-catalog-cache.test.ts
pnpm dev
# local sync GET
curl "http://localhost:3000/api/microsoft-lists/sync?cacheKey=services-portal-v2&rebuild=true"
```

---

## Definición de terminado (DoD)

- [ ] Power Automate: 4 flujos ejecutados con éxito (StudentTypes, ServiceCategories, Services, ServiceRequirements).
- [ ] API prod: `serviceCount >= 1` y `catalog.services.length >= 1`.
- [ ] Portal público muestra al menos un servicio publicado.
- [ ] Documentación de mapeo columnas SharePoint ↔ Select actualizada si las columnas reales difieren del estándar `field_1`…`field_13`.
