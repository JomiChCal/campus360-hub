import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseUtplDescriptionHtml } from '@/lib/seed/parse-utpl-description-html';
import type { UtplPortalApiRow } from '@/lib/seed/utpl-portal-api-types';

const raw = JSON.parse(
  readFileSync(path.join(process.cwd(), 'data/utpl-portal-raw.json'), 'utf8'),
) as UtplPortalApiRow[];

function findRow(titlePart: string) {
  const row = raw.find((r) => r.field_nombre_servicio.includes(titlePart));
  if (!row) throw new Error(`Fixture not found: ${titlePart}`);
  return row;
}

describe('parseUtplDescriptionHtml', () => {
  it('parses description, modality, response time and note from Reingreso', () => {
    const row = findRow('Reingreso');
    const parsed = parseUtplDescriptionHtml(row.field_descripcion_servicio);

    expect(parsed.description).toMatch(/abandonaron sus estudios/i);
    expect(parsed.modalityLevel).toMatch(/Distancia\/Presencial/i);
    expect(parsed.responseTime).toMatch(/5 días/i);
    expect(parsed.note).toMatch(/matrícula/i);
    expect(parsed.manuals.length).toBeGreaterThan(0);
    expect(parsed.periods.length).toBeGreaterThan(0);
  });

  it('parses requirements list from notas faltantes', () => {
    const row = findRow('notas faltantes');
    const parsed = parseUtplDescriptionHtml(row.field_descripcion_servicio);

    expect(parsed.requirements.length).toBeGreaterThanOrEqual(1);
    expect(parsed.responseTime).toMatch(/6 días/i);
    expect(parsed.periods.length).toBeGreaterThanOrEqual(1);
  });

  it('parses cost from validation service', () => {
    const row = findRow('validación general de inglés');
    const parsed = parseUtplDescriptionHtml(row.field_descripcion_servicio);

    expect(parsed.cost).toMatch(/\$96/);
    expect(parsed.modalityLevel).toMatch(/Presencial\/Distancia/i);
  });

  it('splits combined description block with calendar and cost', () => {
    const row = findRow('análisis de validación de prácticas');
    const parsed = parseUtplDescriptionHtml(row.field_descripcion_servicio);

    expect(parsed.description).toMatch(/Gestión Productiva\/Prácticum/i);
    expect(parsed.description).not.toMatch(/Modalidad y nivel de estudio/i);
    expect(parsed.description).not.toMatch(/Calendario/i);
    expect(parsed.modalityLevel).toMatch(/Presencial\/Grado/i);
    expect(parsed.responseTime).toMatch(/6 días/i);
    expect(parsed.cost).toMatch(/Sin costo/i);
    expect(parsed.periods.length).toBeGreaterThanOrEqual(1);
    expect(parsed.periods[0]?.modalities[0]?.requestWindow).toMatch(/13 de abril/i);
    expect(parsed.calendarText).toMatch(/2026/i);
  });

  it('extracts modality tabs from practicum recognition service', () => {
    const row = findRow('prácticum por experiencia laboral');
    const parsed = parseUtplDescriptionHtml(row.field_descripcion_servicio);
    expect(parsed.requirementTabs.map((tab) => tab.tabName)).toEqual(
      expect.arrayContaining(['PRESENCIAL', 'TECNOLOGÍAS']),
    );
  });

  it('keeps a plain calendar summary for manual correction', () => {
    const row = findRow('prácticum por experiencia laboral');
    const parsed = parseUtplDescriptionHtml(row.field_descripcion_servicio);
    expect(parsed.calendarText).toBeTruthy();
    expect(parsed.periods.length).toBeGreaterThan(0);
  });
});
