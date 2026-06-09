import type { ServiceCategory } from '@/types/form';

export const serviceCatalog: ServiceCategory[] = [
  {
    id: 'matricula',
    title: 'Matrícula',
    services: [
      {
        id: 'tomar-componentes-otra-modalidad',
        label: 'Tomar componentes en otra modalidad',
        result: 'GUIA',
      },
      {
        id: 'incremento-cupo',
        label: 'Incremento de cupo',
        result: 'GUIA',
      },
      {
        id: 'aumento-creditos',
        label: 'Aumento de créditos',
        result: 'GUIA',
      },
      {
        id: 'materias-no-proyeccion',
        label: 'Materias que no constan en la proyección',
        result: 'GUIA',
      },
      {
        id: 'legalizacion-matricula',
        label: 'Legalización de matrícula',
        result: 'GUIA',
      },
    ],
  },
  {
    id: 'reconocimiento-estudios',
    title: 'Reconocimiento de Estudios',
    services: [
      {
        id: 'validacion-ejercicio-profesional',
        label: 'Solicitar análisis de validación por ejercicio profesional o experiencia laboral',
        result: 'GUIA',
      },
      {
        id: 'reconocimiento-estudios-externos',
        label: 'Solicitar reconocimiento de estudios externos (Grado y Posgrado)',
        result: 'GUIA',
      },
    ],
  },
  {
    id: 'cambio-carrera',
    title: 'Cambio de Carrera',
    services: [
      {
        id: 'cambio-carrera-paralelo',
        label: 'Cambio de carrera o paralelo',
        result: 'TURNO',
      },
    ],
  },
  {
    id: 'informacion-general',
    title: 'Información General',
    services: [
      {
        id: 'fechas-importantes',
        label: 'Fechas importantes (calendarios de matrículas, inglés, becas, exámenes)',
        result: 'GUIA',
      },
      {
        id: 'horarios-clases',
        label: 'Horarios de clases',
        result: 'GUIA',
      },
      {
        id: 'certificados',
        label: 'Certificados',
        result: 'GUIA',
      },
    ],
  },
  {
    id: 'finanzas',
    title: 'Finanzas',
    services: [
      {
        id: 'descuentos-formas-pago',
        label: 'Descuentos y formas de pago',
        result: 'GUIA',
      },
      {
        id: 'tipos-becas-requisitos',
        label: 'Tipos de becas y requisitos',
        result: 'GUIA',
      },
    ],
  },
  {
    id: 'plataformas',
    title: 'Plataformas',
    services: [
      {
        id: 'canvas-zoom',
        label: 'Manejo de CANVAS y acceso a clases por Zoom',
        result: 'GUIA',
      },
    ],
  },
  {
    id: 'academico',
    title: 'Académico',
    services: [
      {
        id: 'aprobacion-ingles',
        label: 'Aprobación de Inglés',
        result: 'GUIA',
      },
    ],
  },
  {
    id: 'solicitudes-excepcionales',
    title: 'Solicitudes Excepcionales',
    services: [
      {
        id: 'matricula-excepcion-prerrequisitos',
        label: 'Matrícula con excepción de prerrequisitos',
        result: 'TURNO',
      },
      {
        id: 'validaciones-autorizacion',
        label: 'Validaciones con autorización especial',
        result: 'TURNO',
      },
      {
        id: 'justificacion-inasistencia',
        label: 'Justificación de inasistencia',
        result: 'TURNO',
      },
      {
        id: 'recalificacion-examen',
        label: 'Recalificación de examen',
        result: 'TURNO',
      },
    ],
  },
];

export function findServiceById(
  serviceId: string
): { category: ServiceCategory; service: ServiceCategory['services'][0] } | null {
  if (!serviceId) return null;
  for (const category of serviceCatalog) {
    const service = category.services.find((s) => s.id === serviceId);
    if (service) {
      return { category, service };
    }
  }
  return null;
}
