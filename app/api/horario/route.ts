import {
  handleRefreshConfigPost,
  handleScheduleConfigGet,
} from '@/lib/refresh-config-handler';

/** @deprecated Usar /api/refresh-config. Se mantiene por compatibilidad con flujos PA anteriores. */
export async function POST(request: Request) {
  return handleRefreshConfigPost(request);
}

/** @deprecated Usar /api/schedule-config. */
export async function GET() {
  return handleScheduleConfigGet();
}
