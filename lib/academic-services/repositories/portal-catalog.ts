import { getReadPort } from '@/lib/academic-services/providers/registry';

export async function getPublicPortalCatalog() {
  return getReadPort().getPublicPortalCatalog();
}
