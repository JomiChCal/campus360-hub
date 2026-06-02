import { randomUUID } from 'node:crypto';

import type { AcademicServicesWritePort } from '@/lib/academic-services/ports/academic-services-write';
import { prisma } from '@/lib/db';

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 120);
}

function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

export class NeonWriteProvider implements AcademicServicesWritePort {
  async createCategory(input: { name: string; description: string | null; isActive: boolean }) {
    const created = await prisma.serviceCategory.create({
      data: {
        name: input.name,
        slug: slugify(input.name),
        description: input.description,
        isActive: input.isActive,
      },
    });
    return { id: created.id };
  }

  async updateCategory(
    id: number,
    input: { name: string; description: string | null; isActive: boolean }
  ) {
    await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: input.name,
        slug: slugify(input.name),
        description: input.description,
        isActive: input.isActive,
      },
    });
  }

  async deleteCategory(id: number) {
    const serviceCount = await prisma.service.count({ where: { categoryId: id } });
    if (serviceCount > 0) {
      throw new Error('No se puede eliminar una categoría con servicios asociados.');
    }
    await prisma.serviceCategory.delete({ where: { id } });
  }

  async upsertService(input: {
    id?: number;
    categoryId: number;
    title: string;
    slug: string;
    description: string | null;
    programs: string[];
    sourceRowIndex?: number | null;
    sortOrder?: number;
    modalityLevel: string | null;
    responseTime: string | null;
    cost: string | null;
    note: string | null;
    calendarText: string | null;
    status: 'draft' | 'published' | 'needs_review';
    isActive: boolean;
    result: 'GUIA' | 'TURNO';
    requirements: Array<{ text: string; sortOrder: number }>;
    requirementTabs: Array<{
      tabName: string;
      title: string | null;
      sortOrder: number;
      items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
      guides: Array<{ label: string; url: string; sortOrder: number }>;
    }>;
    periods: Array<{
      name: string;
      sortOrder: number;
      modalities: Array<{
        modality: string;
        requestWindow: string | null;
        responseWindow: string | null;
        enabledFrom: string | null;
        enabledTo: string | null;
        sortOrder: number;
      }>;
    }>;
    manuals: Array<{ label: string; url: string; sortOrder: number }>;
  }) {
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
      result: input.result,
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
      await prisma.$transaction(async (tx: any) => {
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
  }

  async deleteService(id: number) {
    await prisma.service.delete({ where: { id } });
  }
}
