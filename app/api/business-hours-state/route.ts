import { handleBusinessHoursStateGet } from '@/lib/business-hours-state-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleBusinessHoursStateGet();
}
