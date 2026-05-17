import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '../lib/db';
import { mapUtplJsonToSeedPayload } from '../lib/seed/map-utpl-json';
import type { UtplServicesJson } from '../lib/seed/types';

async function main() {
  if (process.env.ACADEMIC_SERVICES_DATA_PROVIDER !== 'neon') {
    throw new Error('db:seed:servicios requires ACADEMIC_SERVICES_DATA_PROVIDER=neon');
  }

  const filePath = path.join(process.cwd(), 'data/utpl-servicios-academicos.json');
  const raw = await readFile(filePath, 'utf8');
  const json = JSON.parse(raw) as UtplServicesJson;
  const payload = mapUtplJsonToSeedPayload(json);

  await prisma.$transaction(async (tx) => {
    await tx.serviceManual.deleteMany();
    await tx.servicePeriodModality.deleteMany();
    await tx.servicePeriod.deleteMany();
    await tx.serviceRequirementItem.deleteMany();
    await tx.serviceRequirementTab.deleteMany();
    await tx.serviceRequirement.deleteMany();
    await tx.service.deleteMany();
    await tx.serviceCategory.deleteMany();
    await tx.studentType.deleteMany();

    for (const st of payload) {
      await tx.studentType.create({
        data: {
          code: st.code,
          name: st.name,
          description: st.description,
          categories: {
            create: st.categories.map((cat) => ({
              name: cat.name,
              description: cat.description,
              services: {
                create: cat.services.map((svc) => ({
                  title: svc.title,
                  description: svc.description,
                  modalityLevel: svc.modalityLevel,
                  responseTime: svc.responseTime,
                  cost: svc.cost,
                  note: svc.note,
                  isActive: svc.isActive,
                  requirements: { create: svc.requirements },
                  requirementTabs: {
                    create: svc.requirementTabs.map((tab) => ({
                      tabName: tab.tabName,
                      title: tab.title,
                      sortOrder: tab.sortOrder,
                      items: { create: tab.items },
                    })),
                  },
                  periods: {
                    create: svc.periods.map((period) => ({
                      name: period.name,
                      sortOrder: period.sortOrder,
                      modalities: { create: period.modalities },
                    })),
                  },
                  manuals: { create: svc.manuals },
                })),
              },
            })),
          },
        },
      });
    }
  });

  const counts = {
    studentTypes: await prisma.studentType.count(),
    categories: await prisma.serviceCategory.count(),
    services: await prisma.service.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
