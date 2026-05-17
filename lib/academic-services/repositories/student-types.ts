import { getReadPort } from '@/lib/academic-services/providers/registry';

export async function listStudentTypes() {
  return getReadPort().listStudentTypes();
}

export async function getStudentTypeByCode(code: string) {
  return getReadPort().getStudentTypeByCode(code);
}
