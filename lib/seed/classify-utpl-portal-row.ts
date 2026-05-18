import type { UtplPortalApiRow } from '@/lib/seed/utpl-portal-api-types';

export type UtplRowClassification =
  | { kind: 'DISCARD'; reason: 'disableblock' | 'visual-header' }
  | { kind: 'SERVICE'; hasStudentTypes: boolean };

const VISUAL_HEADER_PATTERN = /^SERVICIOS DE\s+/i;

export function classifyUtplPortalRow(row: UtplPortalApiRow): UtplRowClassification {
  const title = row.field_nombre_servicio.trim();
  const normalizedTitle = title.replace(/^[^A-Za-zÁÉÍÓÚÜÑ]+/u, '').trim();
  const plainDescription = row.field_descripcion_servicio.replace(/<[^>]+>/g, ' ').trim();

  if (title.toLowerCase() === 'disableblock') {
    return { kind: 'DISCARD', reason: 'disableblock' };
  }

  if (VISUAL_HEADER_PATTERN.test(normalizedTitle) && plainDescription.length === 0) {
    return { kind: 'DISCARD', reason: 'visual-header' };
  }

  return {
    kind: 'SERVICE',
    hasStudentTypes:
      row.field_tipo_estudiante
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean).length > 0,
  };
}
