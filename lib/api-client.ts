export function formatTurnoForDisplay(turnoNumber: string): string {
  const number_ = Number.parseInt(turnoNumber, 10);
  if (Number.isNaN(number_)) return turnoNumber;
  return String(number_);
}

function getFechaHora(): string {
  return new Date().toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export async function logAutogestion(
  nombres: string,
  apellidos: string,
  cedula: string,
  email: string,
  servicio: string,
  resultado: string = 'ÉXITO',
  pais: string = 'Ecuador'
): Promise<void> {
  const fechaHora = getFechaHora();
  const nombreCompleto = `${nombres} ${apellidos}`;

  console.log('═══════════════════════════════════════════');
  console.log('  TABLA AUTOGESTIÓN — Registro guardado');
  console.log('═══════════════════════════════════════════');
  console.table([
    {
      Fecha: fechaHora,
      Nombre: nombreCompleto,
      Cédula: cedula,
      Correo: email,
      Servicio: servicio,
      País: pais,
      Resultado: resultado,
    },
  ]);

  try {
    const requestId = crypto.randomUUID();
    await fetch('/api/autogestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        fecha: fechaHora,
        nombres: nombreCompleto,
        cedula,
        email,
        servicio,
        resultado,
        pais,
      }),
    });
  } catch (error) {
    console.error('Error guardando en autogestión:', error);
  }
}

interface AssignTurnoResult {
  success: boolean;
  turnoNumber?: string;
  zoomLink?: string;
  webZoomLink?: string;
  androidZoomIntent?: string;
  error?: string;
}

export async function assignTurnoAtomic(
  nombres: string,
  apellidos: string,
  cedula: string,
  email: string,
  telefono: string,
  servicio: string,
  freeText: string = '',
  modalidad?: string,
  origen: string = 'TURNO',
  pais: string = 'Ecuador',
  prefijoTelefonico: string = '+593'
): Promise<AssignTurnoResult> {
  const nombreCompleto = `${nombres} ${apellidos}`;

  if (process.env.NODE_ENV === 'development') {
    console.log('═══════════════════════════════════════════');
    console.log('  ASIGNANDO TURNO ATÓMICO');
    console.log('═══════════════════════════════════════════');
    console.log(`Nombre: ${nombreCompleto}`);
    console.log(`Cédula: ${cedula}`);
    console.log(`Correo: ${email}`);
    console.log(`Teléfono: ${prefijoTelefonico} ${telefono}`);
    console.log(`País: ${pais}`);
    console.log(`Servicio: ${servicio}`);
    console.log(`Detalle: ${freeText || '-'}`);
    console.log(`Modalidad: ${modalidad ?? '-'}`);
    console.log(`Origen: ${origen}`);
  }

  try {
    const requestId = crypto.randomUUID();
    const response = await fetch('/api/turno?action=asignar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        nombres,
        apellidos,
        cedula,
        email,
        telefono,
        servicio,
        freeText,
        modalidad,
        origen,
        pais,
        prefijoTelefonico,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error asignando turno:', errorData.error);
      return { success: false, error: errorData.error };
    }

    const data = await response.json();

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Turno ${data.turnoNumber} asignado exitosamente`);
    }

    return {
      success: true,
      turnoNumber: data.turnoNumber,
      zoomLink: data.zoomLink,
      webZoomLink: data.webZoomLink,
      androidZoomIntent: data.androidZoomIntent,
    };
  } catch (error) {
    console.error('Error de red asignando turno:', error);
    return { success: false, error: String(error) };
  }
}

interface SubmitFueraHorarioResult {
  success: boolean;
  error?: string;
}

export async function submitFueraHorario(
  nombres: string,
  apellidos: string,
  cedula: string,
  email: string,
  telefono: string,
  servicio: string,
  freeText: string = '',
  modalidad?: string,
  origen: string = 'TURNO',
  horaContactoPreferida: string = '',
  pais: string = 'Ecuador',
  prefijoTelefonico: string = '+593'
): Promise<SubmitFueraHorarioResult> {
  const fechaHora = getFechaHora();
  const nombreCompleto = `${nombres} ${apellidos}`;

  if (process.env.NODE_ENV === 'development') {
    console.log('═══════════════════════════════════════════');
    console.log('  SOLICITUD FUERA DE HORARIO');
    console.log('═══════════════════════════════════════════');
    console.log(`Nombre: ${nombreCompleto}`);
    console.log(`Cédula: ${cedula}`);
    console.log(`Correo: ${email}`);
    console.log(`Teléfono: ${prefijoTelefonico} ${telefono}`);
    console.log(`País: ${pais}`);
    console.log(`Servicio: ${servicio}`);
    console.log(`Hora contacto preferida: ${horaContactoPreferida}`);
  }

  try {
    const requestId = crypto.randomUUID();
    const response = await fetch('/api/fuera-horario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        fecha: fechaHora,
        nombres: nombreCompleto,
        cedula,
        email,
        telefono,
        servicio,
        origen,
        modalidad: modalidad ?? '-',
        freeText,
        horaContactoPreferida,
        pais,
        prefijoTelefonico,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error guardando solicitud fuera de horario:', errorData.error);
      return { success: false, error: errorData.error };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Solicitud fuera de horario guardada exitosamente');
    }

    return { success: true };
  } catch (error) {
    console.error('Error de red guardando solicitud fuera de horario:', error);
    return { success: false, error: String(error) };
  }
}
