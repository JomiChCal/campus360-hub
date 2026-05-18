import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';
import type { ServiceStatus } from '@/lib/academic-services/domain/service-detail';

export type StudentTypeSummary = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CategoryWithCount = {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  activeServiceCount: number;
};

export type CategorySummary = {
  id: number;
  name: string;
  description: string | null;
  studentTypeId: number;
  sortOrder: number;
  isActive: boolean;
};

export type ServiceListItem = {
  id: number;
  title: string;
  responseTime: string | null;
  cost: string | null;
  modalityLevel: string | null;
  status: ServiceStatus;
  isActive: boolean;
  sortOrder: number;
};

export type PublicPortalCatalog = {
  studentTypes: StudentTypeSummary[];
  categories: Array<{
    id: number;
    studentTypeId: number;
    name: string;
    description: string | null;
    sortOrder: number;
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
};

/** Detalle completo para el formulario de edición en /administrativo. */
export type AdminServiceEdit = ServiceDetail & {
  categoryId: number;
  slug: string;
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
  getServiceDetailForAdmin(serviceId: number): Promise<AdminServiceEdit | null>;
}
