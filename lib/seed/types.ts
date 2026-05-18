export type UtplRequirementItem = {
  text: string;
  pdfUrl?: string | null;
};

export type UtplRequirementTab = {
  tabName: string;
  title?: string | null;
  items: UtplRequirementItem[];
  guides?: Array<{ label: string; url: string }>;
};

export type UtplPeriodModality = {
  modality: string;
  requestWindow?: string | null;
  responseWindow?: string | null;
  enabledFrom?: string | null;
  enabledTo?: string | null;
};

export type UtplPeriod = {
  name: string;
  modalities: UtplPeriodModality[];
};

export type UtplManual = {
  label: string;
  url: string;
};

export type UtplService = {
  sourceKey?: string;
  sourceRowIndex?: number;
  title: string;
  description?: string | null;
  programs?: string[];
  modalityLevel?: string | null;
  responseTime?: string | null;
  cost?: string | null;
  note?: string | null;
  calendarText?: string | null;
  status?: 'draft' | 'published' | 'needs_review';
  isActive?: boolean;
  sortOrder?: number;
  requirements?: string[];
  requirementTabs?: UtplRequirementTab[];
  periods?: UtplPeriod[];
  manuals?: UtplManual[];
};

export type UtplCategory = {
  name: string;
  description?: string | null;
  sortOrder?: number;
  services: UtplService[];
};

export type UtplStudentType = {
  code: string;
  name: string;
  description?: string | null;
  sortOrder?: number;
  categories: UtplCategory[];
};

export type UtplServicesJson = {
  studentTypes: UtplStudentType[];
};
