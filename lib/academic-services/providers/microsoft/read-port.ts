import type { AcademicServicesReadPort } from '@/lib/academic-services/ports/academic-services-read';
import { ProviderNotImplementedError } from '@/lib/academic-services/providers/errors';

function notImplemented(): never {
  throw new ProviderNotImplementedError('microsoft');
}

export const microsoftReadPort: AcademicServicesReadPort = {
  listStudentTypes: async () => notImplemented(),
  getStudentTypeByCode: async () => notImplemented(),
  listCategoriesWithActiveCounts: async () => notImplemented(),
  getCategoryForStudentType: async () => notImplemented(),
  listActiveServicesByCategoryId: async () => notImplemented(),
  getActiveServiceDetail: async () => notImplemented(),
  getPublicPortalCatalog: async () => notImplemented(),
  getDashboardCounts: async () => notImplemented(),
  listAllCategories: async () => notImplemented(),
  listAllServices: async () => notImplemented(),
  getServiceDetailForAdmin: async () => notImplemented(),
};
