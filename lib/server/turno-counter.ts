import { getRedis } from '@/lib/server/redis-client';

export async function getNextTurnoNumber(todayDate: string): Promise<string> {
  const redis = getRedis();
  if (!redis) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for turno assignment');
  }

  const key = `turno:${todayDate}`;
  const next = await redis.incr(key);
  await redis.expire(key, 86_400);
  return String(next).padStart(3, '0');
}

export async function resetCounter(todayDate?: string) {
  const redis = getRedis();
  if (!redis || !todayDate) return;

  await redis.del(`turno:${todayDate}`);
}
