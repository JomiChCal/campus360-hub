import { randomUUID } from 'node:crypto';

import type { AcademicServicesWritePort } from '@/lib/academic-services/ports/academic-services-write';
import {
  mapServiceDetail,
  serviceDetailInclude,
  serviceDetailIncludeLegacy,
} from '@/lib/academic-services/providers/neon/mappers';
import { prisma } from '@/lib/db';

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

export const neonWritePort: AcademicServicesWritePort = {
  async createStudentType(input) {
    const created = await prisma.studentType.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
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
        isActive: input.isActive,
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
        slug: slugify(input.name),
        description: input.description,
        isActive: input.isActive,
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
        slug: slugify(input.name),
        description: input.description,
        isActive: input.isActive,
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
      slug: input.slug || slugify(input.title),
      description: input.description,
      programs: input.programs,
      sourceRowIndex: input.sourceRowIndex ?? null,
      sortOrder: input.sortOrder ?? 0,
      modalityLevel: input.modalityLevel,
      responseTime: input.responseTime,
      cost: input.cost,
      note: input.note,
      calendarText: input.calendarText,
      status: input.status,
      isActive: input.isActive,
      categoryId: input.categoryId,
      requirements: { create: input.requirements },
      requirementTabs: {
        create: input.requirementTabs.map((tab) => ({
          tabName: tab.tabName,
          title: tab.title,
          sortOrder: tab.sortOrder,
          items: { create: tab.items },
          guides: { create: tab.guides },
        })),
      },
      periods: {
        create: input.periods.map((period) => ({
          name: period.name,
          sortOrder: period.sortOrder,
          modalities: {
            create: period.modalities.map((modality) => ({
              modality: modality.modality,
              requestWindow: modality.requestWindow,
              responseWindow: modality.responseWindow,
              enabledFrom: parseDateOnly(modality.enabledFrom),
              enabledTo: parseDateOnly(modality.enabledTo),
              sortOrder: modality.sortOrder,
            })),
          },
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
        await tx.serviceRequirementTabGuide.deleteMany({
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

    const created = await prisma.service.create({
      data: {
        ...nestedData,
        sourceKey: `admin-${randomUUID()}`,
      },
    });
    return { id: created.id };
  },

  async deleteService(id) {
    await prisma.service.delete({ where: { id } });
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
    return service ? mapServiceDetail(service) : null;
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
