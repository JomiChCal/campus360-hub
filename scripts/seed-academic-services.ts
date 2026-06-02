import { serviceCatalog } from '../data/services';
import { prisma } from '../lib/db';

async function main() {
  console.log('Seeding academic services...');

  await prisma.serviceManual.deleteMany();
  await prisma.servicePeriodModality.deleteMany();
  await prisma.servicePeriod.deleteMany();
  await prisma.serviceRequirementItem.deleteMany();
  await prisma.serviceRequirementTabGuide.deleteMany();
  await prisma.serviceRequirementTab.deleteMany();
  await prisma.serviceRequirement.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();

  console.log('Cleaned existing data.');

  const categoryMap = new Map<string, number>();

  for (const [index, category] of serviceCatalog.entries()) {
    const created = await prisma.serviceCategory.create({
      data: {
        slug: category.id,
        name: category.title,
        description: null,
        sortOrder: index,
        isActive: true,
      },
    });
    categoryMap.set(category.id, created.id);
    console.log(`  Created category: ${category.title}`);
  }

  for (const category of serviceCatalog) {
    const categoryId = categoryMap.get(category.id);
    if (!categoryId) continue;

    for (const [index, service] of category.services.entries()) {
      await prisma.service.create({
        data: {
          sourceKey: `seed-${category.id}-${service.id}`,
          title: service.label,
          slug: service.id,
          description: null,
          status: 'published',
          isActive: true,
          sortOrder: index,
          result: service.result,
          categoryId,
        },
      });
    }
    console.log(`  Created ${category.services.length} services for ${category.title}`);
  }

  const categoryCount = await prisma.serviceCategory.count();
  const serviceCount = await prisma.service.count();
  console.log(`\nSeed complete! ${categoryCount} categories, ${serviceCount} services`);
}

main().catch(console.error);
