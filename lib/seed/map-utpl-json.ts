import type { UtplServicesJson } from './types';

export type SeedRequirement = { text: string; sortOrder: number };
export type SeedRequirementItem = { text: string; pdfUrl: string | null; sortOrder: number };
export type SeedRequirementTab = {
  tabName: string;
  title: string | null;
  sortOrder: number;
  items: SeedRequirementItem[];
  guides: Array<{ label: string; url: string; sortOrder: number }>;
};
export type SeedPeriodModality = {
  modality: string;
  requestWindow: string | null;
  responseWindow: string | null;
  enabledFrom: string | null;
  enabledTo: string | null;
  sortOrder: number;
};
export type SeedPeriod = {
  name: string;
  sortOrder: number;
  modalities: SeedPeriodModality[];
};
export type SeedManual = { label: string; url: string; sortOrder: number };
export type SeedService = {
  sourceKey: string;
  sourceRowIndex: number | null;
  title: string;
  description: string | null;
  programs: string[];
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  calendarText: string | null;
  status: 'draft' | 'published' | 'needs_review';
  sortOrder: number;
  isActive: boolean;
  requirements: SeedRequirement[];
  requirementTabs: SeedRequirementTab[];
  periods: SeedPeriod[];
  manuals: SeedManual[];
};
export type SeedCategory = {
  name: string;
  description: string | null;
  sortOrder: number;
  services: SeedService[];
};
export type SeedStudentType = {
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  categories: SeedCategory[];
};

function requireSourceKey(service: { sourceKey?: string; title: string }, index: number): string {
  if (service.sourceKey?.trim()) return service.sourceKey.trim();
  return `legacy-${service.title}-${index}`;
}

export function mapUtplJsonToSeedPayload(json: UtplServicesJson): SeedStudentType[] {
  return json.studentTypes.map((st, stIndex) => ({
    code: st.code.trim().toUpperCase(),
    name: st.name.trim(),
    description: st.description?.trim() ?? null,
    sortOrder: st.sortOrder ?? stIndex,
    categories: st.categories.map((cat, catIndex) => ({
      name: cat.name.trim(),
      description: cat.description?.trim() ?? null,
      sortOrder: cat.sortOrder ?? catIndex,
      services: cat.services.map((svc, svcIndex) => ({
        sourceKey: requireSourceKey(svc, svcIndex),
        sourceRowIndex: svc.sourceRowIndex ?? null,
        title: svc.title.trim(),
        description: svc.description?.trim() ?? null,
        programs: (svc.programs ?? []).map((program) => program.trim()).filter(Boolean),
        modalityLevel: svc.modalityLevel?.trim() ?? null,
        responseTime: svc.responseTime?.trim() ?? null,
        cost: svc.cost?.trim() ?? null,
        note: svc.note?.trim() ?? null,
        calendarText: svc.calendarText?.trim() ?? null,
        status: svc.status ?? 'draft',
        sortOrder: svc.sortOrder ?? svcIndex,
        isActive: svc.isActive ?? true,
        requirements: (svc.requirements ?? []).map((text, index) => ({
          text: text.trim(),
          sortOrder: index,
        })),
        requirementTabs: (svc.requirementTabs ?? []).map((tab, tabIndex) => ({
          tabName: tab.tabName.trim(),
          title: tab.title?.trim() ?? null,
          sortOrder: tabIndex,
          items: tab.items.map((item, itemIndex) => ({
            text: item.text.trim(),
            pdfUrl: item.pdfUrl?.trim() ?? null,
            sortOrder: itemIndex,
          })),
          guides: (tab.guides ?? []).map((guide, guideIndex) => ({
            label: guide.label.trim(),
            url: guide.url.trim(),
            sortOrder: guideIndex,
          })),
        })),
        periods: (svc.periods ?? []).map((period, periodIndex) => ({
          name: period.name.trim(),
          sortOrder: periodIndex,
          modalities: period.modalities.map((mod, modIndex) => ({
            modality: mod.modality.trim(),
            requestWindow: mod.requestWindow?.trim() ?? null,
            responseWindow: mod.responseWindow?.trim() ?? null,
            enabledFrom: mod.enabledFrom?.trim() ?? null,
            enabledTo: mod.enabledTo?.trim() ?? null,
            sortOrder: modIndex,
          })),
        })),
        manuals: (svc.manuals ?? []).map((manual, manualIndex) => ({
          label: manual.label.trim(),
          url: manual.url.trim(),
          sortOrder: manualIndex,
        })),
      })),
    })),
  }));
}
