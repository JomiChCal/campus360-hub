import { afterEach, describe, expect, it } from 'vitest';

describe('getAcademicServicesProvider', () => {
  const prev = process.env.ACADEMIC_SERVICES_DATA_PROVIDER;

  afterEach(() => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = prev;
  });

  it('throws when env is missing', async () => {
    delete process.env.ACADEMIC_SERVICES_DATA_PROVIDER;
    const { getAcademicServicesProvider } = await import(
      '@/lib/academic-services/providers/registry'
    );
    expect(() => getAcademicServicesProvider()).toThrow(/ACADEMIC_SERVICES_DATA_PROVIDER/);
  });

  it('accepts neon', async () => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = 'neon';
    const { getAcademicServicesProvider } = await import(
      '@/lib/academic-services/providers/registry'
    );
    expect(getAcademicServicesProvider()).toBe('neon');
  });
});
