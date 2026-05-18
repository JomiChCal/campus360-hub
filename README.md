# Campus360 Hub

Plataforma web de atención y gestión de turnos para la **Universidad Técnica Particular de Loja (UTPL)**. Permite a estudiantes, aspirantes y visitantes solicitar servicios académicos mediante un asistente paso a paso: autogestión con guías interactivas, asignación de turnos en horario de atención, o registro de solicitudes fuera de horario para contacto telefónico posterior. Los datos se persisten en **Google Sheets**, donde el equipo de asesores opera en tiempo real.

## Tabla de contenidos

- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Primeros pasos](#primeros-pasos)
- [Arquitectura](#arquitectura)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [API REST](#api-rest)
- [Google Sheets](#google-sheets)
- [Pruebas y calidad de código](#pruebas-y-calidad-de-código)
- [Despliegue](#despliegue)
- [Solución de problemas](#solución-de-problemas)
- [Contribuir](#contribuir)

---

## Características principales

- **Asistente multipaso (wizard)** con 5 etapas: tipo de usuario, datos personales, catálogo de servicios, detalle y resultado.
- **Autogestión con guías**: muchos trámites se resuelven con contenido guiado sin necesidad de asesor; el éxito se registra en la hoja `AUTOGESTION`.
- **Asignación atómica de turnos** en horario laboral, con numeración diaria (`001`, `002`, …) y reintentos ante condiciones de carrera.
- **Modo fuera de horario**: redirección automática cuando el centro está cerrado o en almuerzo; el usuario puede agendar una franja de llamada.
- **Integración con Zoom**: enlaces personalizados por turno para atención virtual.
- **Persistencia en Google Sheets**: tres hojas operativas más una de asesores con validación de datos.
- **Horario de atención Ecuador** (`America/Guayaquil`): lunes a viernes, mañana y tarde, con bloqueo de almuerzo.
- **Rate limiting** en APIs (30 peticiones/minuto por IP) y sanitización anti-inyección en celdas de Sheets.
- **Diseño institucional UTPL** con Tailwind CSS, animaciones Framer Motion y advertencia en dispositivos móviles.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Lenguaje** | TypeScript 5 |
| **Framework** | [Next.js](https://nextjs.org) 16.2 (App Router) |
| **UI** | React 19, Tailwind CSS 4, Framer Motion 12 |
| **Iconos** | Lucide React |
| **Banderas** | react-world-flags |
| **Backend / datos** | Route Handlers de Next.js + Google Sheets API v4 |
| **Autenticación Google** | google-auth-library (JWT con cuenta de servicio) |
| **Videollamadas** | Zoom (enlaces deep link y web) |
| **Gestor de paquetes** | pnpm |
| **Linting / formato** | ESLint 9, Prettier 3 |
| **Despliegue recomendado** | Vercel (plataforma nativa para Next.js) |

---

## Base de datos servicios UTPL portal servicios

### Relaciones (cardinalidad)

- `StudentType` 1:N `ServiceCategory`
- `ServiceCategory` 1:N `Service`
- `Service` 1:N `ServiceRequirement`
- `Service` 1:N `ServiceRequirementTab`
- `ServiceRequirementTab` 1:N `ServiceRequirementItem`
- `Service` 1:N `ServicePeriod`
- `ServicePeriod` 1:N `ServicePeriodModality`
- `Service` 1:N `ServiceGuide`
- `Service` 1:N `ServiceExtraField`

### Ejemplo completo (datos ficticios)

```yaml
tipos_estudiante:
  - nombre: Estudiante Presencial
    categorias:
      - nombre: Matrícula Ordinaria
        servicios:
          - nombre_servicio: Matrícula 1
            modalidad: Presencial
            descripcion: Registro académico para primer bloque.
            requisitos_generales:
              - "Documento de identidad vigente"
              - "Comprobante de pago"
            requisitos_por_modalidad:
              - modalidad: PRESENCIAL
                requisitos:
                  - "Subir formulario firmado"
                    enlace_pdf: "https://ejemplo.utpl.edu.ec/guias/matricula1-presencial.pdf"
              - modalidad: TECNOLOGIAS
                requisitos:
                  - "Subir certificado técnico"
            periodos:
              - nombre_periodo: Periodo A
                ventanas:
                  - modalidad: PRESENCIAL
                    fecha_solicitud: "01/09/2026 - 30/09/2026"
                    fecha_habilitacion_desde: "2026-09-01"
                    fecha_habilitacion_hasta: "2026-09-30"
                    tiempo_respuesta: "5 días hábiles"
            guias:
              - nombre_guia: Guía PDF
                url_guia: "https://ejemplo.utpl.edu.ec/guias/matricula1.pdf"
              - nombre_guia: Video tutorial
                url_guia: "https://video.ejemplo.edu/matricula1"
            campos_adicionales:
              - nombre_campo: Fecha límite
                valor: "2026-09-30"
          - nombre_servicio: Matrícula 2
            modalidad: Presencial
            guias:
              - nombre_guia: Guía rápida
                url_guia: "https://ejemplo.utpl.edu.ec/guias/matricula2.pdf"
      - nombre: Reingreso Presencial
        servicios:
          - nombre_servicio: Reactivación de carrera
            modalidad: Presencial
            requisitos_generales:
              - "Solicitud firmada"
          - nombre_servicio: Cambio de jornada
            modalidad: Presencial

  - nombre: Estudiante Continuo
    categorias:
      - nombre: Matrícula Continua
        servicios:
          - nombre_servicio: Matrícula C1
            modalidad: Distancia
            requisitos_por_modalidad:
              - modalidad: DISTANCIA
                requisitos:
                  - "Completar formulario en línea"
          - nombre_servicio: Matrícula C2
            modalidad: Distancia
      - nombre: Trámites Académicos
        servicios:
          - nombre_servicio: Retiro de asignatura
            modalidad: Distancia
            guias:
              - nombre_guia: Guía retiro PDF
                url_guia: "https://ejemplo.utpl.edu.ec/guias/retiro-asignatura.pdf"
          - nombre_servicio: Certificado de avance
            modalidad: Distancia
            campos_adicionales:
              - nombre_campo: Canal de atención
                valor: "Virtual"
```

Lectura del ejemplo:
- hay 2 tipos de estudiante
- cada tipo tiene 2 categorías
- cada categoría tiene 2 servicios
- cada servicio puede tener o no tener requisitos, tabs, periodos, guías y campos extra

### Tablas y campos

**Tabla `StudentType`**
- `id`: integer, PK, autoincrement
- `code`: string, unique
- `name`: string
- `description`: string, nullable
- `sortOrder`: integer
- `isActive`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime

**Tabla `ServiceCategory`**
- `id`: integer, PK, autoincrement
- `studentTypeId`: integer, FK -> `StudentType.id`
- `slug`: string
- `name`: string
- `description`: string, nullable
- `sortOrder`: integer
- `isActive`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime
- unique (`studentTypeId`, `slug`)

**Tabla `Service`**
- `id`: integer, PK, autoincrement
- `categoryId`: integer, FK -> `ServiceCategory.id`
- `sourceKey`: string, unique
- `sourceRowIndex`: integer, nullable
- `title`: string
- `slug`: string
- `description`: string, nullable
- `modalityLevel`: string, nullable
- `responseTime`: string, nullable
- `cost`: string, nullable
- `note`: string, nullable
- `calendarText`: string, nullable
- `status`: enum (`draft`, `published`, `needs_review`)
- `sortOrder`: integer
- `isActive`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime
- unique (`categoryId`, `slug`)

**Tabla `ServiceRequirement`**
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `text`: string
- `sortOrder`: integer

**Tabla `ServiceRequirementTab`**
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `tabName`: string (dinámico; ej: `DISTANCIA`, `PRESENCIAL`, `TECNOLOGÍAS`)
- `title`: string, nullable
- `sortOrder`: integer

**Tabla `ServiceRequirementItem`**
- `id`: integer, PK, autoincrement
- `tabId`: integer, FK -> `ServiceRequirementTab.id`
- `text`: string
- `pdfUrl`: string, nullable
- `sortOrder`: integer

**Tabla `ServicePeriod`**
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `name`: string
- `sortOrder`: integer

**Tabla `ServicePeriodModality`**
- `id`: integer, PK, autoincrement
- `periodId`: integer, FK -> `ServicePeriod.id`
- `modality`: string (dinámico)
- `requestWindow`: string, nullable
- `responseWindow`: string, nullable
- `enabledFrom`: date, nullable (fecha de habilitación desde)
- `enabledTo`: date, nullable (fecha de habilitación hasta)
- `sortOrder`: integer

**Tabla `ServiceGuide`** (bloque final “Guías” en frontend)
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `label`: string
- `url`: string
- `sortOrder`: integer

**Tabla `ServiceExtraField`** (campos nuevos sin romper frontend)
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `key`: string (ej: `fecha_limite`)
- `label`: string (ej: `Fecha límite`)
- `value`: string
- `sortOrder`: integer
- `isActive`: boolean

---

## Requisitos previos

- **Node.js** 20 o superior
- **pnpm** 9+ (recomendado; el proyecto usa `pnpm-lock.yaml`)
- Una **cuenta de Google Cloud** con la API de Google Sheets habilitada
- Una **hoja de cálculo de Google Sheets** compartida con la cuenta de servicio
- (Opcional) ID de reunión **Zoom** para atención virtual

---

## Primeros pasos

### 1. Clonar el repositorio

```bash
git clone https://github.com/JomiChCal/campus360-hub.git
cd campus360-hub
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (Next.js lo carga automáticamente en desarrollo):

```bash
cp .env.example .env.local   # si existe .env.example; si no, créalo manualmente
```

Variables mínimas para que la app funcione con Google Sheets:

```env
# Google Sheets (obligatorias en servidor)
GOOGLE_SHEETS_ID=tu_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cliente (opcionales)
NEXT_PUBLIC_ZOOM_MEETING_ID=89419717339
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
```

> **Nota sobre `GOOGLE_PRIVATE_KEY`:** en archivos `.env`, los saltos de línea del PEM deben representarse como `\n` literales. El código los interpreta correctamente al autenticarse.

#### Cómo obtener las credenciales de Google

1. En [Google Cloud Console](https://console.cloud.google.com/), crea un proyecto y habilita **Google Sheets API**.
2. Crea una **cuenta de servicio** y descarga el JSON de credenciales.
3. Copia `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `private_key` → `GOOGLE_PRIVATE_KEY`.
4. Crea una hoja de cálculo en Google Sheets y compártela con el email de la cuenta de servicio (permiso **Editor**).
5. El ID de la hoja está en la URL: `https://docs.google.com/spreadsheets/d/{GOOGLE_SHEETS_ID}/edit`.

La hoja debe contener (o el script las creará) las pestañas: `TURNOS_ASESORIA`, `AUTOGESTION`, `FUERA_HORARIO` y `ASESORES`.

### 4. Inicializar Google Sheets

Ejecuta el script de configuración para crear encabezados, formato condicional y validación de asesores:

```bash
pnpm setup-sheets
```

Este comando usa `--env-file=.env` y requiere que las variables de Google estén definidas (puedes duplicar `.env.local` a `.env` o exportarlas en el shell).

Opcionalmente, carga datos de prueba:

```bash
pnpm seed-data
```

### 5. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige según el horario:

- **Horario abierto** → `/tipo` (inicio del wizard)
- **Almuerzo o fuera de horario** → `/fuera-horario`

Para probar el wizard sin depender del reloj, define en `.env.local`:

```env
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
```

Valores válidos: `open`, `lunch`, `after-hours`.

---

## Arquitectura

### Estructura de directorios

```
campus360-hub/
├── app/                          # App Router de Next.js
│   ├── layout.tsx                # Layout raíz (fuente Inter, fondo UTPL)
│   ├── page.tsx                  # Redirección según horario de atención
│   ├── globals.css               # Estilos globales + Tailwind
│   ├── fuera-horario/            # Pantalla fuera de horario + agendar llamada
│   ├── (form)/                   # Grupo de rutas del wizard
│   │   ├── layout.tsx            # Shell del formulario (header, pasos, animaciones)
│   │   ├── tipo/                 # Paso 1: estudiante / aspirante
│   │   ├── datos/                # Paso 2: datos personales
│   │   ├── servicio/             # Paso 3: catálogo de servicios
│   │   ├── detalle/              # Paso 4: texto libre / confirmación
│   │   └── resultado/            # Paso 5: turno, guía completada o fuera de horario
│   └── api/                      # Route Handlers (backend)
│       ├── turno/route.ts        # GET next, POST log, PUT asignar
│       ├── autogestion/route.ts  # POST registro autogestión
│       └── fuera-horario/route.ts# POST solicitud fuera de horario
├── components/                   # Componentes React reutilizables
│   ├── wizard/                   # Pasos del asistente
│   ├── ui/                       # Inputs, selects, banderas
│   ├── ResultCard.tsx            # Tarjeta de resultado (turno / Zoom)
│   └── ...
├── contexts/
│   └── FormContext.tsx           # Estado global del wizard + envío
├── hooks/
│   ├── use-form-wizard.ts        # Reducer, validación, sessionStorage
│   └── use-turn-assignment.ts    # Llamadas a APIs de turno
├── lib/
│   ├── sheets-auth.ts            # JWT Google + utilidades de hojas
│   ├── business-hours.ts         # Lógica horario Ecuador
│   ├── simulation.ts             # Cliente fetch hacia APIs
│   ├── api-utilities.ts          # Rate limit, validación, sanitización
│   ├── validation.ts             # Validación por paso del formulario
│   └── zoom.ts                   # Generación de enlaces Zoom
├── data/
│   ├── services.ts               # Catálogo de servicios UTPL
│   ├── guides.ts                 # Contenido de guías de autogestión
│   └── countries.ts              # Países y prefijos telefónicos
├── types/
│   └── form.ts                   # Tipos TypeScript del dominio
├── scripts/
│   ├── setup-sheets.ts           # Bootstrap de hojas Google
│   └── seed-data.ts              # Datos de ejemplo
├── middleware.ts                 # Bloqueo de rutas del wizard fuera de horario
└── tailwind.config.ts            # Paleta de colores UTPL
```

### Flujo del usuario

```mermaid
flowchart TD
    A["/ (inicio)"] --> B{¿Horario abierto?}
    B -->|Sí| C["/tipo"]
    B -->|No| D["/fuera-horario"]
    D -->|Agendar llamada| E["/tipo?mode=fuera-horario&time=..."]
    C --> F["/datos"]
    F --> G["/servicio"]
    G --> H{¿Servicio GUIA o TURNO?}
    H -->|GUIA| I["Modal guía"]
    I -->|Resuelto| J["/resultado (completed)"]
    I -->|Necesita asesor| K["Asignar turno / fuera horario"]
    H -->|TURNO| L["/detalle"]
    L --> K
    K --> M["/resultado"]
    M --> N{Estado}
    N -->|turno-assigned| O["Número de turno + Zoom"]
    N -->|fuera-horario| P["Confirmación llamada"]
    N -->|completed| Q["Autogestión exitosa"]
```

### Ciclo de vida de una petición

1. El usuario interactúa con un componente del wizard (`components/wizard/*`).
2. El estado vive en `FormContext` → `useFormWizard`, persistido en `sessionStorage` (`campus360-form-data`).
3. Al enviar, `useTurnAssignment` llama funciones de `lib/simulation.ts`.
4. `simulation.ts` hace `fetch` a los Route Handlers en `/app/api/*`.
5. El handler autentica con JWT (`lib/sheets-auth.ts`) y escribe en Google Sheets.
6. La respuesta actualiza el estado (`turnoNumber`, `flowState`) y se muestra en `/resultado`.

### Horario de atención

Zona horaria: **America/Guayaquil (UTC-5)**.

| Estado | Condición |
|--------|-----------|
| `open` | Lunes–viernes, 08:00–12:45 o 15:00–17:45 |
| `lunch` | Lunes–viernes, 12:45–15:00 |
| `after-hours` | Fines de semana o fuera de franjas anteriores |

El `middleware.ts` redirige rutas del wizard (`/tipo`, `/datos`, etc.) a `/fuera-horario` si no hay atención, salvo que la URL incluya `?mode=fuera-horario` (flujo de llamada agendada).

### Componentes clave

| Componente / módulo | Responsabilidad |
|---------------------|-----------------|
| `FormContext` | Orquesta pasos, envío, modal de guía y navegación |
| `use-form-wizard` | Reducer de estado, validación por paso, `sessionStorage` |
| `data/services.ts` | Catálogo: cada servicio es `GUIA` (autogestión) o `TURNO` (asesor) |
| `data/guides.ts` | Pasos de guías mostrados en `GuideModal` |
| `lib/sheets-auth.ts` | Auth JWT, headers, validación de columna Asesor, estilos |
| `middleware.ts` | Protección de horario en rutas del formulario |

### Esquema de datos (Google Sheets)

#### `TURNOS_ASESORIA`

| Columna | Descripción |
|---------|-------------|
| Turno | Número secuencial del día (`001`, `002`, …) |
| Fecha | Fecha y hora de registro |
| Nombres | Nombre completo |
| Cédula | 10 dígitos |
| Correo | Email |
| País | País de origen |
| Prefijo | Código telefónico |
| Teléfono | 10 dígitos |
| Modalidad | En línea / Distancia / Presencial |
| Servicio | Categoría o trámite |
| Detalle | Texto libre del usuario |
| Origen | `TURNO`, `GUIA`, etc. |
| Asesor | Dropdown validado contra `ASESORES` |

#### `AUTOGESTION`

Registra casos resueltos sin asesor: fecha, datos de contacto, servicio, resultado (`ÉXITO`, `REQUIERE TURNO`, etc.).

#### `FUERA_HORARIO`

Solicitudes fuera de horario con **hora de contacto preferida**; la API reordena filas por día laboral siguiente y franja horaria.

#### `ASESORES`

Lista de nombres para validación de datos en las demás hojas (creada automáticamente por `setup-sheets` si no existe).

---

## Variables de entorno

### Obligatorias (servidor)

| Variable | Descripción | Cómo obtenerla |
|----------|-------------|----------------|
| `GOOGLE_SHEETS_ID` | ID del spreadsheet | URL de Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email de la cuenta de servicio | JSON de credenciales GCP |
| `GOOGLE_PRIVATE_KEY` | Clave privada PEM | Campo `private_key` del JSON (con `\n`) |

Si faltan, `lib/sheets-auth.ts` lanza error al importar el módulo y las APIs fallarán.

### Opcionales (cliente / desarrollo)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_ZOOM_MEETING_ID` | ID de reunión Zoom | `89419717339` |
| `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` | Simula horario: `open`, `lunch`, `after-hours` | *(usa reloj real)* |
| `NODE_ENV` | Entorno Node (`development` activa logs detallados) | `development` en `pnpm dev` |

### Ejemplo `.env.local` para desarrollo

```env
GOOGLE_SHEETS_ID=1abc...xyz
GOOGLE_SERVICE_ACCOUNT_EMAIL=campus360@mi-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
NEXT_PUBLIC_ZOOM_MEETING_ID=89419717339
```

### Ejemplo producción (Vercel)

Configura las mismas variables en el panel de **Settings → Environment Variables**. Las variables `GOOGLE_*` deben estar disponibles solo en **Production** y **Preview** (no son `NEXT_PUBLIC_`, no se exponen al navegador).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo Next.js (Turbopack) en `localhost:3000` |
| `pnpm build` | Compilación de producción |
| `pnpm start` | Servidor de producción (tras `build`) |
| `pnpm lint` | ESLint sobre el proyecto |
| `pnpm lint:fix` | ESLint con correcciones automáticas |
| `pnpm format` | Prettier: formatear todos los archivos |
| `pnpm format:check` | Prettier: verificar formato sin escribir |
| `pnpm lint:all` | ESLint + comprobación Prettier |
| `pnpm setup-sheets` | Inicializar hojas, encabezados y formato en Google Sheets |
| `pnpm seed-data` | Insertar filas de ejemplo en las hojas |

---

## API REST

Todas las rutas aplican **rate limiting** (30 req/min por IP) y validación de campos.

### `GET /api/turno?action=next`

Devuelve el siguiente número de turno del día.

**Respuesta exitosa:**

```json
{ "nextNumber": 4 }
```

### `PUT /api/turno?action=asignar`

Asigna un turno de forma atómica (hasta 3 reintentos ante condiciones de carrera).

**Cuerpo (JSON):**

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "cedula": "1234567890",
  "email": "juan@ejemplo.com",
  "telefono": "0991234567",
  "servicio": "Matrícula",
  "freeText": "",
  "modalidad": "Presencial",
  "origen": "TURNO",
  "pais": "Ecuador",
  "prefijoTelefonico": "+593"
}
```

**Respuesta exitosa:**

```json
{ "success": true, "turnoNumber": "004", "message": "Turno asignado" }
```

### `POST /api/turno`

Registra un turno ya numerado (uso interno / legacy).

### `POST /api/autogestion`

Registra autogestión exitosa o derivación.

```json
{
  "fecha": "16/05/2026, 10:30:00",
  "nombres": "María López",
  "cedula": "1234567890",
  "email": "maria@ejemplo.com",
  "servicio": "Horarios de clases",
  "resultado": "ÉXITO",
  "pais": "Ecuador"
}
```

### `POST /api/fuera-horario`

Registra solicitud fuera de horario y ordena la hoja por hora de contacto.

```json
{
  "horaContactoPreferida": "09:00 - 10:00",
  "fecha": "16/05/2026, 18:15:00",
  "nombres": "Carlos Ruiz",
  "cedula": "1234567890",
  "email": "carlos@ejemplo.com",
  "telefono": "0991234567",
  "servicio": "Información General",
  "origen": "TURNO",
  "pais": "Ecuador",
  "prefijoTelefonico": "+593"
}
```

**Códigos de error comunes:**

| Código | Significado |
|--------|-------------|
| `400` | Validación fallida (cédula, teléfono, campos requeridos) |
| `429` | Rate limit excedido |
| `409` | Conflicto al asignar turno (reintentar) |
| `500` | Error de Google Sheets o configuración |

---

## Google Sheets

### Configuración inicial

```bash
# Asegúrate de tener .env con las credenciales Google
pnpm setup-sheets
```

El script:

1. Crea o verifica la hoja `ASESORES` con lista de asesores de ejemplo.
2. Configura encabezados en `TURNOS_ASESORIA`, `AUTOGESTION` y `FUERA_HORARIO`.
3. Aplica formato (cabecera azul UTPL, filas alternas condicionales).
4. Configura validación de datos en la columna **Asesor**.

### Operación diaria

- Los asesores asignan su nombre en la columna **Asesor** desde el dropdown de Sheets.
- Al cambiar de día, la API inserta un **separador** con el conteo de atenciones del día anterior.
- Las solicitudes fuera de horario se **reordenan** por día laboral siguiente y franja horaria.

### Datos de prueba

```bash
pnpm seed-data
```

Inserta filas de ejemplo en las tres hojas operativas (útil para demos y QA).

---

## Pruebas y calidad de código

El proyecto no incluye aún una suite de tests automatizados (Jest/Vitest/Playwright). La calidad se mantiene con:

```bash
# Lint
pnpm lint

# Lint con autofix
pnpm lint:fix

# Formato
pnpm format:check
pnpm format

# Ambos
pnpm lint:all
```

### Verificación manual recomendada

1. Flujo completo **estudiante** con servicio `GUIA` → modal → “Resuelto” → resultado completado.
2. Flujo **estudiante** con servicio `TURNO` → asignación de número → enlace Zoom visible.
3. Flujo **aspirante** (menos pasos, sin catálogo de servicios).
4. Acceder fuera de horario sin `mode=fuera-horario` → redirección a `/fuera-horario`.
5. Agendar llamada → wizard con `?mode=fuera-horario&time=09:00+-+10:00`.
6. Verificar filas nuevas en Google Sheets tras cada flujo.

---

## Despliegue

No hay `Dockerfile`, `render.yaml` ni workflows de CI en el repositorio. La opción más directa para Next.js es **Vercel**.

### Vercel (recomendado)

1. Importa el repositorio en [vercel.com](https://vercel.com).
2. Framework preset: **Next.js** (detectado automáticamente).
3. Build command: `pnpm build` (o deja el predeterminado).
4. Install command: `pnpm install`.
5. Añade las variables de entorno `GOOGLE_*` y opcionalmente `NEXT_PUBLIC_*`.
6. Despliega.

Tras el primer despliegue, ejecuta localmente (una vez):

```bash
pnpm setup-sheets
```

### Build local de producción

```bash
pnpm build
pnpm start
```

La app escuchará en `http://localhost:3000` en modo producción.

### Docker (alternativa manual)

Si prefieres contenedores, un `Dockerfile` típico para Next.js 16 sería:

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> Requiere habilitar `output: 'standalone'` en `next.config.ts` para el ejemplo anterior.

Pasa las variables `GOOGLE_*` en tiempo de ejecución (`docker run -e ...`).

### VPS manual

```bash
git pull origin main
pnpm install --frozen-lockfile
pnpm build
# Con PM2 o systemd:
pnpm start
# o: node .next/standalone/server.js
```

---

## Solución de problemas

### Error: `Missing required environment variables: GOOGLE_SHEETS_ID, ...`

**Causa:** Variables de Google no definidas o archivo `.env.local` no cargado.

**Solución:**

1. Verifica `.env.local` en la raíz del proyecto.
2. Reinicia `pnpm dev` tras cambiar variables.
3. Para scripts (`setup-sheets`), usa `--env-file=.env` o exporta variables en el shell.

### Error 403 / 404 al escribir en Google Sheets

**Causa:** La cuenta de servicio no tiene acceso al spreadsheet.

**Solución:**

1. Abre la hoja en Google Sheets → **Compartir**.
2. Añade el email de `GOOGLE_SERVICE_ACCOUNT_EMAIL` con permiso **Editor**.
3. Confirma que `GOOGLE_SHEETS_ID` coincide con la URL correcta.

### Error: `Sheet "TURNOS_ASESORIA" not found`

**Causa:** Pestañas con nombres distintos a los esperados.

**Solución:** Ejecuta `pnpm setup-sheets` o renombra las pestañas exactamente a: `TURNOS_ASESORIA`, `AUTOGESTION`, `FUERA_HORARIO`, `ASESORES`.

### El wizard redirige siempre a `/fuera-horario`

**Causa:** Fuera del horario de atención en Ecuador o `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` no está en `open`.

**Solución:**

```env
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
```

Reinicia el servidor de desarrollo.

### Error 409 al asignar turno

**Causa:** Condición de carrera (dos usuarios simultáneos); la API reintenta hasta 3 veces.

**Solución:** El usuario puede reintentar el envío. En producción con alto tráfico, considera una cola o bloqueo distribuido.

### Error 429 Too many requests

**Causa:** Más de 30 peticiones por minuto desde la misma IP.

**Solución:** Espera un minuto o ajusta `RATE_LIMIT_MAX_REQUESTS` en `lib/api-utilities.ts` si el límite es demasiado estricto para tu entorno.

### `GOOGLE_PRIVATE_KEY` inválida

**Causa:** Saltos de línea mal escapados en `.env`.

**Solución:** Usa comillas dobles y `\n` entre líneas del PEM, o almacena la clave en una sola línea como en el JSON de la cuenta de servicio.

### Enlaces Zoom no funcionan

**Causa:** ID de reunión incorrecto o app Zoom no instalada (deep link `zoommtg://`).

**Solución:**

1. Verifica `NEXT_PUBLIC_ZOOM_MEETING_ID`.
2. Usa el enlace web alternativo generado por `generateWebZoomLink` en `ResultCard`.

### Problemas con `pnpm install`

**Causa:** Dependencias nativas (`sharp`).

**Solución:** El proyecto declara `trustedDependencies` para `sharp`. Usa Node 20+ y vuelve a ejecutar `pnpm install`.

---

## Contribuir

1. Haz fork del repositorio.
2. Crea una rama: `git checkout -b feature/mi-mejora`.
3. Asegúrate de que `pnpm lint:all` pase.
4. Abre un Pull Request describiendo el cambio y cómo probarlo.

---

## Licencia

Proyecto privado de la UTPL. Consulta con el equipo propietario antes de redistribuir o usar fuera del contexto institucional.

---

**Universidad Técnica Particular de Loja** — *decide ser +*
