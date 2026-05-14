import { google } from 'googleapis';

import { getAuth, SHEETS_ID } from '@/lib/sheets-auth';

interface TurnoRow {
  turno: string;
  fecha: string;
  nombres: string;
  cedula: string;
  correo: string;
  telefono: string;
  pais: string;
  prefijo: string;
  modalidad: string;
  servicio: string;
  detalle: string;
  origen: string;
  asesor: string;
}

interface AutogestionRow {
  fecha: string;
  nombres: string;
  cedula: string;
  correo: string;
  telefono: string;
  servicio: string;
  pais: string;
  prefijo: string;
  modalidad: string;
  resultado: string;
  asesor: string;
}

interface FueraHorarioRow {
  horaContacto: string;
  fecha: string;
  nombres: string;
  cedula: string;
  correo: string;
  telefono: string;
  pais: string;
  prefijo: string;
  modalidad: string;
  servicio: string;
  detalle: string;
  origen: string;
  asesor: string;
}

const TURNOS_DATA: TurnoRow[] = [
  {
    turno: '001', fecha: '12/05/2026, 08:15:23', nombres: 'Carlos Mendoza',
    cedula: '1104479231', correo: 'cmendoza@mail.com', telefono: '0991234567',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Cambio de carrera o paralelo', detalle: 'Quiero cambiarme a la carrera de Derecho',
    origen: 'TURNO', asesor: 'Lionel Messi',
  },
  {
    turno: '002', fecha: '12/05/2026, 08:42:10', nombres: 'María García',
    cedula: '1712345678', correo: 'mgarcia@mail.com', telefono: '0987654321',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'Distancia',
    servicio: 'Incremento de cupo', detalle: 'Necesito cupo extra en Cálculo II',
    origen: 'GUIA', asesor: 'Cristiano Ronaldo',
  },
  {
    turno: '003', fecha: '12/05/2026, 09:10:45', nombres: 'Ana Rodríguez',
    cedula: '0912345678', correo: 'arodriguez@mail.com', telefono: '0976543210',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'Presencial',
    servicio: 'Legalización de matrícula', detalle: '',
    origen: 'GUIA', asesor: '',
  },
  {
    turno: '004', fecha: '12/05/2026, 10:30:02', nombres: 'Pedro Sánchez',
    cedula: '0604479231', correo: 'psanchez@mail.com', telefono: '612345678',
    pais: 'España', prefijo: '+34', modalidad: 'Presencial',
    servicio: 'Recalificación de examen', detalle: 'Examen de Álgebra del 08/05',
    origen: 'TURNO', asesor: '',
  },
  {
    turno: '005', fecha: '09/05/2026, 15:00:18', nombres: 'José Martínez',
    cedula: '1312345678', correo: 'jmartinez@mail.com', telefono: '0991112233',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Matrícula con excepción de prerrequisitos',
    detalle: 'Quiero tomar Redes sin Programación II aprobada',
    origen: 'TURNO', asesor: 'Kevin De Bruyne',
  },
  {
    turno: '006', fecha: '09/05/2026, 16:20:55', nombres: 'Laura Vargas',
    cedula: '1001234567', correo: 'lvargas@mail.com', telefono: '3121234567',
    pais: 'Colombia', prefijo: '+57', modalidad: 'Distancia',
    servicio: 'Validaciones con autorización especial', detalle: '',
    origen: 'TURNO', asesor: 'Vinícius Júnior',
  },
  {
    turno: '007', fecha: '08/05/2026, 08:05:33', nombres: 'Sofia Sarmiento',
    cedula: '1109876543', correo: 'ssarmiento@mail.com', telefono: '0993334455',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Tomar componentes en otra modalidad',
    detalle: 'Componente presencial quiero tomarlo a distancia',
    origen: 'GUIA', asesor: '',
  },
  {
    turno: '008', fecha: '08/05/2026, 11:15:41', nombres: 'Diego Herrera',
    cedula: '1701234567', correo: 'dherrera@mail.com', telefono: '0994445566',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Justificación de inasistencia',
    detalle: 'Falté al examen del 05/05 por enfermedad, tengo certificado médico',
    origen: 'TURNO', asesor: 'Luka Modrić',
  },
  {
    turno: '009', fecha: '06/05/2026, 15:30:07', nombres: 'Daniel Vega',
    cedula: '0919876543', correo: 'dvega@mail.com', telefono: '0995556677',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'Presencial',
    servicio: 'Cambio de carrera o paralelo',
    detalle: 'De Ingeniería Civil a Ingeniería en Sistemas',
    origen: 'TURNO', asesor: '',
  },
  {
    turno: '010', fecha: '12/05/2026, 16:01:12', nombres: 'Camila Ortega',
    cedula: '1319876543', correo: 'cortega@mail.com', telefono: '91123456789',
    pais: 'Argentina', prefijo: '+54', modalidad: 'Distancia',
    servicio: 'Certificados', detalle: 'Certificado de matrícula para beca externa',
    origen: 'GUIA', asesor: 'Erling Haaland',
  },
  {
    turno: '011', fecha: '12/05/2026, 16:45:30', nombres: 'Ricardo Paz',
    cedula: '1702345678', correo: 'rpaz@mail.com', telefono: '0981112233',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Tipos de becas y requisitos', detalle: 'Quiero aplicar a beca académica',
    origen: 'TURNO', asesor: '',
  },
  {
    turno: '012', fecha: '12/05/2026, 17:15:00', nombres: 'Estefanía Ruiz',
    cedula: '1002345678', correo: 'eruiz@mail.com', telefono: '0971112233',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'Presencial',
    servicio: 'Manejo de CANVAS y acceso a clases por Zoom',
    detalle: 'No puedo acceder a mis clases en CANVAS',
    origen: 'GUIA', asesor: 'Neymar Jr',
  },
];

