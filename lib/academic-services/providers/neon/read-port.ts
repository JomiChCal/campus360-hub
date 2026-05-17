import type { AcademicServicesReadPort } from '@/lib/academic-services/ports/academic-services-read';
import {
  mapServiceDetail,
  mapServiceListItem,
  serviceDetailInclude,
} from '@/lib/academic-services/providers/neon/mappers';
import { prisma } from '@/lib/db';

export const neonReadPort: AcademicServicesReadPort = {
  async listStudentTypes() {
    return prisma.studentType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, description: true },
    });
  },

  async getStudentTypeByCode(code) {
    return prisma.studentType.findUnique({
      where: { code: code.trim().toUpperCase() },
      select: { id: true, code: true, name: true, description: true },
    });
  },

  async listCategoriesWithActiveCounts(studentTypeId) {
    const categories = await prisma.serviceCategory.findMany({
      where: { studentTypeId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { services: { where: { isActive: true } } },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      activeServiceCount: category._count.services,
    }));
  },

  async getCategoryForStudentType(studentTypeId, categoryId) {
    return prisma.serviceCategory.findFirst({
      where: { id: categoryId, studentTypeId },
      select: {
        id: true,
        name: true,
        description: true,
        studentTypeId: true,
      },
    });
  },

  async listActiveServicesByCategoryId(categoryId) {
    const services = await prisma.service.findMany({
      where: { categoryId, isActive: true },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        responseTime: true,
        cost: true,
        modalityLevel: true,
      },
    });
    return services.map(mapServiceListItem);
  },

  async getActiveServiceDetail(categoryId, serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, categoryId, isActive: true },
      include: serviceDetailInclude,
    });
    return service ? mapServiceDetail(service) : null;
  },

  async getPublicPortalCatalog() {
    const studentTypes = await prisma.studentType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, description: true },
    });

    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        studentTypeId: true,
        name: true,
        description: true,
      },
    });

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        responseTime: true,
        cost: true,
        modalityLevel: true,
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
      prisma.service.count({ where: { isActive: true } }),
    ]);
    return { studentTypes, categories, services, activeServices };
  },

  async listAllCategories() {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: [{ studentType: { name: 'asc' } }, { name: 'asc' }],
      include: { studentType: { select: { code: true, name: true } } },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      studentTypeId: category.studentTypeId,
      studentTypeCode: category.studentType.code,
      studentTypeName: category.studentType.name,
    }));
  },

  async listAllServices() {
    const services = await prisma.service.findMany({
      orderBy: { title: 'asc' },
      include: { category: { select: { id: true, studentTypeId: true } } },
    });
    return services.map((service) => ({
      ...mapServiceListItem(service),
      categoryId: service.categoryId,
      studentTypeId: service.category.studentTypeId,
      isActive: service.isActive,
    }));
  },

  async getServiceDetailForAdmin(serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: serviceDetailInclude,
    });
    return service ? mapServiceDetail(service) : null;
  },
};
