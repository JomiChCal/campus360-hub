export type UtplPortalApiRow = {
  field_tipo_estudiante: string;
  field_descripcion_servicio: string;
  field_nombre_servicio: string;
  field_categoria_servicio: string;
  field_nombre_servicio_1: string;
};

export const UTPL_PORTAL_BASE_URL = 'https://portales.utpl.edu.ec';
export const UTPL_PORTAL_API_URL = `${UTPL_PORTAL_BASE_URL}/servicios-academicos`;

export const STUDENT_TYPE_ORDER = ['CONTINUO', 'NUEVO', 'POSTULANTE', 'ALUMNI'] as const;

export const STUDENT_TYPE_LABELS: Record<(typeof STUDENT_TYPE_ORDER)[number], string> = {
  CONTINUO: 'Continuo',
  NUEVO: 'Nuevo',
  POSTULANTE: 'Postulante',
  ALUMNI: 'Alumni',
};
