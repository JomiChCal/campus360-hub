import { ServiciosPortal } from '@/components/servicios/ServiciosPortal';
import { getPublicPortalCatalog } from '@/lib/academic-services/repositories/portal-catalog';

export const metadata = { title: 'Servicios por tipo de estudiante | UTPL' };

export default async function ServiciosPage() {
  const catalog = await getPublicPortalCatalog();
  return <ServiciosPortal initialCatalog={catalog} />;
}
