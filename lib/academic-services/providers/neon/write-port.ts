import type { AcademicServicesWritePort } from '@/lib/academic-services/ports/academic-services-write';
import { mapServiceDetail, serviceDetailInclude } from '@/lib/academic-services/providers/neon/mappers';
import { prisma } from '@/lib/db';

export const neonWritePort: AcademicServicesWritePort = {
  async createStudentType(input) {
    const created = await prisma.studentType.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
      },
    });
    return { id: created.id };
  },

  async updateStudentType(id, input) {
    await prisma.studentType.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
      },
    });
  },

  async deleteStudentType(id) {
    const categoryCount = await prisma.serviceCategory.count({ where: { studentTypeId: id } });
    if (categoryCount > 0) {
      throw new Error('No se puede eliminar un tipo de estudiante con categorías asociadas.');
    }
    await prisma.studentType.delete({ where: { id } });
  },

  async createCategory(input) {
    const created = await prisma.serviceCategory.create({
      data: {
        studentTypeId: input.studentTypeId,
        name: input.name,
        description: input.description,
      },
    });
    return { id: created.id };
  },

  async updateCategory(id, input) {
    await prisma.serviceCategory.update({
      where: { id },
      data: {
        studentTypeId: input.studentTypeId,
        name: input.name,
        description: input.description,
      },
    });
  },

  async deleteCategory(id) {
    const serviceCount = await prisma.service.count({ where: { categoryId: id } });
    if (serviceCount > 0) {
      throw new Error('No se puede eliminar una categoría con servicios asociados.');
    }
    await prisma.serviceCategory.delete({ where: { id } });
  },

  async upsertService(input) {
    const nestedData = {
      title: input.title,
      description: input.description,
      modalityLevel: input.modalityLevel,
      responseTime: input.responseTime,
      cost: input.cost,
      note: input.note,
      isActive: input.isActive,
      categoryId: input.categoryId,
      requirements: { create: input.requirements },
      requirementTabs: {
        create: input.requirementTabs.map((tab) => ({
          tabName: tab.tabName,
          title: tab.title,
          sortOrder: tab.sortOrder,
          items: { create: tab.items },
        })),
      },
      periods: {
        create: input.periods.map((period) => ({
          name: period.name,
          sortOrder: period.sortOrder,
          modalities: { create: period.modalities },
        })),
      },
      manuals: { create: input.manuals },
    };

    if (input.id) {
      await prisma.$transaction(async (tx) => {
        await tx.serviceManual.deleteMany({ where: { serviceId: input.id } });
        await tx.servicePeriodModality.deleteMany({
          where: { period: { serviceId: input.id } },
        });
        await tx.servicePeriod.deleteMany({ where: { serviceId: input.id } });
        await tx.serviceRequirementItem.deleteMany({
          where: { tab: { serviceId: input.id } },
        });
        await tx.serviceRequirementTab.deleteMany({ where: { serviceId: input.id } });
        await tx.serviceRequirement.deleteMany({ where: { serviceId: input.id } });

        await tx.service.update({
          where: { id: input.id },
          data: nestedData,
        });
      });
      return { id: input.id };
    }

    const created = await prisma.service.create({ data: nestedData });
    return { id: created.id };
  },

  async deleteService(id) {
    await prisma.service.delete({ where: { id } });
  },

  async getServiceDetailForAdmin(serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: serviceDetailInclude,
    });
    return service ? mapServiceDetail(service) : null;
  },
};
