import { groupRequirementTabsByName } from '@/lib/academic-services/domain/grouping';
import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';
import type { ServiceListItem } from '@/lib/academic-services/ports/academic-services-read';

type ServiceWithRelations = {
  id: number;
  title: string;
  result: 'GUIA' | 'TURNO';
  category?: { name: string } | null;
  description: string | null;
  programs: string[];
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  calendarText: string | null;
  status: 'draft' | 'published' | 'needs_review';
  isActive: boolean;
  requirements: Array<{ text: string; sortOrder: number }>;
  requirementTabs: Array<{
    tabName: string;
    title: string | null;
    sortOrder: number;
    items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
    guides?: Array<{ label: string; url: string; sortOrder: number }>;
  }>;
  periods: Array<{
    name: string;
    sortOrder: number;
    modalities: Array<{
      modality: string;
      requestWindow: string | null;
      responseWindow: string | null;
      enabledFrom: Date | null;
      enabledTo: Date | null;
      sortOrder: number;
    }>;
  }>;
  manuals: Array<{ label: string; url: string; sortOrder: number }>;
};

export function mapServiceListItem(service: {
  id: number;
  title: string;
  result: 'GUIA' | 'TURNO';
  responseTime: string | null;
  cost: string | null;
  modalityLevel: string | null;
  status: 'draft' | 'published' | 'needs_review';
  isActive: boolean;
  sortOrder: number;
}): ServiceListItem {
  return {
    id: service.id,
    title: service.title,
    result: service.result,
    responseTime: service.responseTime,
    cost: service.cost,
    modalityLevel: service.modalityLevel,
    status: service.status,
    isActive: service.isActive,
    sortOrder: service.sortOrder,
  };
}

export function mapServiceDetail(service: ServiceWithRelations): ServiceDetail {
  const { modality, level } = splitModalityAndLevel(service.modalityLevel);

  return {
    id: service.id,
    title: service.title,
    categoryId: 0,
    categoryName: service.category?.name ?? null,
    description: service.description,
    programs: service.programs ?? [],
    modality,
    level,
    modalityLevel: service.modalityLevel,
    responseTime: service.responseTime,
    cost: service.cost,
    note: service.note,
    calendarText: service.calendarText,
    status: service.status,
    result: service.result,
    isActive: service.isActive,
    requirements: service.requirements.toSorted((a, b) => a.sortOrder - b.sortOrder),
    requirementTabs: groupRequirementTabsByName(service.requirementTabs),
    periods: service.periods
      .toSorted((a, b) => a.sortOrder - b.sortOrder)
      .map((period) => ({
        name: period.name,
        sortOrder: period.sortOrder,
        modalities: period.modalities
          .toSorted((a, b) => a.sortOrder - b.sortOrder)
          .map((modality) => ({
            modality: modality.modality,
            requestWindow: modality.requestWindow,
            responseWindow: modality.responseWindow,
            enabledFrom: formatDateOnly(modality.enabledFrom),
            enabledTo: formatDateOnly(modality.enabledTo),
            sortOrder: modality.sortOrder,
          })),
      })),
    manuals: service.manuals.toSorted((a, b) => a.sortOrder - b.sortOrder),
  };
}

export const serviceDetailInclude = {
  category: { select: { name: true } },
  requirements: { orderBy: { sortOrder: 'asc' as const } },
  requirementTabs: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      items: { orderBy: { sortOrder: 'asc' as const } },
      guides: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  periods: {
    orderBy: { sortOrder: 'asc' as const },
    include: { modalities: { orderBy: { sortOrder: 'asc' as const } } },
  },
  manuals: { orderBy: { sortOrder: 'asc' as const } },
};

export const serviceDetailIncludeLegacy = {
  category: { select: { name: true } },
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

function formatDateOnly(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function splitModalityAndLevel(modalityLevel: string | null) {
  if (!modalityLevel) {
    return { modality: null, level: null };
  }

  const normalized = modalityLevel.replaceAll(/\s+/g, ' ').trim();
  if (!normalized) {
    return { modality: null, level: null };
  }

  const [leftRaw, rightRaw] = normalized.split(/—|-/);
  const left = leftRaw
    ?.replace(/^modalidad\s*(y\s*nivel\s*de\s*estudios?)?\s*:?\s*/i, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
  const right = rightRaw
    ?.replace(/^nivel\s*/i, '')
    .replaceAll(/\s+/g, ' ')
    .trim();

  return {
    modality: left && left.length > 0 ? left : null,
    level: right && right.length > 0 ? right : null,
  };
}
