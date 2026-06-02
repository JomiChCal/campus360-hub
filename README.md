# Campus360 Hub

![Banner](public/images/banner.png)

## Propósito

Plataforma de asesoría virtual para la Universidad Técnica Particular de Loja (UTPL). Permite a estudiantes y aspirantes acceder a servicios académicos, administrativos y de admisión mediante un asistente guiado que asigna turnos de atención personalizada via Zoom.

## Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Animaciones**: Framer Motion
- **UI Components**: shadcn/ui
- **Base de datos**: Neon PostgreSQL (temporalmente fuera de servicio)
- **Autenticación**: NextAuth.js
- **Integraciones**: Microsoft Power Automate (turnos, notificaciones)

## Quick Start

```bash
pnpm install
pnpm dev
```

> **Nota**: La base de datos está temporalmente deshabilitada. El proyecto requiere configuración de `DATABASE_URL` en `.env.local` para funcionar completamente.

## Variables de Entorno

```env
# Base de datos (requerido para producción)
DATABASE_URL=

# Power Automate webhooks
PA_CREAR_TURNO_URL=
PA_CREAR_AUTOGESTION_URL=
PA_CREAR_FUERA_HORARIO_URL=

# Zoom
NEXT_PUBLIC_ZOOM_MEETING_ID=

# NextAuth
AUTH_SECRET=
AUTH_URL=http://localhost:3000
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/turno` | Asigna turno de atención |
| `POST` | `/api/autogestion` | Registra resolución self-service |
| `POST` | `/api/fuera-horario` | Solicita llamada fuera de horario |
| `GET` | `/api/schedule-config` | Configuración de horarios |

## Flujo Principal

1. Usuario selecciona tipo: **Soy UTPL** o **Quiero ser UTPL +**
2. Completa datos personales
3. Selecciona servicio o describe requerimiento
4. Recibe turno con enlace Zoom
5. Asesoría virtual personalizada

## Estructura del Proyecto

```
app/
├── (form)/           # Wizard de asesoría (tipo → datos → servicio → resultado)
├── api/              # Endpoints
├── servicios/        # Portal de servicios
└── turnos-dinamicos/ # Turneros dinámicos

components/
├── wizard/          # Componentes del wizard
└── ui/              # shadcn/ui components

lib/
├── power-automate.ts
└── validation.ts

prisma/
└── schema.prisma     # Modelos de datos
```

## Licencia

Privado - Universidad Técnica Particular de Loja