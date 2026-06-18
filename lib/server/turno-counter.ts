import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getNextTurnoNumber(todayDate: string): Promise<string> {
  const key = `turno:${todayDate}`;
  const next = await redis.incr(key);
  await redis.expire(key, 86_400);
  return String(next).padStart(3, '0');
}

export async function resetCounter(todayDate?: string) {
  if (todayDate) {
    await redis.del(`turno:${todayDate}`);
  }
}
