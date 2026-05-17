import type { AcademicServicesWritePort } from '@/lib/academic-services/ports/academic-services-write';
import { ProviderNotImplementedError } from '@/lib/academic-services/providers/errors';

function notImplemented(): never {
  throw new ProviderNotImplementedError('microsoft');
}

export const microsoftWritePort: AcademicServicesWritePort = {
  createStudentType: async () => notImplemented(),
  updateStudentType: async () => notImplemented(),
  deleteStudentType: async () => notImplemented(),
  createCategory: async () => notImplemented(),
  updateCategory: async () => notImplemented(),
  deleteCategory: async () => notImplemented(),
  upsertService: async () => notImplemented(),
  deleteService: async () => notImplemented(),
  getServiceDetailForAdmin: async () => notImplemented(),
};