const AUTOGESTION_DATA: AutogestionRow[] = [
  {
    fecha: '12/05/2026, 08:30:15', nombres: 'Carla Ruiz',
    cedula: '1102345678', correo: 'cruiz@mail.com', telefono: '0991234567',
    servicio: 'Tomar componentes en otra modalidad', pais: 'Ecuador',
    prefijo: '+593', modalidad: 'En línea',
    resultado: 'ÉXITO', asesor: '',
  },
  {
    fecha: '12/05/2026, 09:15:42', nombres: 'Roberto Díaz',
    cedula: '1712341234', correo: 'rdiaz@mail.com', telefono: '0987654321',
    servicio: 'Descuentos y formas de pago', pais: 'España',
    prefijo: '+34', modalidad: 'Distancia',
    resultado: 'ÉXITO', asesor: '',
  },
  {
    fecha: '11/05/2026, 14:20:08', nombres: 'Mónica Torres',
    cedula: '0912349876', correo: 'mtorres@mail.com', telefono: '0976543210',
    servicio: 'Manejo de CANVAS y acceso a clases por Zoom', pais: 'Ecuador',
    prefijo: '+593', modalidad: 'En línea',
    resultado: 'REQUIERE TURNO', asesor: 'Neymar Jr',
  },
  {
    fecha: '10/05/2026, 10:05:33', nombres: 'Fernando Ríos',
    cedula: '1009876543', correo: 'frios@mail.com', telefono: '3121234567',
    servicio: 'Fechas importantes', pais: 'Colombia',
    prefijo: '+57', modalidad: 'Distancia',
    resultado: 'ÉXITO', asesor: '',
  },
  {
    fecha: '09/05/2026, 16:40:21', nombres: 'Andrea Castillo',
    cedula: '1312341234', correo: 'acastillo@mail.com', telefono: '0991112233',
    servicio: 'Tipos de becas y requisitos', pais: 'Ecuador',
    prefijo: '+593', modalidad: 'Presencial',
    resultado: 'REQUIERE TURNO', asesor: 'Luis Suárez',
  },
  {
    fecha: '12/05/2026, 11:00:55', nombres: 'Gustavo Paredes',
    cedula: '0602345678', correo: 'gparedes@mail.com', telefono: '0982223344',
    servicio: 'Aumento de créditos', pais: 'Ecuador',
    prefijo: '+593', modalidad: 'Presencial',
    resultado: 'ÉXITO', asesor: '',
  },
  {
    fecha: '08/05/2026, 15:10:44', nombres: 'Patricia Loor',
    cedula: '1103456789', correo: 'ploor@mail.com', telefono: '0993334455',
    servicio: 'Aprobación de Inglés', pais: 'Ecuador',
    prefijo: '+593', modalidad: 'En línea',
    resultado: 'REQUIERE TURNO', asesor: 'Robert Lewandowski',
  },
];

