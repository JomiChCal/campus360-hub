import { redirect } from 'next/navigation';

import { getScheduleConfigSnapshot } from '@/lib/server/schedule-service';
import { isWizardAllowedState } from '@/lib/schedule-core';

export default async function Home() {
  const { state } = await getScheduleConfigSnapshot();

  if (isWizardAllowedState(state)) {
    redirect('/tipo');
  }

  redirect('/fuera-horario');
}
