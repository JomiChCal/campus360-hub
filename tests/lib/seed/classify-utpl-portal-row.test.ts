import { describe, expect, it } from 'vitest';

import { classifyUtplPortalRow } from '@/lib/seed/classify-utpl-portal-row';

describe('classifyUtplPortalRow', () => {
  it('does not discard disableblock rows anymore', () => {
    expect(
      classifyUtplPortalRow({
        field_tipo_estudiante: 'NUEVO',
        field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
        field_nombre_servicio: 'disableblock',
        field_nombre_servicio_1: 'disableblock',
        field_descripcion_servicio: '',
      }).kind,
    ).toBe('SERVICE');
  });

  it('does not discard visual header rows by title alone', () => {
    expect(
      classifyUtplPortalRow({
        field_tipo_estudiante: 'NUEVO, CONTINUO',
        field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
        field_nombre_servicio: '🟢 SERVICIOS DE HOMOLOGACION EXTERNA.',
        field_nombre_servicio_1: '🟢 SERVICIOS DE HOMOLOGACION EXTERNA.',
        field_descripcion_servicio: '',
      }).kind,
    ).toBe('SERVICE');
  });

  it('keeps service rows even when title starts with emoji', () => {
    expect(
      classifyUtplPortalRow({
        field_tipo_estudiante: 'NUEVO, CONTINUO',
        field_categoria_servicio: 'SERVICIOS-RECONOCIMIENTO DE ESTUDIOS',
        field_nombre_servicio: '🟡 Solicitar validación general de inglés.',
        field_nombre_servicio_1: '🟡 Solicitar validación general de inglés.',
        field_descripcion_servicio: '<p><strong>Descripción:</strong> Dirigido a estudiantes...</p>',
      }).kind,
    ).toBe('SERVICE');
  });
});
