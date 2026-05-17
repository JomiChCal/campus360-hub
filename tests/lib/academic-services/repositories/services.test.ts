import { beforeEach, describe, expect, it } from 'vitest';

import { listActiveServicesByCategoryId } from '@/lib/academic-services/repositories/services';
import { prisma } from '@/lib/db';

describe('listActiveServicesByCategoryId', () => {
  beforeEach(async () => {
    process.env.ACADEMIC_SERVICES_DATA_PROVIDER = 'neon';
    await prisma.serviceManual.deleteMany();
    await prisma.servicePeriodModality.deleteMany();
    await prisma.servicePeriod.deleteMany();
    await prisma.serviceRequirementItem.deleteMany();
    await prisma.serviceRequirementTab.deleteMany();
    await prisma.serviceRequirement.deleteMany();
    await prisma.service.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.studentType.deleteMany();

    const st = await prisma.studentType.create({
      data: { code: 'TEST', name: 'Test' },
    });
    const cat = await prisma.serviceCategory.create({
      data: { name: 'Cat', studentTypeId: st.id },
    });
    await prisma.service.createMany({
      data: [
        { title: 'Visible', categoryId: cat.id, isActive: true },
        { title: 'Oculto', categoryId: cat.id, isActive: false },
      ],
    });
  });

  it('returns only active services', async () => {
    const cat = await prisma.serviceCategory.findFirstOrThrow();
    const services = await listActiveServicesByCategoryId(cat.id);
    expect(services).toHaveLength(1);
    expect(services[0].title).toBe('Visible');
  });
});
