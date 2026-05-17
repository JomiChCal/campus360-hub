import { getReadPort } from '@/lib/academic-services/providers/registry';

export async function listCategoriesWithActiveCounts(studentTypeId: number) {
  return getReadPort().listCategoriesWithActiveCounts(studentTypeId);
}

export async function getCategoryForStudentType(studentTypeId: number, categoryId: number) {
  return getReadPort().getCategoryForStudentType(studentTypeId, categoryId);
}

export async function listAllCategories() {
  return getReadPort().listAllCategories();
}
