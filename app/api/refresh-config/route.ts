import { handleRefreshConfigPost } from '@/lib/refresh-config-handler';

export async function POST(request: Request) {
  return handleRefreshConfigPost(request);
}
