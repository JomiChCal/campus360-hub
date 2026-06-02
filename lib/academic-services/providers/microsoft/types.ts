import type {
  CategorySummary,
  ServiceListItem,
  StudentTypeSummary,
} from '@/lib/academic-services/ports/academic-services-read';

export type MicrosoftPrototypeService = ServiceListItem & {
  categoryId: number;
  studentTypeId: number;
  slug: string;
  description: string | null;
  programs: string[];
  note: string | null;
  calendarText: string | null;
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
};

export type MicrosoftPrototypeData = {
  studentTypes: StudentTypeSummary[];
  categories: CategorySummary[];
  services: MicrosoftPrototypeService[];
};

export const EMPTY_MICROSOFT_CATALOG: MicrosoftPrototypeData = {
  studentTypes: [],
  categories: [],
  services: [],
};
