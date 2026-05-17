import { getReadPort, getWritePort } from '@/lib/academic-services/providers/registry';
import type { ServiceUpsertInput } from '@/lib/academic-services/ports/academic-services-write';

export async function listActiveServicesByCategoryId(categoryId: number) {
  return getReadPort().listActiveServicesByCategoryId(categoryId);
}

export async function getActiveServiceDetail(categoryId: number, serviceId: number) {
  return getReadPort().getActiveServiceDetail(categoryId, serviceId);
}

export async function listAllServices() {
  return getReadPort().listAllServices();
}

export async function getServiceDetailForAdmin(serviceId: number) {
  return getReadPort().getServiceDetailForAdmin(serviceId);
}

export async function upsertService(input: ServiceUpsertInput) {
  return getWritePort().upsertService(input);
}

export async function deleteService(id: number) {
  return getWritePort().deleteService(id);
}
