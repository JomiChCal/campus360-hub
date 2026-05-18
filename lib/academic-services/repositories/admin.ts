import { getReadPort, getWritePort } from '@/lib/academic-services/providers/registry';
import type {
  CategoryInput,
  StudentTypeInput,
} from '@/lib/academic-services/ports/academic-services-write';
import type { ServiceUpsertInput } from '@/lib/academic-services/ports/academic-services-write';

export async function getDashboardCounts() {
  return getReadPort().getDashboardCounts();
}

export async function createStudentType(input: StudentTypeInput) {
  return getWritePort().createStudentType(input);
}

export async function updateStudentType(id: number, input: StudentTypeInput) {
  return getWritePort().updateStudentType(id, input);
}

export async function deleteStudentType(id: number) {
  return getWritePort().deleteStudentType(id);
}

export async function createCategory(input: CategoryInput) {
  return getWritePort().createCategory(input);
}

export async function updateCategory(id: number, input: CategoryInput) {
  return getWritePort().updateCategory(id, input);
}

export async function deleteCategory(id: number) {
  return getWritePort().deleteCategory(id);
}

export async function upsertService(input: ServiceUpsertInput) {
  return getWritePort().upsertService(input);
}

export async function deleteService(id: number) {
  return getWritePort().deleteService(id);
}
