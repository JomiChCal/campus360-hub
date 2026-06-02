# Campus360 Hub — Plan de Migración a Microsoft 100%

## Resumen
- **De:** Neon PostgreSQL + Google Sheets
- **A:** SharePoint Lists + Power Automate
- **Tu responsabilidad:** SharePoint, Power Automate, Página Asesores
- **Otro equipo:** Catálogo de servicios (Power App)

---

## FASE 1: SharePoint Lists

### Listas a crear en tu SharePoint Site:

| # | Lista | Propsito | Columnas |
|---|---|---|---|
| 1 | `CONTADOR_TURNOS` | Control atomicidad turnos | Fecha (texto único), UltimoNumero (número) |
| 2 | `TURNOS_ASESORIA` | Turnos asignados | Turno, Fecha, Nombres, Cédula, Correo, País, Prefijo, Teléfono, Modalidad (choice), Servicio, Detalle, Origen (choice), Asesor, Derivado (choice) |
| 3 | `AUTOGESTION` | Resolución self-service | Fecha, Nombres, Cédula, Correo, Teléfono, Servicio, Detalle, País, Prefijo, Modalidad, Resultado (choice), Asesor |
| 4 | `FUERA_HORARIO` | Solicitudes fuera de horario | HoraContacto, Fecha, Nombres, Cédula, Correo, País, Prefijo, Teléfono, Modalidad, Servicio, Detalle, Origen (choice), Asesor |
| 5 | `ASESORES` | Catálogo de asesores | Nombre (texto), Tipo (choice: UTPL/Externo), Estado (choice: Activo/Inactivo) |

### Detalles técnicos:

**CONTADOR_TURNOS:**
- Fecha: texto, único, formato `dd/mm/yyyy`
- UltimoNumero: número, default 0
- Esta lista evita que se dupliquen turnos

**TURNOS_ASESORIA:**
- Modalidad options: En línea, Presencial, Distancia
- Origen options: TURNO, GUIA
- Derivado options: NORMAL, DERIVADO
- País default: Ecuador
- Prefijo default: +593

---

## FASE 2: Power Automate Flows

### Flows a modificar:

| # | Flow | Action |
|---|---|---|
| 1 | `campus360-crear-turno` | Modificar para usar CONTADOR_TURNOS + escribir a SharePoint List |
| 2 | `campus360-obtener-turnos-hoy` | Modificar para leer de SharePoint List |
| 3 | `campus360-crear-autogestion` | Modificar para escribir a AUTOGESTION List |
| 4 | `campus360-crear-fuera-horario` | Modificar para escribir a FUERA_HORARIO List |

### Lógica crear-turno (CRÍTICA):

```
1. Get items → CONTADOR_TURNOS (filter: Fecha eq 'hoy')
2. Si no existe → Create item (Fecha=hoy, UltimoNumero=0)
3. Compose → UltimoNumero + 1
4. Update item → CONTADOR_TURNOS (actualiza UltimoNumero)
5. Create item → TURNOS_ASESORIA (Turno = compose en formato 001)
6. Response 200 → { "success": true }
```

---

## FASE 3: Página SharePoint para Asesores

### Pasos:

1. Crear página: `+ Nuevo` → `Página`
2. Agregar Web Part: buscar "Lista de SharePoint" → seleccionar `TURNOS_ASESORIA`
3. Crear vista filtrada: `Asesor = [Yo]` (o dropdown para filtrar)
4. Compartir con asesores: Share → agregar emails → permisos Can view

---

## FASE 4: Eliminar código antiguo

### Archivos a eliminar:

```
prisma/
  ├── schema.prisma
  └── migrations/
lib/db.ts
app/api/schedule-config/
apps-script/
```

### .env a limpiar:

```
# ELIMINAR:
DATABASE_URL=postgresql://...
ACADEMIC_SERVICES_DATA_PROVIDER=neon

# MANTENER:
PA_CREAR_TURNO_URL=...
PA_CREAR_AUTOGESTION_URL=...
PA_CREAR_FUERA_HORARIO_URL=...
PA_OBTENER_TURNOS_HOY_URL=...
NEXT_PUBLIC_ZOOM_MEETING_ID=...
```

---

## Checklist de Verificación

- [x] 5 listas creadas en SharePoint
- [x] CONTADOR_TURNOS con columna Fecha única
- [x] 4 flows creados en Power Automate
- [x] Flow crear-turno con contador atómico
- [x] Página de asesores creada en SharePoint
- [x] Permisos de SharePoint configurados

---

## URLs de los Flows (Configuradas en .env)

### campus360-crear-turno
```
https://default6eeb49aa436d43e6becdbbdf79e507.7d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ed633f13f78844bdb1846187bc4b1aa2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=QGjTib2tN5AWOrGapJvwnECUNUo-F1n4oSBd1yqucKE
```

### campus360-obtener-turnos-hoy
```
https://default6eeb49aa436d43e6becdbbdf79e507.7d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/76492f2dccf24c9d9dfea563a591035b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=4eXK1uJevwSsWli9OT4ZWYiIKoW2EKC_QiFwd87q9MQ
```

### campus360-crear-autogestion
```
https://default6eeb49aa436d43e6becdbbdf79e507.7d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c6caefd3cd25437aaee5eca864f74900/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pyuC_Ph3LuP0ivbAy98ElYwr8oRH-DHRn7k-26aTIrY
```

### campus360-crear-fuera-horario
```
https://default6eeb49aa436d43e6becdbbdf79e507.7d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6c5e06bd5f99481f8131638bea439f53/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2yL7DqqO1cT1Fx3hR_4fLIs_5vKIlN3UIWuW6tZiMmY
```

---

## Cambios realizados en el proyecto

1. ✅ Actualizado `.env` con las 4 URLs de Power Automate
2. ✅ Eliminada carpeta `apps-script/` (reemplazada por SharePoint)
3. ✅ Actualizado log de error en `lib/simulation.ts` ("Google Sheet" → "autogestión")
4. ✅ Neon/Prisma se mantiene para catálogo de servicios (otro equipo lo migrará)

---

## Contacto

Ante dudas:
- Power Automate: revisar `scripts/GUIDE-POWER-AUTOMATE.md`
- SharePoint: docs.microsoft.com/sharepoint
- Logs: revisar ejecución de flows en Power Automate

---

*Creado: Mayo 2026*
*Versión: 1.0*