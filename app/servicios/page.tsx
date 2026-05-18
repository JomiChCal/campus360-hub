import { ServiciosPortal } from '@/components/servicios/ServiciosPortal';
import { getPublicPortalCatalog } from '@/lib/academic-services/repositories/portal-catalog';

export const metadata = { title: 'Servicios por tipo de estudiante | UTPL' };
export const dynamic = 'force-dynamic';

export default async function ServiciosPage() {
  const catalog = await getPublicPortalCatalog();
  return (
    <div className="px-3 px-md-4">
      <ServiciosPortal initialCatalog={catalog} />
    </div>
  );
}
