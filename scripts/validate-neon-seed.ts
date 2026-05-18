import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { neonReadPort } from '../lib/academic-services/providers/neon/read-port';
import { prisma } from '../lib/db';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  if (process.env.ACADEMIC_SERVICES_DATA_PROVIDER !== 'neon') {
    throw new Error('validate-neon-seed requires ACADEMIC_SERVICES_DATA_PROVIDER=neon');
  }

  const [catalog, adminServices, adminCategories, studentTypes] = await Promise.all([
    neonReadPort.getPublicPortalCatalog(),
    neonReadPort.listAllServices(),
    neonReadPort.listAllCategories(),
    neonReadPort.listStudentTypes(),
  ]);

  const services = await prisma.service.findMany({
    include: {
      category: { select: { id: true, studentTypeId: true, isActive: true } },
      requirementTabs: { include: { guides: true } },
      periods: { include: { modalities: true } },
      manuals: true,
      requirements: true,
    },
  });

  const publishedActive = services.filter(
    (service) => service.status === 'published' && service.isActive && service.category.isActive,
  );

  const servicesWithCost = services.filter((service) => Boolean(service.cost?.trim()));
  const servicesWithoutCost = services.filter((service) => !service.cost?.trim());
  const servicesWithModality = services.filter((service) => Boolean(service.modalityLevel?.trim()));
  const servicesWithoutModality = services.filter((service) => !service.modalityLevel?.trim());
  const servicesWithRequirements = services.filter((service) => service.requirements.length > 0);
  const servicesWithoutRequirements = services.filter((service) => service.requirements.length === 0);
  const servicesWithManyGuides = services.filter(
    (service) =>
      service.requirementTabs.reduce((acc, tab) => acc + tab.guides.length, 0) >= 3,
  );
  const servicesWithFewGuides = services.filter(
    (service) => {
      const guideCount = service.requirementTabs.reduce((acc, tab) => acc + tab.guides.length, 0);
      return guideCount > 0 && guideCount < 3;
    },
  );
  const servicesWithPeriods = services.filter((service) => service.periods.length > 0);
  const servicesWithoutPeriods = services.filter((service) => service.periods.length === 0);

  const publicById = new Map(catalog.services.map((service) => [service.id, service]));
  const adminById = new Map(adminServices.map((service) => [service.id, service]));

  for (const service of catalog.services) {
    const admin = adminById.get(service.id);
    assert(Boolean(admin), `Public service ${service.id} is missing from admin list`);
    assert(admin?.categoryId === service.categoryId, `Category mismatch on service ${service.id}`);
    assert(
      admin?.studentTypeId === service.studentTypeId,
      `Student type mismatch on service ${service.id}`,
    );
    assert(admin?.title === service.title, `Title mismatch on service ${service.id}`);
  }

  for (const service of publishedActive) {
    assert(publicById.has(service.id), `Published active service ${service.id} missing in public catalog`);
  }

  const counts = {
    studentTypes: studentTypes.length,
    categories: adminCategories.length,
    servicesDb: services.length,
    servicesAdminList: adminServices.length,
    servicesPublicList: catalog.services.length,
    publishedActive: publishedActive.length,
    servicesWithCost: servicesWithCost.length,
    servicesWithoutCost: servicesWithoutCost.length,
    servicesWithModality: servicesWithModality.length,
    servicesWithoutModality: servicesWithoutModality.length,
    servicesWithRequirements: servicesWithRequirements.length,
    servicesWithoutRequirements: servicesWithoutRequirements.length,
    servicesWithManyGuides: servicesWithManyGuides.length,
    servicesWithFewGuides: servicesWithFewGuides.length,
    servicesWithPeriods: servicesWithPeriods.length,
    servicesWithoutPeriods: servicesWithoutPeriods.length,
  };

  console.log(JSON.stringify(counts, null, 2));

  const reportRaw = await readFile(
    path.join(process.cwd(), 'data/utpl-portal-import-report.json'),
    'utf8',
  );
  const report = JSON.parse(reportRaw) as {
    discardedRowDetails: Array<{ reason: string }>;
  };

  assert(counts.studentTypes >= 4, 'Expected at least 4 active student types');
  assert(counts.servicesPublicList > 0, 'Expected public services after ETL');
  assert(
    counts.servicesDb >= counts.servicesPublicList,
    'DB services must include public services',
  );
  assert(
    report.discardedRowDetails.every((row) => row.reason === 'missing-valid-student-type'),
    'Discard policy violation: found discard reasons other than missing-valid-student-type',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
