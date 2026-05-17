import { auth } from '@/auth';
import { AdministrativoLogin } from '@/components/administrativo/AdministrativoLogin';
import { AdministrativoPortal } from '@/components/administrativo/AdministrativoPortal';
import { getDashboardCounts } from '@/lib/academic-services/repositories/admin';
import { listAllCategories } from '@/lib/academic-services/repositories/service-categories';
import { listAllServices } from '@/lib/academic-services/repositories/services';
import { listStudentTypes } from '@/lib/academic-services/repositories/student-types';

export const metadata = { title: 'Panel administrativo | UTPL' };

export default async function AdministrativoPage() {
  const session = await auth();
  if (!session) return <AdministrativoLogin />;

  const [counts, studentTypes, categories, services] = await Promise.all([
    getDashboardCounts(),
    listStudentTypes(),
    listAllCategories(),
    listAllServices(),
  ]);

  return (
    <AdministrativoPortal
      counts={counts}
      studentTypes={studentTypes}
      categories={categories}
      services={services}
    />
  );
}