const FUERA_DATA: FueraHorarioRow[] = [
  {
    horaContacto: '08:00 - 09:00', fecha: '10/05/2026, 21:15:00',
    nombres: 'Patricia Loor', cedula: '1103456789',
    correo: 'ploor@mail.com', telefono: '0991112233',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Información General', detalle: 'Quiero información de las carreras disponibles',
    origen: 'TURNO', asesor: '',
  },
  {
    horaContacto: '09:00 - 10:00', fecha: '11/05/2026, 22:30:00',
    nombres: 'Ricardo Solís', cedula: '1713451234',
    correo: 'rsolis@mail.com', telefono: '0982223344',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'Distancia',
    servicio: 'Cambio de carrera o paralelo',
    detalle: 'Quiero cambiarme a Administración de Empresas',
    origen: 'TURNO', asesor: '',
  },
  {
    horaContacto: '10:00 - 11:00', fecha: '09/05/2026, 19:45:00',
    nombres: 'Elena Gómez', cedula: '0913456789',
    correo: 'egomez@mail.com', telefono: '612343434',
    pais: 'España', prefijo: '+34', modalidad: 'Presencial',
    servicio: 'Legalización de matrícula',
    detalle: 'Necesito legalizar mi matrícula urgentemente',
    origen: 'GUIA', asesor: 'Cristiano Ronaldo',
  },
  {
    horaContacto: '11:00 - 12:00', fecha: '12/05/2026, 20:10:00',
    nombres: 'Martín Cueva', cedula: '1003459876',
    correo: 'mcueva@mail.com', telefono: '0964445566',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Recalificación de examen',
    detalle: 'Solicito recalificación urgente de mi examen final',
    origen: 'TURNO', asesor: '',
  },
  {
    horaContacto: '15:00 - 16:00', fecha: '08/05/2026, 20:30:00',
    nombres: 'Diana Ponce', cedula: '1313451234',
    correo: 'dponce@mail.com', telefono: '987654321',
    pais: 'Perú', prefijo: '+51', modalidad: 'Presencial',
    servicio: 'Aprobación de Inglés',
    detalle: 'Necesito información sobre el examen de nivel B2',
    origen: 'TURNO', asesor: '',
  },
  {
    horaContacto: '16:00 - 17:00', fecha: '10/05/2026, 18:20:00',
    nombres: 'Óscar Noblecilla', cedula: '0603457890',
    correo: 'onoblecilla@mail.com', telefono: '0986667788',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'Distancia',
    servicio: 'Tipos de becas y requisitos', detalle: 'Quiero información de beca deportiva',
    origen: 'GUIA', asesor: '',
  },
  {
    horaContacto: '17:00 - 18:00', fecha: '09/05/2026, 21:00:00',
    nombres: 'Isabel Mendoza', cedula: '0913454321',
    correo: 'imendoza@mail.com', telefono: '3125556677',
    pais: 'Colombia', prefijo: '+57', modalidad: 'En línea',
    servicio: 'Manejo de CANVAS y acceso a clases por Zoom',
    detalle: 'No puedo ingresar a mis clases virtuales',
    origen: 'GUIA', asesor: 'Lionel Messi',
  },
  {
    horaContacto: '08:00 - 09:00', fecha: '12/05/2026, 21:33:00',
    nombres: 'Xavier Páez', cedula: '1103451111',
    correo: 'xpaez@mail.com', telefono: '0968889900',
    pais: 'Ecuador', prefijo: '+593', modalidad: 'En línea',
    servicio: 'Reconocimiento de estudios externos (Grado y Posgrado)',
    detalle: 'Tengo estudios de posgrado en el extranjero que quiero reconocer',
    origen: 'GUIA', asesor: '',
  },
];

async function seedSheet(
  sheets: ReturnType<typeof google.sheets>,
  name: string,
  colCount: number,
  rows: string[][]
) {
  const colLetter = String.fromCodePoint(64 + colCount);
  console.log(`  Seeding ${rows.length} rows into ${name}...`);
  await sheets.spreadsheets.values.append({
    auth: getAuth(),
    spreadsheetId: SHEETS_ID,
    range: `${name}!A:${colLetter}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

async function main() {
  console.log('\n Seeding dummy data...\n');

  const auth = getAuth();
  await auth.authorize();
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('--- TURNOS_ASESORIA ---');
  await seedSheet(
    sheets, 'TURNOS_ASESORIA', 13,
    TURNOS_DATA.map((r) => [
      r.turno, r.fecha, r.nombres, r.cedula, r.correo,
      r.pais, r.prefijo, r.telefono, r.modalidad, r.servicio, r.detalle, r.origen, r.asesor,
    ])
  );

  console.log('--- AUTOGESTION ---');
  await seedSheet(
    sheets, 'AUTOGESTION', 11,
    AUTOGESTION_DATA.map((r) => [
      r.fecha, r.nombres, r.cedula, r.correo, r.telefono,
      r.servicio, r.pais, r.prefijo, r.modalidad, r.resultado, r.asesor,
    ])
  );

  console.log('--- FUERA_HORARIO ---');
  await seedSheet(
    sheets, 'FUERA_HORARIO', 13,
    FUERA_DATA.map((r) => [
      r.horaContacto, r.fecha, r.nombres, r.cedula, r.correo,
      r.pais, r.prefijo, r.telefono, r.modalidad, r.servicio, r.detalle, r.origen, r.asesor,
    ])
  );

  console.log('\n All dummy data seeded!\n');
}

main().catch(console.error);
