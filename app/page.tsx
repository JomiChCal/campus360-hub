import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';

import { getBusinessHoursStateFromStore } from '@/lib/business-hours';
import { readScheduleStore } from '@/lib/schedule-config-store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  noStore();
  const store = await readScheduleStore();
  const state = getBusinessHoursStateFromStore(store);

  if (state === 'lunch' || state === 'after-hours') {
    redirect('/fuera-horario');
  }

  redirect('/tipo');
}
