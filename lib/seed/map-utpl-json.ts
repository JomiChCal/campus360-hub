import type { UtplServicesJson } from './types';

export type SeedRequirement = { text: string; sortOrder: number };
export type SeedRequirementItem = { text: string; pdfUrl: string | null; sortOrder: number };
export type SeedRequirementTab = {
  tabName: string;
  title: string | null;
  sortOrder: number;
  items: SeedRequirementItem[];
};
export type SeedPeriodModality = {
  modality: string;
  requestWindow: string | null;
  responseWindow: string | null;
  sortOrder: number;
};
export type SeedPeriod = {
  name: string;
  sortOrder: number;
  modalities: SeedPeriodModality[];
};
export type SeedManual = { label: string; url: string; sortOrder: number };
export type SeedService = {
  title: string;
  description: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  isActive: boolean;
  requirements: SeedRequirement[];
  requirementTabs: SeedRequirementTab[];
  periods: SeedPeriod[];
  manuals: SeedManual[];
};
export type SeedCategory = {
  name: string;
  description: string | null;
  services: SeedService[];
};
export type SeedStudentType = {
  code: string;
  name: string;
  description: string | null;
  categories: SeedCategory[];
};

export function mapUtplJsonToSeedPayload(json: UtplServicesJson): SeedStudentType[] {
  return json.studentTypes.map((st) => ({
    code: st.code.trim().toUpperCase(),
    name: st.name.trim(),
    description: st.description?.trim() ?? null,
    categories: st.categories.map((cat) => ({
      name: cat.name.trim(),
      description: cat.description?.trim() ?? null,
      services: cat.services.map((svc) => ({
        title: svc.title.trim(),
        description: svc.description?.trim() ?? null,
        modalityLevel: svc.modalityLevel?.trim() ?? null,
        responseTime: svc.responseTime?.trim() ?? null,
        cost: svc.cost?.trim() ?? null,
        note: svc.note?.trim() ?? null,
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
        })),
        periods: (svc.periods ?? []).map((period, periodIndex) => ({
          name: period.name.trim(),
          sortOrder: periodIndex,
          modalities: period.modalities.map((mod, modIndex) => ({
            modality: mod.modality.trim(),
            requestWindow: mod.requestWindow?.trim() ?? null,
            responseWindow: mod.responseWindow?.trim() ?? null,
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
