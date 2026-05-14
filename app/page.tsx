import { redirect } from 'next/navigation';

import { getBusinessHoursState } from '@/lib/business-hours';

export default function Home() {
  const state = getBusinessHoursState();

  if (state === 'lunch') {
    redirect('/fuera-horario');
  }

  if (state === 'after-hours') {
    redirect('/fuera-horario');
  }

  redirect('/tipo');
}
