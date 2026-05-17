import { groupRequirementTabsByName } from '@/lib/academic-services/domain/grouping';
import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';
import type { ServiceListItem } from '@/lib/academic-services/ports/academic-services-read';

type ServiceWithRelations = {
  id: number;
  title: string;
  description: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  requirements: Array<{ text: string; sortOrder: number }>;
  requirementTabs: Array<{
    tabName: string;
    title: string | null;
    sortOrder: number;
    items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
  }>;
  periods: Array<{
    name: string;
    sortOrder: number;
    modalities: Array<{
      modality: string;
      requestWindow: string | null;
      responseWindow: string | null;
      sortOrder: number;
    }>;
  }>;
  manuals: Array<{ label: string; url: string; sortOrder: number }>;
};

export function mapServiceListItem(service: {
  id: number;
  title: string;
  responseTime: string | null;
  cost: string | null;
  modalityLevel: string | null;
}): ServiceListItem {
  return {
    id: service.id,
    title: service.title,
    responseTime: service.responseTime,
    cost: service.cost,
    modalityLevel: service.modalityLevel,
  };
}

export function mapServiceDetail(service: ServiceWithRelations): ServiceDetail {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    modalityLevel: service.modalityLevel,
    responseTime: service.responseTime,
    cost: service.cost,
    note: service.note,
    requirements: [...service.requirements].sort((a, b) => a.sortOrder - b.sortOrder),
    requirementTabs: groupRequirementTabsByName(service.requirementTabs),
    periods: [...service.periods]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((period) => ({
        name: period.name,
        sortOrder: period.sortOrder,
        modalities: [...period.modalities].sort((a, b) => a.sortOrder - b.sortOrder),
      })),
    manuals: [...service.manuals].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export const serviceDetailInclude = {
  requirements: { orderBy: { sortOrder: 'asc' as const } },
  requirementTabs: {
    orderBy: { sortOrder: 'asc' as const },
    include: { items: { orderBy: { sortOrder: 'asc' as const } } },
  },
  periods: {
    orderBy: { sortOrder: 'asc' as const },
    include: { modalities: { orderBy: { sortOrder: 'asc' as const } } },
  },
  manuals: { orderBy: { sortOrder: 'asc' as const } },
};
