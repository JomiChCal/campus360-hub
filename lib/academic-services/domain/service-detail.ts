export type RequirementItem = {
  text: string;
  pdfUrl: string | null;
  sortOrder: number;
};

export type RequirementGuide = {
  label: string;
  url: string;
  sortOrder: number;
};

export type RequirementTabBlock = {
  title: string | null;
  items: RequirementItem[];
  guides: RequirementGuide[];
};

export type GroupedRequirementTab = {
  tabName: string;
  blocks: RequirementTabBlock[];
};

export type PeriodModality = {
  modality: string;
  requestWindow: string | null;
  responseWindow: string | null;
  enabledFrom: string | null;
  enabledTo: string | null;
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

export type ServiceStatus = 'draft' | 'published' | 'needs_review';

export type ServiceDetail = {
  id: number;
  title: string;
  categoryName: string | null;
  description: string | null;
  programs: string[];
  modality: string | null;
  level: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  calendarText: string | null;
  status: ServiceStatus;
  isActive: boolean;
  requirements: ServiceRequirement[];
  requirementTabs: GroupedRequirementTab[];
  periods: ServicePeriod[];
  manuals: ServiceManual[];
};
