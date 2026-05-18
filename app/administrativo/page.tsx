import { auth } from '@/auth';
import { AdministrativoLogin } from '@/components/administrativo/AdministrativoLogin';
import { AdministrativoPortal } from '@/components/administrativo/AdministrativoPortal';
import { listAllCategories } from '@/lib/academic-services/repositories/service-categories';
import { listAllServices } from '@/lib/academic-services/repositories/services';
import { listStudentTypes } from '@/lib/academic-services/repositories/student-types';

export const metadata = { title: 'servicios UTPL | Administrativo' };
export const dynamic = 'force-dynamic';

export default async function AdministrativoPage() {
  const session = await auth();
  if (!session) return <AdministrativoLogin />;

  const [studentTypes, categories, services] = await Promise.all([
    listStudentTypes(),
    listAllCategories(),
    listAllServices(),
  ]);

  return (
    <AdministrativoPortal
      studentTypes={studentTypes}
      categories={categories}
      services={services}
    />
  );
}
