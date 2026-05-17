import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';

export type StudentTypeSummary = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type CategoryWithCount = {
  id: number;
  name: string;
  description: string | null;
  activeServiceCount: number;
};

export type CategorySummary = {
  id: number;
  name: string;
  description: string | null;
  studentTypeId: number;
};

export type ServiceListItem = {
  id: number;
  title: string;
  responseTime: string | null;
  cost: string | null;
  modalityLevel: string | null;
};

export type PublicPortalCatalog = {
  studentTypes: StudentTypeSummary[];
  categories: Array<{
    id: number;
    studentTypeId: number;
    name: string;
    description: string | null;
  }>;
  services: Array<
    ServiceListItem & {
      categoryId: number;
      studentTypeId: number;
    }
  >;
};

export type AdminDashboardCounts = {
  studentTypes: number;
  categories: number;
  services: number;
  activeServices: number;
};

export type AdminServiceListItem = ServiceListItem & {
  categoryId: number;
  studentTypeId: number;
  isActive: boolean;
};

export interface AcademicServicesReadPort {
  listStudentTypes(): Promise<StudentTypeSummary[]>;
  getStudentTypeByCode(code: string): Promise<StudentTypeSummary | null>;
  listCategoriesWithActiveCounts(studentTypeId: number): Promise<CategoryWithCount[]>;
  getCategoryForStudentType(
    studentTypeId: number,
    categoryId: number,
  ): Promise<CategorySummary | null>;
  listActiveServicesByCategoryId(categoryId: number): Promise<ServiceListItem[]>;
  getActiveServiceDetail(categoryId: number, serviceId: number): Promise<ServiceDetail | null>;
  getPublicPortalCatalog(): Promise<PublicPortalCatalog>;
  getDashboardCounts(): Promise<AdminDashboardCounts>;
  listAllCategories(): Promise<
    Array<CategorySummary & { studentTypeCode: string; studentTypeName: string }>
  >;
  listAllServices(): Promise<AdminServiceListItem[]>;
  getServiceDetailForAdmin(serviceId: number): Promise<ServiceDetail | null>;
}
