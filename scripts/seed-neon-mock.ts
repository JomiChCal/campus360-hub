import { prisma } from '../lib/db';

type MockModality = {
  modality: string;
  requestWindow: string | null;
  responseWindow: string | null;
  enabledFrom: string | null;
  enabledTo: string | null;
};

type MockPeriod = {
  name: string;
  modalities: MockModality[];
};

type MockService = {
  sourceKey: string;
  title: string;
  slug: string;
  description: string;
  programs: string[];
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  calendarText: string | null;
  status: 'draft' | 'published' | 'needs_review';
  isActive: boolean;
  sortOrder: number;
  requirements: string[];
  requirementTabs: Array<{
    tabName: string;
    title: string | null;
    items: Array<{ text: string; pdfUrl: string | null }>;
    guides: Array<{ label: string; url: string }>;
  }>;
  periods: MockPeriod[];
  manuals: Array<{ label: string; url: string }>;
};

type MockCategory = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  services: MockService[];
};

type MockStudentType = {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  categories: MockCategory[];
};

const mockCatalog: MockStudentType[] = [
  {
    code: 'ESTUDIANTE_PRESENCIAL',
    name: 'Estudiante Presencial',
    description: 'Perfil para estudiantes de modalidad presencial.',
    sortOrder: 0,
    categories: [
      {
        name: 'SERVICIOS-MATRICULA',
        slug: 'servicios-matricula',
        description: 'Procesos de matrícula, validaciones y cambios.',
        sortOrder: 0,
        services: [
          {
            sourceKey: 'mock-reconocimiento-practicum-presencial',
            title: 'Solicitar reconocimiento de prácticum por experiencia laboral MP/MAD/TEC',
            slug: 'reconocimiento-practicum-experiencia-laboral',
            description:
              'Dirigido a estudiantes que soliciten el reconocimiento de su experiencia laboral para validar asignaturas de Prácticum.',
            programs: [],
            modalityLevel: 'Distancia / En línea / Presencial - Nivel Grado / Técnico Tecnológico',
            responseTime: '15 días',
            cost: 'USD 96 por asignatura',
            note: '72 horas para registrar pago después de la aprobación.',
            calendarText: 'Calendario para matrícula del periodo octubre 2026 – febrero 2027',
            status: 'published',
            isActive: true,
            sortOrder: 0,
            requirements: [
              'Tener aprobado o validado el pre-requisito de la asignatura.',
              'Tener la beca activa (si aplica).',
            ],
            requirementTabs: [
              {
                tabName: 'DISTANCIA',
                title: 'Estudiantes ECTS',
                items: [
                  { text: 'Administración en Banca y Finanzas', pdfUrl: 'https://example.com/docs/ects/abf.pdf' },
                  { text: 'Contabilidad y Auditoría', pdfUrl: 'https://example.com/docs/ects/contabilidad.pdf' },
                  { text: 'Psicología', pdfUrl: 'https://example.com/docs/ects/psicologia.pdf' },
                ],
                guides: [
                  { label: 'Guía de reconocimiento DISTANCIA (ECTS)', url: 'https://example.com/guias/distancia-ects.pdf' },
                  { label: 'Formato de carta DISTANCIA (ECTS)', url: 'https://example.com/guias/distancia-ects-carta.pdf' },
                ],
              },
              {
                tabName: 'DISTANCIA',
                title: 'Estudiantes Rediseño',
                items: [
                  { text: 'Administración de Empresas', pdfUrl: 'https://example.com/docs/rediseno/administracion-empresas.pdf' },
                  { text: 'Derecho', pdfUrl: 'https://example.com/docs/rediseno/derecho.pdf' },
                  { text: 'Tecnologías de Información', pdfUrl: 'https://example.com/docs/rediseno/ti.pdf' },
                ],
                guides: [{ label: 'Guía de reconocimiento DISTANCIA (Rediseño)', url: 'https://example.com/guias/distancia-rediseno.pdf' }],
              },
              {
                tabName: 'PRESENCIAL',
                title: 'Estudiante STS',
                items: [{ text: 'Listado de carreras STS habilitadas', pdfUrl: 'https://example.com/docs/sts/listado-carreras.pdf' }],
                guides: [
                  { label: 'Guía de reconocimiento PRESENCIAL', url: 'https://example.com/guias/presencial.pdf' },
                  { label: 'Checklist de documentación PRESENCIAL', url: 'https://example.com/guias/presencial-checklist.pdf' },
                  { label: 'Preguntas frecuentes PRESENCIAL', url: 'https://example.com/guias/presencial-faq.pdf' },
                ],
              },
            ],
            periods: [
              {
                name: 'Periodo octubre 2026 - febrero 2027',
                modalities: [
                  {
                    modality: 'GENERAL',
                    requestWindow: '13/04/2026 - 28/04/2026',
                    responseWindow: '15 días',
                    enabledFrom: '2026-04-13',
                    enabledTo: '2026-04-28',
                  },
                ],
              },
            ],
            manuals: [
              { label: 'Manual del proceso - DISTANCIA - ECTS', url: 'https://example.com/manuales/reconocimiento-distancia-ects.pdf' },
              { label: 'Manual del proceso - PRESENCIAL - STS', url: 'https://example.com/manuales/reconocimiento-presencial-sts.pdf' },
            ],
          },
          {
            sourceKey: 'mock-retiro-asignatura-presencial',
            title: 'Retiro voluntario de asignatura',
            slug: 'retiro-voluntario-asignatura',
            description: 'Permite retirar una o más asignaturas dentro de fechas oficiales.',
            programs: [],
            modalityLevel: 'Presencial',
            responseTime: 'Hasta 3 días hábiles',
            cost: 'Sin costo',
            note: 'Sujeto a calendario académico institucional.',
            calendarText: 'Periodo septiembre 2026 - febrero 2027',
            status: 'published',
            isActive: true,
            sortOrder: 1,
            requirements: ['Solicitud firmada', 'Copia de cédula'],
            requirementTabs: [],
            periods: [
              {
                name: 'Periodo septiembre 2026 - febrero 2027',
                modalities: [
                  {
                    modality: 'PRESENCIAL',
                    requestWindow: '10/09/2026 - 20/10/2026',
                    responseWindow: '3 días hábiles',
                    enabledFrom: '2026-09-10',
                    enabledTo: '2026-10-20',
                  },
                ],
              },
            ],
            manuals: [],
          },
          {
            sourceKey: 'mock-homologacion-interna-presencial',
            title: 'Homologación interna de asignaturas',
            slug: 'homologacion-interna-asignaturas',
            description: 'Reconocimiento de contenidos aprobados entre mallas vigentes.',
            programs: [],
            modalityLevel: null,
            responseTime: '20 días',
            cost: null,
            note: null,
            calendarText: null,
            status: 'published',
            isActive: true,
            sortOrder: 2,
            requirements: ['Récord académico actualizado'],
            requirementTabs: [
              {
                tabName: 'PRESENCIAL',
                title: 'Estudiante regular',
                items: [{ text: 'Malla curricular firmada por coordinación', pdfUrl: 'https://example.com/docs/homologacion/malla-firmada.pdf' }],
                guides: [{ label: 'Guía rápida de homologación', url: 'https://example.com/guias/homologacion-rapida.pdf' }],
              },
            ],
            periods: [],
            manuals: [],
          },
        ],
      },
      {
        name: 'TRAMITES-ACADEMICOS',
        slug: 'tramites-academicos',
        description: 'Trámites de certificación y constancias.',
        sortOrder: 1,
        services: [
          {
            sourceKey: 'mock-certificado-matricula-presencial',
            title: 'Certificado de matrícula',
            slug: 'certificado-matricula-presencial',
            description: 'Emisión de certificado de matrícula para trámites externos.',
            programs: [],
            modalityLevel: 'Presencial',
            responseTime: '24 a 48 horas',
            cost: 'USD 6',
            note: null,
            calendarText: null,
            status: 'published',
            isActive: true,
            sortOrder: 0,
            requirements: [],
            requirementTabs: [],
            periods: [],
            manuals: [{ label: 'Manual de descarga de certificado', url: 'https://example.com/manuales/certificado-matricula.pdf' }],
          },
          {
            sourceKey: 'mock-cambio-jornada-presencial',
            title: 'Cambio de jornada académica',
            slug: 'cambio-jornada-academica',
            description: 'Solicitud para cambiar de jornada matutina a vespertina o nocturna.',
            programs: [],
            modalityLevel: 'Presencial',
            responseTime: null,
            cost: 'USD 12',
            note: 'Se revisa cupo por paralelo.',
            calendarText: 'Disponible según cronograma de cada facultad.',
            status: 'needs_review',
            isActive: true,
            sortOrder: 1,
            requirements: ['Carta motivada', 'Récord académico'],
            requirementTabs: [],
            periods: [],
            manuals: [],
          },
        ],
      },
    ],
  },
  {
    code: 'ESTUDIANTE_EN_LINEA',
    name: 'Estudiante En Línea',
    description: 'Perfil para estudiantes en modalidades distancia y en línea.',
    sortOrder: 1,
    categories: [
      {
        name: 'SERVICIOS-MATRICULA',
        slug: 'servicios-matricula',
        description: 'Ajustes y excepciones del proceso de matrícula.',
        sortOrder: 0,
        services: [
          {
            sourceKey: 'mock-incremento-cupo-linea',
            title: 'Solicitud de incremento de cupo',
            slug: 'incremento-cupo-linea',
            description: 'Permite solicitar cupo adicional en asignaturas con alta demanda.',
            programs: [],
            modalityLevel: 'Distancia / En línea',
            responseTime: '5 días hábiles',
            cost: null,
            note: null,
            calendarText: 'Vigente durante la fase ordinaria de matrícula.',
            status: 'published',
            isActive: true,
            sortOrder: 0,
            requirements: ['No registrar tercera matrícula en la asignatura.'],
            requirementTabs: [
              {
                tabName: 'EN LÍNEA',
                title: 'Estudiante STS',
                items: [{ text: 'Captura del aula virtual sin cupo', pdfUrl: 'https://example.com/docs/cupo/captura-aula.pdf' }],
                guides: [{ label: 'Guía de incremento de cupo', url: 'https://example.com/guias/incremento-cupo.pdf' }],
              },
            ],
            periods: [
              {
                name: 'Ventana ordinaria',
                modalities: [
                  {
                    modality: 'EN LÍNEA',
                    requestWindow: '01/10/2026 - 20/10/2026',
                    responseWindow: '5 días hábiles',
                    enabledFrom: '2026-10-01',
                    enabledTo: '2026-10-20',
                  },
                ],
              },
            ],
            manuals: [{ label: 'Manual de solicitud en portal', url: 'https://example.com/manuales/incremento-cupo-portal.pdf' }],
          },
          {
            sourceKey: 'mock-reactivacion-carrera-linea',
            title: 'Reactivación de carrera',
            slug: 'reactivacion-carrera-linea',
            description: 'Reingreso para estudiantes que interrumpieron temporalmente sus estudios.',
            programs: [],
            modalityLevel: null,
            responseTime: '10 días hábiles',
            cost: 'USD 20',
            note: null,
            calendarText: null,
            status: 'published',
            isActive: true,
            sortOrder: 1,
            requirements: ['No tener sanciones académicas vigentes.', 'Pago del arancel correspondiente.'],
            requirementTabs: [],
            periods: [],
            manuals: [],
          },
        ],
      },
      {
        name: 'TITULACION',
        slug: 'titulacion',
        description: 'Procesos relacionados con titulación.',
        sortOrder: 1,
        services: [
          {
            sourceKey: 'mock-inscripcion-examen-complexivo-linea',
            title: 'Inscripción a examen complexivo',
            slug: 'inscripcion-examen-complexivo-linea',
            description: 'Registro para rendir el examen complexivo.',
            programs: [],
            modalityLevel: 'En línea',
            responseTime: '7 días',
            cost: 'USD 45',
            note: null,
            calendarText: 'Cronograma definido por la dirección de titulación.',
            status: 'draft',
            isActive: true,
            sortOrder: 0,
            requirements: ['Haber cumplido el porcentaje de avance requerido.'],
            requirementTabs: [],
            periods: [],
            manuals: [],
          },
          {
            sourceKey: 'mock-solicitud-certificado-ingles-linea',
            title: 'Solicitud de certificado de suficiencia de inglés',
            slug: 'certificado-suficiencia-ingles-linea',
            description: 'Emisión de certificado interno de suficiencia para proceso de titulación.',
            programs: [],
            modalityLevel: 'Distancia / En línea',
            responseTime: '72 horas',
            cost: 'USD 8',
            note: null,
            calendarText: null,
            status: 'published',
            isActive: true,
            sortOrder: 1,
            requirements: [],
            requirementTabs: [],
            periods: [],
            manuals: [],
          },
        ],
      },
    ],
  },
  {
    code: 'ESTUDIANTE_STS',
    name: 'Estudiante STS',
    description: 'Perfil especializado para estudiantes con seguimiento STS.',
    sortOrder: 2,
    categories: [
      {
        name: 'BENEFICIOS-ESTUDIANTILES',
        slug: 'beneficios-estudiantiles',
        description: 'Becas, beneficios y validaciones socioeconómicas.',
        sortOrder: 0,
        services: [
          {
            sourceKey: 'mock-actualizacion-beca-sts',
            title: 'Actualización de beca institucional',
            slug: 'actualizacion-beca-institucional-sts',
            description: 'Renovación o actualización de beca institucional por periodo académico.',
            programs: [],
            modalityLevel: 'Presencial / En línea',
            responseTime: '12 días',
            cost: null,
            note: 'Aplica solo durante ventanas de renovación.',
            calendarText: 'Proceso habilitado por convocatoria institucional.',
            status: 'published',
            isActive: true,
            sortOrder: 0,
            requirements: ['Formulario socioeconómico actualizado.', 'Adjuntar respaldo de ingresos del hogar.'],
            requirementTabs: [
              {
                tabName: 'EN LÍNEA',
                title: 'Estudiante STS',
                items: [
                  { text: 'Documento de identidad', pdfUrl: 'https://example.com/docs/beca/identidad.pdf' },
                  { text: 'Certificado laboral del representante', pdfUrl: 'https://example.com/docs/beca/certificado-laboral.pdf' },
                ],
                guides: [
                  { label: 'Guía de carga de documentos', url: 'https://example.com/guias/beca-carga-documentos.pdf' },
                  { label: 'Guía de formulario socioeconómico', url: 'https://example.com/guias/beca-formulario.pdf' },
                ],
              },
            ],
            periods: [
              {
                name: 'Convocatoria 2026-2',
                modalities: [
                  {
                    modality: 'EN LÍNEA',
                    requestWindow: '05/08/2026 - 25/08/2026',
                    responseWindow: '12 días',
                    enabledFrom: '2026-08-05',
                    enabledTo: '2026-08-25',
                  },
                ],
              },
            ],
            manuals: [{ label: 'Manual de renovación de beca', url: 'https://example.com/manuales/renovacion-beca-sts.pdf' }],
          },
          {
            sourceKey: 'mock-emision-carnet-digital-sts',
            title: 'Emisión de carné digital',
            slug: 'emision-carnet-digital-sts',
            description: 'Generación de carné digital institucional.',
            programs: [],
            modalityLevel: null,
            responseTime: null,
            cost: null,
            note: null,
            calendarText: null,
            status: 'published',
            isActive: true,
            sortOrder: 1,
            requirements: [],
            requirementTabs: [],
            periods: [],
            manuals: [],
          },
        ],
      },
    ],
  },
  {
    code: 'POSGRADO',
    name: 'Estudiante Posgrado',
    description: 'Perfil para estudiantes de programas de posgrado.',
    sortOrder: 3,
    categories: [
      {
        name: 'ADMISION-POSGRADO',
        slug: 'admision-posgrado',
        description: 'Servicios de admisión y matrícula de posgrado.',
        sortOrder: 0,
        services: [
          {
            sourceKey: 'mock-actualizacion-expediente-posgrado',
            title: 'Actualización de expediente de admisión',
            slug: 'actualizacion-expediente-admision-posgrado',
            description: 'Permite actualizar documentos del expediente de admisión de posgrado.',
            programs: [],
            modalityLevel: 'En línea / Presencial',
            responseTime: '4 días hábiles',
            cost: 'USD 10',
            note: null,
            calendarText: null,
            status: 'published',
            isActive: true,
            sortOrder: 0,
            requirements: ['Documento de identidad vigente', 'Título de tercer nivel registrado'],
            requirementTabs: [
              {
                tabName: 'PRESENCIAL',
                title: 'Nivel Posgrado',
                items: [{ text: 'Formato de actualización firmado', pdfUrl: 'https://example.com/docs/posgrado/formato-actualizacion.pdf' }],
                guides: [{ label: 'Guía de actualización de expediente', url: 'https://example.com/guias/posgrado-actualizacion-expediente.pdf' }],
              },
            ],
            periods: [],
            manuals: [],
          },
          {
            sourceKey: 'mock-solicitud-congelamiento-posgrado',
            title: 'Solicitud de congelamiento de periodo',
            slug: 'solicitud-congelamiento-periodo-posgrado',
            description: 'Permite solicitar congelamiento de periodo por causas justificadas.',
            programs: [],
            modalityLevel: 'En línea / Presencial',
            responseTime: '8 días hábiles',
            cost: null,
            note: 'Sujeto a aprobación de coordinación de programa.',
            calendarText: 'Solo durante las primeras 4 semanas del periodo.',
            status: 'published',
            isActive: true,
            sortOrder: 1,
            requirements: ['Carta de solicitud firmada', 'Respaldo de la causa justificable'],
            requirementTabs: [],
            periods: [
              {
                name: 'Periodo marzo - julio 2026',
                modalities: [
                  {
                    modality: 'EN LÍNEA',
                    requestWindow: '01/03/2026 - 30/03/2026',
                    responseWindow: '8 días hábiles',
                    enabledFrom: '2026-03-01',
                    enabledTo: '2026-03-30',
                  },
                  {
                    modality: 'PRESENCIAL',
                    requestWindow: '01/03/2026 - 30/03/2026',
                    responseWindow: '8 días hábiles',
                    enabledFrom: '2026-03-01',
                    enabledTo: '2026-03-30',
                  },
                ],
              },
            ],
            manuals: [{ label: 'Manual de congelamiento', url: 'https://example.com/manuales/congelamiento-posgrado.pdf' }],
          },
        ],
      },
    ],
  },
];

