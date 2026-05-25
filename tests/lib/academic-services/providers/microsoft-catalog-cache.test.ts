import { describe, expect, it } from 'vitest';

import { buildCatalogFromSnapshot } from '@/lib/academic-services/providers/microsoft/catalog-cache';

describe('buildCatalogFromSnapshot (SharePoint / Power Automate)', () => {
  it('maps Title + field_N rows for student types and categories', () => {
    const catalog = buildCatalogFromSnapshot({
      studentTypes: [
        { ID: 1, Title: 'PREGRADO', field_1: 'Pregrado', field_2: 'Carreras de grado', field_3: 10, field_4: 1 },
      ],
      serviceCategories: [
        {
          ID: 1,
          Title: 'servicios-practicum',
          field_1: 'SERVICIOS-PRÁCTICUM',
          field_2: 'Gestiones de prácticum',
          field_3: 10,
          field_4: 1,
          field_5: 'PREGRADO',
        },
      ],
      services: [],
    });

    expect(catalog.studentTypes).toHaveLength(1);
    expect(catalog.studentTypes[0]?.code).toBe('PREGRADO');
    expect(catalog.studentTypes[0]?.name).toBe('Pregrado');
    expect(catalog.categories).toHaveLength(1);
    expect(catalog.categories[0]?.name).toBe('SERVICIOS-PRÁCTICUM');
    expect(catalog.services).toHaveLength(0);
  });

  it('builds services and requirements when Services list is synced', () => {
    const catalog = buildCatalogFromSnapshot({
      studentTypes: [{ ID: 1, Title: 'PREGRADO', field_1: 'Pregrado', field_3: 10, field_4: 1 }],
      serviceCategories: [
        {
          ID: 1,
          Title: 'servicios-practicum',
          field_1: 'SERVICIOS-PRÁCTICUM',
          field_3: 10,
          field_4: 1,
          field_5: 'PREGRADO',
        },
      ],
      services: [
        {
          ID: 1,
          Title: 'SRV-PRAC-EXP-LAB',
          field_1: 'Prácticas en laboratorio',
          field_2: 'servicios-practicum',
          field_3: 10,
          field_4: 1,
          field_5: 'published',
        },
      ],
      serviceManuals: [
        {
          ID: 1,
          Title: 'SRV-PRAC-EXP-LAB',
          field_1: 'Tener aprobado el pre-requisito de la asignatura.',
          field_2: 1,
          field_3: 1,
        },
      ],
    });

    expect(catalog.services).toHaveLength(1);
    expect(catalog.services[0]?.title).toBe('Prácticas en laboratorio');
    expect(catalog.services[0]?.requirements[0]?.text).toContain('pre-requisito');
  });
});
