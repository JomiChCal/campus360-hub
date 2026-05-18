import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { mapUtplPortalApiToSeed } from '@/lib/seed/map-utpl-portal-api';
import { STUDENT_TYPE_ORDER, type UtplPortalApiRow } from '@/lib/seed/utpl-portal-api-types';

const raw = JSON.parse(
  readFileSync(path.join(process.cwd(), 'data/utpl-portal-raw.json'), 'utf8'),
) as UtplPortalApiRow[];

describe('mapUtplPortalApiToSeed', () => {
  it('expands multi-type rows and preserves API order', () => {
    const { studentTypes, report } = mapUtplPortalApiToSeed(raw);

    expect(report.rawRecords).toBe(73);
    expect(report.expandedPlacements).toBeGreaterThan(73);
    expect(studentTypes.map((st) => st.code)).toEqual(
      STUDENT_TYPE_ORDER.filter((code) => studentTypes.some((st) => st.code === code)),
    );

    const continuo = studentTypes.find((st) => st.code === 'CONTINUO');
    expect(continuo).toBeDefined();
    const matricula = continuo!.categories.find((c) => c.name === 'SERVICIOS-MATRÍCULA');
    expect(matricula?.services[0]?.title).toBe('Solicitar Reingreso');
  });

  it('drops structural rows before expansion', () => {
    const { report } = mapUtplPortalApiToSeed(raw);
    expect(report.discardedRows).toBeGreaterThan(0);
    expect(report.services).toBeGreaterThan(0);
    expect(report.sectionHeaders).toBe(0);
    expect(report.spacers).toBe(0);
  });

  it('keeps emoji-prefixed Solicitar rows as active SERVICE in reconocimiento', () => {
    const { studentTypes } = mapUtplPortalApiToSeed(raw);
    const continuo = studentTypes.find((st) => st.code === 'CONTINUO');
    const reconocimiento = continuo?.categories.find((c) =>
      c.name.includes('RECONOCIMIENTO'),
    );
    expect(reconocimiento).toBeDefined();

    const validacionServices = reconocimiento!.services.filter(
      (s) =>
        s.isActive &&
        s.status === 'published' &&
        s.title.toLowerCase().includes('validación general de inglés'),
    );
    expect(validacionServices).toHaveLength(1);
    expect(validacionServices[0]?.title).toBe(
      'Solicitar validación general de inglés.',
    );

    const structuralTitles = new Set([
      'SERVICIOS DE HOMOLOGACION EXTERNA.',
      'SERVICIOS DE VALIDACION',
      'SERVICIOS DE RECONOCIMIENTO',
    ]);
    expect(
      reconocimiento!.services.some((s) => structuralTitles.has(s.title.toUpperCase())),
    ).toBe(false);
  });

  it('assigns unique sourceKey per placement', () => {
    const { studentTypes } = mapUtplPortalApiToSeed(raw);
    const keys = studentTypes.flatMap((st) =>
      st.categories.flatMap((cat) => cat.services.map((s) => s.sourceKey)),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});
