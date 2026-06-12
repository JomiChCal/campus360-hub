import { NextResponse } from 'next/server';

import { getBusinessHoursStateFromStore } from '@/lib/business-hours';
import { readScheduleStore } from '@/lib/schedule-config-store';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

export async function handleBusinessHoursStateGet(): Promise<NextResponse> {
  const store = await readScheduleStore();
  const state = getBusinessHoursStateFromStore(store);

  return NextResponse.json(
    {
      state,
      open: state === 'open',
    },
    { headers: NO_STORE_HEADERS }
  );
}
