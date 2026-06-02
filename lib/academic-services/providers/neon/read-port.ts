import type { AcademicServicesReadPort } from '@/lib/academic-services/ports/academic-services-read';
import {
  mapServiceDetail,
  mapServiceListItem,
  serviceDetailInclude,
  serviceDetailIncludeLegacy,
} from '@/lib/academic-services/providers/neon/mappers';
import { prisma } from '@/lib/db';

type ServiceListRow = {
  id: number;
  title: string;
  result: 'GUIA' | 'TURNO';
  responseTime: string | null;
  cost: string | null;
  modalityLevel: string | null;
  status: 'draft' | 'published' | 'needs_review';
  isActive: boolean;
  sortOrder: number;
};

export class NeonReadProvider implements AcademicServicesReadPort {
  async listCategoriesWithActiveCounts() {
    type CategoryWithCount = {
      id: number;
      name: string;
      description: string | null;
      sortOrder: number;
      isActive: boolean;
      _count: { services: number };
    };

    const categories: CategoryWithCount[] = await prisma.serviceCategory.findMany({
      where: { isActive: true },
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
  }

  async getCategory(categoryId: number) {
    return prisma.serviceCategory.findFirst({
      where: { id: categoryId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
        isActive: true,
      },
    });
  }

  async listActiveServicesByCategoryId(categoryId: number) {
    const services = await prisma.service.findMany({
      where: { categoryId, status: 'published', isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        result: true,
        responseTime: true,
        cost: true,
        modalityLevel: true,
        status: true,
        isActive: true,
        sortOrder: true,
      },
    });
    return services.map((service: ServiceListRow) => mapServiceListItem(service));
  }

  async getActiveServiceDetail(categoryId: number, serviceId: number) {
    const where = {
      id: serviceId,
      categoryId,
      status: 'published' as const,
      isActive: true,
      category: { isActive: true },
    };
    const service = await findServiceWithGuidesFallback(
      () =>
        prisma.service.findFirst({
          where,
          include: serviceDetailInclude,
        }),
      () =>
        prisma.service.findFirst({
          where,
          include: serviceDetailIncludeLegacy,
        })
    );
    if (!service) return null;
    return {
      ...mapServiceDetail(service as never),
      categoryId: (service as { categoryId: number }).categoryId,
    };
  }

  async getPublicPortalCatalog() {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, description: true, sortOrder: true },
    });

    type ServiceWithCategoryId = ServiceListRow & { categoryId: number };
    const services: ServiceWithCategoryId[] = await prisma.service.findMany({
      where: {
        status: 'published',
        isActive: true,
        category: { isActive: true },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        id: true,
        title: true,
        result: true,
        responseTime: true,
        cost: true,
        modalityLevel: true,
        status: true,
        isActive: true,
        sortOrder: true,
        categoryId: true,
      },
    });

    return {
      categories,
      services: services.map((service) => ({
        ...mapServiceListItem(service),
        categoryId: service.categoryId,
      })),
    };
  }

  async getDashboardCounts() {
    const [categories, services, activeServices] = await Promise.all([
      prisma.serviceCategory.count(),
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true, status: 'published' } }),
    ]);
    return { categories, services, activeServices };
  }

  async listAllCategories() {
    const categories: Array<{
      id: number;
      name: string;
      description: string | null;
      sortOrder: number;
      isActive: boolean;
    }> = await prisma.serviceCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    }));
  }

  async listAllServices() {
    const rawServices = await prisma.service.findMany({
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { category: { select: { name: true } } },
    });
    const services: Array<never> = rawServices as never;
    return services.map((service) => ({
      ...mapServiceListItem(service),
      categoryId: (service as unknown as { categoryId: number }).categoryId,
      categoryName: (service as unknown as { category: { name: string } }).category.name,
    }));
  }

  async getServiceDetailForAdmin(serviceId: number) {
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
        })
    );
    if (!service) return null;
    return {
      ...mapServiceDetail(service as never),
      categoryId: (service as { categoryId: number }).categoryId,
      slug: (service as { slug: string }).slug,
    };
  }
}

async function findServiceWithGuidesFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
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
  return message.includes('Unknown field `guides`') && message.includes('ServiceRequirementTab');
}
