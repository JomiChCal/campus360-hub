import { getRedis, isRedisEnabled } from '@/lib/server/redis-client';
import type { BannerAnnouncement } from '@/types/banner';

export const BANNER_KV_KEY = 'campus360:banner-avisos';
const BANNER_TTL_SECONDS = 600;

export async function readBannersFromKv(): Promise<BannerAnnouncement[] | null> {
  const redis = getRedis();
  if (!redis) return null;

  const data = await redis.get<BannerAnnouncement[]>(BANNER_KV_KEY);
  return data ?? null;
}

export async function writeBannersToKv(messages: BannerAnnouncement[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  await redis.set(BANNER_KV_KEY, messages, { ex: BANNER_TTL_SECONDS });
}

export function isBannerKvEnabled(): boolean {
  return isRedisEnabled();
}
