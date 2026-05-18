import type { UtplPortalApiRow } from '@/lib/seed/utpl-portal-api-types';

export type UtplRowClassification = { kind: 'SERVICE'; hasStudentTypes: boolean };

export function classifyUtplPortalRow(row: UtplPortalApiRow): UtplRowClassification {
  return {
    kind: 'SERVICE',
    hasStudentTypes:
      row.field_tipo_estudiante
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean).length > 0,
  };
}
