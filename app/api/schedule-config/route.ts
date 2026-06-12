import { handleScheduleConfigGet } from '@/lib/refresh-config-handler';

export async function GET() {
  return handleScheduleConfigGet();
}
