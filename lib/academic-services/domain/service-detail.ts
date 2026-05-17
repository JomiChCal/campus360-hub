export type RequirementItem = {
  text: string;
  pdfUrl: string | null;
  sortOrder: number;
};

export type RequirementTabBlock = {
  title: string | null;
  items: RequirementItem[];
};

export type GroupedRequirementTab = {
  tabName: string;
  blocks: RequirementTabBlock[];
};

export type PeriodModality = {
  modality: string;
  requestWindow: string | null;
  responseWindow: string | null;
  sortOrder: number;
};

export type ServicePeriod = {
  name: string;
  sortOrder: number;
  modalities: PeriodModality[];
};

export type ServiceManual = {
  label: string;
  url: string;
  sortOrder: number;
};

export type ServiceRequirement = {
  text: string;
  sortOrder: number;
};

export type ServiceDetail = {
  id: number;
  title: string;
  description: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  requirements: ServiceRequirement[];
  requirementTabs: GroupedRequirementTab[];
  periods: ServicePeriod[];
  manuals: ServiceManual[];
};
