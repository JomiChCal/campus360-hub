import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';

export type StudentTypeInput = {
  code: string;
  name: string;
  description: string | null;
};

export type CategoryInput = {
  studentTypeId: number;
  name: string;
  description: string | null;
};

export type ServiceUpsertInput = {
  id?: number;
  categoryId: number;
  title: string;
  description: string | null;
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  isActive: boolean;
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

export interface AcademicServicesWritePort {
  createStudentType(input: StudentTypeInput): Promise<{ id: number }>;
  updateStudentType(id: number, input: StudentTypeInput): Promise<void>;
  deleteStudentType(id: number): Promise<void>;
  createCategory(input: CategoryInput): Promise<{ id: number }>;
  updateCategory(id: number, input: CategoryInput): Promise<void>;
  deleteCategory(id: number): Promise<void>;
  upsertService(input: ServiceUpsertInput): Promise<{ id: number }>;
  deleteService(id: number): Promise<void>;
  getServiceDetailForAdmin(serviceId: number): Promise<ServiceDetail | null>;
}
