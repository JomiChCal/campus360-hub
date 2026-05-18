'use server';

import { getActiveServiceDetail } from '@/lib/academic-services/repositories/services';

export async function fetchServiceDetail(categoryId: number, serviceId: number) {
  return getActiveServiceDetail(categoryId, serviceId);
}
