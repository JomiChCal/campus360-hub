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

  assert(counts.studentTypes >= 4, 'Expected at least 4 active student types');
  assert(counts.categories >= 6, 'Expected at least 6 active categories');
  assert(counts.servicesDb >= 10, 'Expected at least 10 services');
  assert(counts.publishedActive >= 6, 'Expected at least 6 published active services');
  assert(counts.servicesWithCost > 0, 'Expected services with cost');
  assert(counts.servicesWithoutCost > 0, 'Expected services without cost');
  assert(counts.servicesWithModality > 0, 'Expected services with modality');
  assert(counts.servicesWithoutModality > 0, 'Expected services without modality');
  assert(counts.servicesWithRequirements > 0, 'Expected services with requirements');
  assert(counts.servicesWithoutRequirements > 0, 'Expected services without requirements');
  assert(counts.servicesWithManyGuides > 0, 'Expected services with many guides (3+)');
  assert(counts.servicesWithFewGuides > 0, 'Expected services with few guides (1-2)');
  assert(counts.servicesWithPeriods > 0, 'Expected services with periods');
  assert(counts.servicesWithoutPeriods > 0, 'Expected services without periods');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
