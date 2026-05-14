export type GuideStepType = 'text' | 'video' | 'image' | 'tip';

export interface GuideStep {
  type: GuideStepType;
  content?: string;
  stepNumber?: number;
  url?: string;
  title?: string;
  caption?: string;
  duration?: string;
}

export type GuideContent = Record<string, GuideStep[]>;

export const guides: GuideContent = {
  'tomar-componentes-otra-modalidad': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Ingresa a tu portal Mi UTPL con tu usuario y contraseña institucional.',
    },
    {
      type: 'video',
      stepNumber: 2,
      url: 'https://www.youtube.com/embed/example1',
      title: 'Video: Acceso a Mi UTPL',
      duration: '1:30',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Dirígete a la sección "Matrícula" > "Proceso de matrícula".',
    },
    {
      type: 'image',
      stepNumber: 3,
      url: '/images/matricula-menu.png',
      caption: 'Menú de matrícula en Mi UTPL',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Revisa la proyección de materias sugeridas para el periodo activo.',
    },
    {
      type: 'text',
      stepNumber: 4,
      content:
        'Marca la casilla "Solicitar modalidad alterna" en la materia que deseas cursar en otra modalidad.',
    },
    {
      type: 'tip',
      content:
        '💡 Tip: Si no aparece la opción de modalidad alterna, contacta a tu director de carrera.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content:
        'Selecciona la modalidad deseada (presencial, en línea o distancia) del menú desplegable.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Confirma tu solicitud y espera la autorización de tu director de carrera.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content:
        'Una vez aprobado, completa el proceso de matrícula y genera el comprobante de pago.',
    },
  ],

  'incremento-cupo': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Ingresa a Mi UTPL y dirígete a "Matrícula" > "Solicitudes".',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/solicitudes-menu.png',
      caption: 'Sección de solicitudes en Mi UTPL',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Selecciona la opción "Solicitar incremento de cupo" del menú de servicios.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Busca la materia en la que deseas incrementar cupo utilizando el código o nombre.',
    },
    { type: 'tip', content: '💡 El código de la materia aparece en tu malla curricular.' },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Redacta una breve justificación señalando por qué necesitas el cupo adicional.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content:
        'Adjunta cualquier documento de respaldo si es necesario (certificado, carta, etc.).',
    },
    {
      type: 'video',
      stepNumber: 6,
      url: 'https://www.youtube.com/embed/example2',
      title: 'Video: Cómo adjuntar documentos',
      duration: '2:15',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Envía la solicitud. Recibirás una notificación en máximo 48 horas.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Si es aprobada, procede a matricularte en la materia desde "Proceso de matrícula".',
    },
  ],

  'aumento-creditos': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Verifica tu promedio general en Mi UTPL > "Historial Académico".',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/historial-academico.png',
      caption: 'Consulta tu promedio en el historial académico',
    },
    {
      type: 'tip',
      content:
        '📊 El aumento de créditos requiere un promedio mínimo de 14/20 según el reglamento.',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'El aumento de créditos requiere un promedio mínimo de 14/20 según el reglamento.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Ingresa a "Matrícula" > "Solicitudes" y selecciona "Aumento de créditos".',
    },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Selecciona las materias adicionales que deseas cursar en el periodo.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'El sistema calculará automáticamente el total de créditos solicitados.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Confirma la solicitud y realiza el pago de los créditos adicionales.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content:
        'Revisa en "Materias inscritas" que todas las materias estén registradas correctamente.',
    },
  ],

  'materias-no-proyeccion': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Ingresa a Mi UTPL y selecciona "Matrícula" > "Proceso de matrícula".',
    },
    {
      type: 'video',
      stepNumber: 2,
      url: 'https://www.youtube.com/embed/example3',
      title: 'Video: Agregar materia manualmente',
      duration: '1:45',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Revisa la proyección de materias generada por tu director de carrera.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content:
        'Si una materia que necesitas no aparece, haz clic en "Agregar materia manualmente".',
    },
    {
      type: 'text',
      stepNumber: 4,
      content:
        'Ingresa el código de la materia (lo encuentras en la malla curricular de tu carrera).',
    },
    {
      type: 'tip',
      content:
        '🔍 Si no conoces el código, consulta la malla curricular en "Información Académica".',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'Si no conoces el código, consulta la malla curricular en "Información Académica".',
    },
    {
      type: 'text',
      stepNumber: 6,
      content:
        'Una vez agregada, verifica que la materia se haya incluido correctamente en tu lista.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Continúa con el proceso de matrícula normal y genera tu comprobante.',
    },
  ],

  'legalizacion-matricula': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Ingresa a Mi UTPL y dirígete a "Matrícula" > "Legalización de matrícula".',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/legalizacion-step1.png',
      caption: 'Paso 1: Verificar estado de cuenta',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Verifica que tu estado de cuenta no tenga valores pendientes de pago.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content:
        'Si eres estudiante nuevo, confirma que todos tus documentos de admisión estén subidos y aprobados.',
    },
    {
      type: 'image',
      stepNumber: 4,
      url: '/images/legalizacion-step2.png',
      caption: 'Paso 2: Verificar expediente académico',
    },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Revisa que tu expediente académico esté completo y sin observaciones.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content:
        'Selecciona "Legalizar matrícula" y firma electrónicamente el acuerdo de compromiso académico.',
    },
    {
      type: 'tip',
      content: '✍️ La firma electrónica es obligatoria para completar la legalización.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Descarga el comprobante de legalización como respaldo de tu trámite.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Recibirás la confirmación oficial en un plazo máximo de 48 horas hábiles.',
    },
  ],

  'validacion-ejercicio-profesional': [
    {
      type: 'text',
      stepNumber: 1,
      content:
        'Revisa el Reglamento de Reconocimiento de Estudios en la sección de Normativas UTPL.',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Prepara tu certificado de trabajo actualizado (con máximo 30 días de emisión).',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Adjunta una copia de tu contrato laboral o nombramiento según corresponda.',
    },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Elabora un informe descriptivo de tus funciones y competencias adquiridas.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content:
        'Ingresa a Mi UTPL y selecciona "Gestión de Reconocimiento" > "Validación por ejercicio profesional".',
    },
    { type: 'tip', content: '📄 Todos los documentos deben estar en formato PDF y legibles.' },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Completa el formulario de solicitud y adjunta todos los documentos.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'La Comisión de Reconocimiento evaluará tu caso en un plazo de 15 días hábiles.',
    },
    {
      type: 'text',
      stepNumber: 8,
      content: 'Recibirás el resultado a través de tu correo institucional UTPL.',
    },
  ],

  'reconocimiento-estudios-externos': [
    {
      type: 'text',
      stepNumber: 1,
      content:
        'Solicita en tu universidad de origen el certificado de estudios oficial con calificaciones.',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Consigue los sílabos o contenidos programáticos de cada materia a reconocer.',
    },
    {
      type: 'tip',
      content:
        '🌎 Para estudios del extranjero, los documentos deben estar legalizados o apostillados.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content:
        'Para estudios del extranjero, los documentos deben estar legalizados o apostillados.',
    },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Ingresa a Mi UTPL y selecciona "Gestión de Reconocimiento" > "Estudios externos".',
    },
    {
      type: 'text',
      stepNumber: 5,
      content:
        'Completa el formulario indicando institución de origen, periodo y materias cursadas.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Adjunta los documentos escaneados en PDF en el orden indicado por el sistema.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Cancela el valor del trámite según la tabla de aranceles vigente.',
    },
    {
      type: 'text',
      stepNumber: 8,
      content: 'La resolución se emitirá en un plazo de 20 días hábiles.',
    },
  ],

  'fechas-importantes': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Consulta el Calendario Académico oficial en la página principal de la UTPL.',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/calendario-academico.png',
      caption: 'Calendario Académico UTPL 2024',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Las matrículas ordinarias se realizan en marzo y agosto de cada año.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Los cursos de inglés tienen convocatorias mensuales; revisa fechas en "Idiomas".',
    },
    {
      type: 'text',
      stepNumber: 4,
      content:
        'Las convocatorias de becas se publican al inicio de cada periodo en Bienestar Universitario.',
    },
    {
      type: 'tip',
      content: '📅 Mantente atento a las fechas límite para evitar recargos por mora.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'Los exámenes presenciales se programan al finalizar cada bimestre.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Activa notificaciones en Mi UTPL para recibir recordatorios automáticos.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Sigue las redes sociales oficiales de la UTPL para anuncios importantes.',
    },
  ],

  'horarios-clases': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Ingresa a Mi UTPL y selecciona "Mis Materias" o "Horarios".',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/horarios-materias.png',
      caption: 'Vista de horarios por materia',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Se desplegará la lista de materias en las que estás matriculado.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content:
        'Haz clic en cada materia para ver los horarios de clases sincrónicas y asincrónicas.',
    },
    { type: 'tip', content: '🕐 Los horarios se muestran en hora de Ecuador continental (UTC-5).' },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Los horarios se muestran en hora de Ecuador continental (UTC-5).',
    },
    {
      type: 'text',
      stepNumber: 5,
      content:
        'Si la materia tiene clases grabadas, accede a "Grabaciones" para verlas en tu horario disponible.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'También puedes consultar horarios desde la app móvil "Mi UTPL".',
    },
  ],

  certificados: [
    {
      type: 'text',
      stepNumber: 1,
      content: 'Ingresa a Mi UTPL y dirígete a "Secretaría Virtual" > "Certificados".',
    },
    {
      type: 'text',
      stepNumber: 2,
      content:
        'Selecciona el tipo de certificado: matrícula, notas, conducta, malla curricular, etc.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Verifica que tus datos personales estén actualizados antes de continuar.',
    },
    { type: 'tip', content: '✅ Datos incorrectos pueden retrasar la emisión del certificado.' },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Confirma la solicitud y procede al pago del valor correspondiente.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'El certificado digital estará disponible en 48 horas hábiles para descarga.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content:
        'Si requieres certificado físico, solicita el envío a domicilio con costo adicional.',
    },
    { type: 'text', stepNumber: 7, content: 'Recibirás una notificación cuando esté listo.' },
  ],

  'descuentos-formas-pago': [
    {
      type: 'text',
      stepNumber: 1,
      content:
        'La UTPL ofrece descuentos por pronto pago durante las primeras dos semanas de cada periodo.',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/descuentos.png',
      caption: 'Tabla de descuentos por pronto pago',
    },
    {
      type: 'text',
      stepNumber: 2,
      content:
        'Consulta los convenios institucionales vigentes en "Convenios y Descuentos" del portal.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Puedes pagar con tarjeta de crédito, débito, transferencia bancaria o efectivo.',
    },
    { type: 'tip', content: '💳 El pago con tarjeta de crédito puede tener meses sin interés.' },
    {
      type: 'text',
      stepNumber: 4,
      content:
        'Los pagos en línea se procesan de forma segura desde la plataforma de pagos en Mi UTPL.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'Para pagos en efectivo, genera la orden de pago y acudir a los bancos autorizados.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content:
        'Si tienes beca, verifica que el descuento se aplique automáticamente en tu estado de cuenta.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Para pagos diferidos, solicita un plan en "Finanzas" > "Solicitudes".',
    },
  ],

  'tipos-becas-requisitos': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'La UTPL ofrece becas académicas, socioeconómicas, deportivas y culturales.',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/tipos-beca.png',
      caption: 'Tipos de becas disponibles',
    },
    { type: 'tip', content: '📚 La beca académica requiere un promedio mínimo de 16/20.' },
    {
      type: 'text',
      stepNumber: 2,
      content: 'La beca académica requiere un promedio mínimo de 16/20 en el periodo anterior.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content:
        'La beca socioeconómica se otorga según el índice de vulnerabilidad del grupo familiar.',
    },
    {
      type: 'text',
      stepNumber: 4,
      content:
        'Las becas deportivas y culturales requieren certificación de logros emitida por la federación.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'Revisa requisitos y fechas de convocatoria en la sección "Becas" del portal UTPL.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content:
        'Prepara la documentación: cédula, certificado de notas, planillas de servicios básicos.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Presenta tu solicitud dentro del plazo establecido desde Mi UTPL.',
    },
    {
      type: 'text',
      stepNumber: 8,
      content: 'Los resultados se publican en la primera semana del periodo académico.',
    },
  ],

  'canvas-zoom': [
    {
      type: 'video',
      stepNumber: 1,
      url: 'https://www.youtube.com/embed/canvas-tutorial',
      title: 'Tutorial: Primeros pasos en CANVAS',
      duration: '3:30',
    },
    {
      type: 'text',
      stepNumber: 1,
      content: 'Accede a CANVAS desde canvas.utpl.edu.ec o desde el enlace en Mi UTPL.',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/canvas-login.png',
      caption: 'Pantalla de inicio de sesión CANVAS',
    },
    {
      type: 'text',
      stepNumber: 2,
      content: 'Usa tus credenciales institucionales para iniciar sesión.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'En el panel principal verás tus materias organizadas por periodo.',
    },
    {
      type: 'image',
      stepNumber: 4,
      url: '/images/canvas-panel.png',
      caption: 'Panel principal de CANVAS',
    },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Dentro de cada materia revisa: módulos, tareas, foros y evaluaciones.',
    },
    {
      type: 'tip',
      content:
        '📺 Para clases en vivo por Zoom, accede desde la pestaña "Zoom" dentro de cada materia.',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'Para clases en vivo por Zoom, haz clic en la pestaña "Zoom" de la materia.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'Asegúrate de tener la última versión de Zoom instalada.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Si no puedes asistir en vivo, las grabaciones estarán en "Grabaciones".',
    },
    {
      type: 'text',
      stepNumber: 8,
      content:
        'Para problemas técnicos, escribe a soporte.ti@utpl.edu.ec con tu usuario y materia.',
    },
  ],

  'aprobacion-ingles': [
    {
      type: 'text',
      stepNumber: 1,
      content: 'La UTPL exige el nivel B2 de inglés como requisito de graduación.',
    },
    {
      type: 'image',
      stepNumber: 2,
      url: '/images/niveles-ingles.png',
      caption: 'Niveles de inglés en la UTPL (A1 a B2)',
    },
    {
      type: 'text',
      stepNumber: 2,
      content:
        'Puedes acreditarlo mediante examen de ubicación o cursando los niveles progresivos.',
    },
    {
      type: 'text',
      stepNumber: 3,
      content: 'Inscríbete en el examen de ubicación desde "Inglés" en Mi UTPL.',
    },
    {
      type: 'tip',
      content:
        '🎯 Si ya tienes nivel B2 certificado internacionalmente, puedes homologar directamente.',
    },
    {
      type: 'text',
      stepNumber: 4,
      content: 'Según tu resultado, se te asignará el nivel correspondiente (A1 a B2).',
    },
    {
      type: 'text',
      stepNumber: 5,
      content: 'Cada nivel dura un bimestre con clases sincrónicas semanales.',
    },
    {
      type: 'text',
      stepNumber: 6,
      content: 'La nota mínima de aprobación es 70/100 para avanzar al siguiente nivel.',
    },
    {
      type: 'text',
      stepNumber: 7,
      content: 'Si tienes certificado internacional (TOEFL, IELTS), solicita homologación.',
    },
    {
      type: 'text',
      stepNumber: 8,
      content: 'Consulta el calendario de inglés en "Idiomas" para fechas de inscripción.',
    },
  ],
};

export function getGuide(id: string): GuideStep[] {
  return (
    guides[id] ?? [
      {
        type: 'text',
        stepNumber: 1,
        content: 'Sigue las instrucciones en Mi UTPL para completar tu trámite.',
      },
    ]
  );
}
