export type UtplRequirementItem = {
  text: string;
  pdfUrl?: string | null;
};

export type UtplRequirementTab = {
  tabName: string;
  title?: string | null;
  items: UtplRequirementItem[];
};

export type UtplPeriodModality = {
  modality: string;
  requestWindow?: string | null;
  responseWindow?: string | null;
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
  title: string;
  description?: string | null;
  modalityLevel?: string | null;
  responseTime?: string | null;
  cost?: string | null;
  note?: string | null;
  isActive?: boolean;
  requirements?: string[];
  requirementTabs?: UtplRequirementTab[];
  periods?: UtplPeriod[];
  manuals?: UtplManual[];
};

export type UtplCategory = {
  name: string;
  description?: string | null;
  services: UtplService[];
};

export type UtplStudentType = {
  code: string;
  name: string;
  description?: string | null;
  categories: UtplCategory[];
};

export type UtplServicesJson = {
  studentTypes: UtplStudentType[];
};
