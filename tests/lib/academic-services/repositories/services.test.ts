import { beforeEach, describe, expect, it } from 'vitest';

import {
  getServiceDetailForAdmin,
  listActiveServicesByCategoryId,
} from '@/lib/academic-services/repositories/services';
import { getPublicPortalCatalog } from '@/lib/academic-services/repositories/portal-catalog';
import { prisma } from '@/lib/db';

describe('academic services repositories', () => {
  beforeEach(async () => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = 'neon';
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "ServiceManual",
        "ServicePeriodModality",
        "ServicePeriod",
        "ServiceRequirementItem",
        "ServiceRequirementTabGuide",
        "ServiceRequirementTab",
        "ServiceRequirement",
        "Service",
        "ServiceCategory",
        "StudentType"
      RESTART IDENTITY CASCADE
    `);

    const st = await prisma.studentType.create({
      data: { code: 'TEST', name: 'Test', isActive: true },
    });
    const cat = await prisma.serviceCategory.create({
      data: { name: 'Cat', slug: 'cat', studentTypeId: st.id, isActive: true },
    });
    await prisma.service.create({
      data: {
        sourceKey: 'test-visible',
        sourceRowIndex: 1,
        title: 'Visible',
        slug: 'visible',
        programs: ['Programa A'],
        categoryId: cat.id,
        isActive: true,
        status: 'published',
        calendarText: 'octubre 2026',
        requirementTabs: {
          create: [
            {
              tabName: 'DISTANCIA',
              sortOrder: 0,
              title: null,
              items: { create: [{ text: 'Req 1', pdfUrl: null, sortOrder: 0 }] },
              guides: { create: [{ label: 'Guía DISTANCIA', url: 'https://example.com/guia', sortOrder: 0 }] },
            },
          ],
        },
        periods: {
          create: [
            {
              name: 'Periodo A',
              sortOrder: 0,
              modalities: {
                create: [
                  {
                    modality: 'General',
                    requestWindow: 'Abril',
                    responseWindow: null,
                    enabledFrom: new Date('2026-04-13T00:00:00.000Z'),
                    enabledTo: new Date('2026-04-28T00:00:00.000Z'),
                    sortOrder: 0,
                  },
                ],
              },
            },
          ],
        },
        manuals: { create: [{ label: 'Manual', url: 'https://example.com/manual', sortOrder: 0 }] },
      },
    });
    await prisma.service.create({
      data: {
        sourceKey: 'test-hidden',
        sourceRowIndex: 2,
        title: 'Oculto',
        slug: 'oculto',
        categoryId: cat.id,
        isActive: true,
        status: 'needs_review',
      },
    });
  });

  it('returns only active published services in category list', async () => {
    const cat = await prisma.serviceCategory.findFirstOrThrow();
    const services = await listActiveServicesByCategoryId(cat.id);
    expect(services).toHaveLength(1);
    expect(services[0].title).toBe('Visible');
    expect(services.every((service) => service.status === 'published')).toBe(true);
    expect(services.every((service) => service.isActive)).toBe(true);
  });

  it('excludes needs_review services from the public catalog', async () => {
    const catalog = await getPublicPortalCatalog();
    expect(catalog.services.some((service) => service.status === 'needs_review')).toBe(false);
  });

  it('returns tabs, periods, manuals, and calendarText for admin detail', async () => {
    const svc = await prisma.service.findFirstOrThrow({ where: { sourceKey: 'test-visible' } });
    const detail = await getServiceDetailForAdmin(svc.id);
    expect(detail).toBeTruthy();
    expect(detail?.calendarText).toBeTypeOf('string');
    expect(detail?.requirementTabs.length).toBeGreaterThanOrEqual(0);
    expect(detail?.periods.length).toBeGreaterThanOrEqual(1);
    expect(detail?.manuals.length).toBeGreaterThanOrEqual(1);
    expect(detail?.programs.length).toBeGreaterThanOrEqual(1);
    expect(detail?.requirementTabs[0]?.blocks[0]?.guides.length).toBeGreaterThanOrEqual(1);
  });
});
