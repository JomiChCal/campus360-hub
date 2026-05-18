import type { AcademicServicesReadPort } from '@/lib/academic-services/ports/academic-services-read';
import {
  mapServiceDetail,
  mapServiceListItem,
  serviceDetailInclude,
  serviceDetailIncludeLegacy,
} from '@/lib/academic-services/providers/neon/mappers';
import { prisma } from '@/lib/db';

const studentTypeSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
} as const;

const serviceListSelect = {
  id: true,
  title: true,
  responseTime: true,
  cost: true,
  modalityLevel: true,
  status: true,
  isActive: true,
  sortOrder: true,
} as const;

export const neonReadPort: AcademicServicesReadPort = {
  async listStudentTypes() {
    return prisma.studentType.findMany({
      orderBy: { sortOrder: 'asc' },
      select: studentTypeSelect,
    });
  },

  async getStudentTypeByCode(code) {
    return prisma.studentType.findUnique({
      where: { code: code.trim().toUpperCase() },
      select: studentTypeSelect,
    });
  },

  async listCategoriesWithActiveCounts(studentTypeId) {
    const categories = await prisma.serviceCategory.findMany({
      where: { studentTypeId, isActive: true, studentType: { isActive: true } },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            services: {
              where: { status: 'published', isActive: true },
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      activeServiceCount: category._count.services,
    }));
  },

  async getCategoryForStudentType(studentTypeId, categoryId) {
    return prisma.serviceCategory.findFirst({
      where: { id: categoryId, studentTypeId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        studentTypeId: true,
        sortOrder: true,
        isActive: true,
      },
    });
  },

  async listActiveServicesByCategoryId(categoryId) {
    const services = await prisma.service.findMany({
      where: {
        categoryId,
        status: 'published',
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: serviceListSelect,
    });
    return services.map(mapServiceListItem);
  },

  async getActiveServiceDetail(categoryId, serviceId) {
    const where = {
      id: serviceId,
      categoryId,
      status: 'published' as const,
      isActive: true,
      category: { isActive: true, studentType: { isActive: true } },
    };
    const service = await findServiceWithGuidesFallback(() =>
      prisma.service.findFirst({
        where,
        include: serviceDetailInclude,
      }),
      () =>
        prisma.service.findFirst({
          where,
          include: serviceDetailIncludeLegacy,
        }),
    );
    return service ? mapServiceDetail(service) : null;
  },

  async getPublicPortalCatalog() {
    const studentTypes = await prisma.studentType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: studentTypeSelect,
    });

    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true, studentType: { isActive: true } },
      orderBy: [{ studentType: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        id: true,
        studentTypeId: true,
        name: true,
        description: true,
        sortOrder: true,
      },
    });

    const services = await prisma.service.findMany({
      where: {
        status: 'published',
        isActive: true,
        category: { isActive: true, studentType: { isActive: true } },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        ...serviceListSelect,
        categoryId: true,
        category: { select: { studentTypeId: true } },
      },
    });

    return {
      studentTypes,
      categories,
      services: services.map((service) => ({
        ...mapServiceListItem(service),
        categoryId: service.categoryId,
        studentTypeId: service.category.studentTypeId,
      })),
    };
  },

  async getDashboardCounts() {
    const [studentTypes, categories, services, activeServices] = await Promise.all([
      prisma.studentType.count(),
      prisma.serviceCategory.count(),
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true, status: 'published' } }),
    ]);
    return { studentTypes, categories, services, activeServices };
  },

  async listAllCategories() {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: [{ studentType: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { studentType: { select: { code: true, name: true } } },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      studentTypeId: category.studentTypeId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      studentTypeCode: category.studentType.code,
      studentTypeName: category.studentType.name,
    }));
  },

  async listAllServices() {
    const services = await prisma.service.findMany({
      orderBy: [{ category: { studentType: { sortOrder: 'asc' } } }, { sortOrder: 'asc' }],
      include: { category: { select: { id: true, studentTypeId: true } } },
    });
    return services.map((service) => ({
      ...mapServiceListItem(service),
      categoryId: service.categoryId,
      studentTypeId: service.category.studentTypeId,
    }));
  },

  async getServiceDetailForAdmin(serviceId) {
    const service = await findServiceWithGuidesFallback(
      () =>
        prisma.service.findUnique({
          where: { id: serviceId },
          include: serviceDetailInclude,
        }),
      () =>
        prisma.service.findUnique({
          where: { id: serviceId },
          include: serviceDetailIncludeLegacy,
        }),
    );
    if (!service) return null;
    return {
      ...mapServiceDetail(service),
      categoryId: service.categoryId,
      slug: service.slug,
    };
  },
};

async function findServiceWithGuidesFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (isGuidesIncludeValidationError(error)) {
      return fallback();
    }
    throw error;
  }
}

function isGuidesIncludeValidationError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('message' in error)) return false;
  const message = String(error.message);
  return (
    message.includes('Unknown field `guides`') &&
    message.includes('ServiceRequirementTab')
  );
}
