import { afterEach, describe, expect, it } from 'vitest';
import path from 'node:path';

const prevEnv = {
  ACADEMIC_SERVICES_DATA_PROVIDER: process.env.ACADEMIC_SERVICES_DATA_PROVIDER,
  MICROSOFT_PROVIDER_MODE: process.env.MICROSOFT_PROVIDER_MODE,
  MICROSOFT_PROTOTYPE_FIXTURE_PATH: process.env.MICROSOFT_PROTOTYPE_FIXTURE_PATH,
};

afterEach(() => {
  process.env.ACADEMIC_SERVICES_DATA_PROVIDER = prevEnv.ACADEMIC_SERVICES_DATA_PROVIDER;
  process.env.MICROSOFT_PROVIDER_MODE = prevEnv.MICROSOFT_PROVIDER_MODE;
  process.env.MICROSOFT_PROTOTYPE_FIXTURE_PATH = prevEnv.MICROSOFT_PROTOTYPE_FIXTURE_PATH;
});

describe('microsoft prototype integration', () => {
  it('loads the public portal catalog from a SharePoint-like fixture', async () => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = 'microsoft';
    process.env.MICROSOFT_PROVIDER_MODE = 'prototype';
    process.env.MICROSOFT_PROTOTYPE_FIXTURE_PATH = path.resolve(
      process.cwd(),
      'data/microsoft-sharepoint-prototype.json'
    );

    const { getPublicPortalCatalog } =
      await import('@/lib/academic-services/repositories/portal-catalog');

    const catalog = await getPublicPortalCatalog();
    expect(catalog.studentTypes).toHaveLength(2);
    expect(catalog.categories).toHaveLength(2);
    expect(catalog.services).toHaveLength(1);
    expect(catalog.services[0]?.title).toBe('Certificado de matrícula');
    expect(catalog.services[0]?.studentTypeId).toBe(1);
  });

  it('returns service detail with tabs, periods, and manuals', async () => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = 'microsoft';
    process.env.MICROSOFT_PROVIDER_MODE = 'prototype';
    process.env.MICROSOFT_PROTOTYPE_FIXTURE_PATH = path.resolve(
      process.cwd(),
      'data/microsoft-sharepoint-prototype.json'
    );

    const { getActiveServiceDetail } =
      await import('@/lib/academic-services/repositories/services');

    const detail = await getActiveServiceDetail(11, 101);
    expect(detail).toBeTruthy();
    expect(detail?.categoryName).toBe('SERVICIOS-MATRICULA');
    expect(detail?.requirementTabs).toHaveLength(1);
    expect(detail?.periods).toHaveLength(1);
    expect(detail?.manuals).toHaveLength(1);
    expect(detail?.requirements[0]?.text).toBe('Tener matrícula activa');
  });
});