function toDate(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function buildServiceWriteData(categoryId: number, service: MockService) {
  return {
    sourceKey: service.sourceKey,
    sourceRowIndex: null,
    categoryId,
    title: service.title,
    slug: service.slug,
    description: service.description,
    programs: service.programs,
    modalityLevel: service.modalityLevel,
    responseTime: service.responseTime,
    cost: service.cost,
    note: service.note,
    calendarText: service.calendarText,
    status: service.status,
    sortOrder: service.sortOrder,
    isActive: service.isActive,
    requirements: {
      create: service.requirements.map((text, sortOrder) => ({ text, sortOrder })),
    },
    requirementTabs: {
      create: service.requirementTabs.map((tab, tabSortOrder) => ({
        tabName: tab.tabName,
        title: tab.title,
        sortOrder: tabSortOrder,
        items: {
          create: tab.items.map((item, itemSortOrder) => ({
            text: item.text,
            pdfUrl: item.pdfUrl,
            sortOrder: itemSortOrder,
          })),
        },
        guides: {
          create: tab.guides.map((guide, guideSortOrder) => ({
            label: guide.label,
            url: guide.url,
            sortOrder: guideSortOrder,
          })),
        },
      })),
    },
    periods: {
      create: service.periods.map((period, periodSortOrder) => ({
        name: period.name,
        sortOrder: periodSortOrder,
        modalities: {
          create: period.modalities.map((modality, modalitySortOrder) => ({
            modality: modality.modality,
            requestWindow: modality.requestWindow,
            responseWindow: modality.responseWindow,
            enabledFrom: toDate(modality.enabledFrom),
            enabledTo: toDate(modality.enabledTo),
            sortOrder: modalitySortOrder,
          })),
        },
      })),
    },
    manuals: {
      create: service.manuals.map((manual, manualSortOrder) => ({
        label: manual.label,
        url: manual.url,
        sortOrder: manualSortOrder,
      })),
    },
  };
}

async function upsertServiceTree(categoryId: number, service: MockService) {
  const existing = await prisma.service.findUnique({
    where: { sourceKey: service.sourceKey },
    select: { id: true },
  });

  const data = buildServiceWriteData(categoryId, service);

  if (!existing) {
    await prisma.service.create({ data });
    return 'created';
  }

  await prisma.$transaction(async (tx) => {
    await tx.serviceManual.deleteMany({ where: { serviceId: existing.id } });
    await tx.servicePeriodModality.deleteMany({ where: { period: { serviceId: existing.id } } });
    await tx.servicePeriod.deleteMany({ where: { serviceId: existing.id } });
    await tx.serviceRequirementItem.deleteMany({ where: { tab: { serviceId: existing.id } } });
    await tx.serviceRequirementTabGuide.deleteMany({ where: { tab: { serviceId: existing.id } } });
    await tx.serviceRequirementTab.deleteMany({ where: { serviceId: existing.id } });
    await tx.serviceRequirement.deleteMany({ where: { serviceId: existing.id } });
    await tx.service.update({ where: { id: existing.id }, data });
  });

  return 'updated';
}

async function main() {
  if (process.env.ACADEMIC_SERVICES_DATA_PROVIDER !== 'neon') {
    throw new Error('db:seed:mock requires ACADEMIC_SERVICES_DATA_PROVIDER=neon');
  }

  const keepSourceKeys = new Set<string>();
  let createdServices = 0;
  let updatedServices = 0;
  let upsertedStudentTypes = 0;
  let upsertedCategories = 0;

  for (const studentType of mockCatalog) {
    const savedStudentType = await prisma.studentType.upsert({
      where: { code: studentType.code },
      create: {
        code: studentType.code,
        name: studentType.name,
        description: studentType.description,
        sortOrder: studentType.sortOrder,
        isActive: true,
      },
      update: {
        name: studentType.name,
        description: studentType.description,
        sortOrder: studentType.sortOrder,
        isActive: true,
      },
      select: { id: true },
    });
    upsertedStudentTypes += 1;

    for (const category of studentType.categories) {
      const savedCategory = await prisma.serviceCategory.upsert({
        where: {
          studentTypeId_slug: {
            studentTypeId: savedStudentType.id,
            slug: category.slug,
          },
        },
        create: {
          studentTypeId: savedStudentType.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: true,
        },
        update: {
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: true,
        },
        select: { id: true },
      });
      upsertedCategories += 1;

      for (const service of category.services) {
        keepSourceKeys.add(service.sourceKey);
        const result = await upsertServiceTree(savedCategory.id, service);
        if (result === 'created') createdServices += 1;
        if (result === 'updated') updatedServices += 1;
      }
    }
  }

  await prisma.service.deleteMany({
    where: {
      sourceKey: { startsWith: 'mock-' },
      NOT: { sourceKey: { in: [...keepSourceKeys] } },
    },
  });

  const [studentTypes, categories, services, periodRows, guides] = await Promise.all([
    prisma.studentType.count({ where: { isActive: true } }),
    prisma.serviceCategory.count({ where: { isActive: true } }),
    prisma.service.count(),
    prisma.servicePeriodModality.count(),
    prisma.serviceRequirementTabGuide.count(),
  ]);

  console.log('Mock seed complete:', {
    upsertedStudentTypes,
    upsertedCategories,
    createdServices,
    updatedServices,
    studentTypes,
    categories,
    services,
    periodRows,
    guides,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
