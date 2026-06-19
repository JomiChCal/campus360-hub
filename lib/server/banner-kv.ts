import type { CacheWriteMode } from '@/lib/server/cache-write-mode';
import { getRedisSetOptions } from '@/lib/server/cache-write-mode';
import { getRedis, isRedisEnabled } from '@/lib/server/redis-client';
import type { BannerAnnouncement } from '@/types/banner';

export const BANNER_KV_KEY = 'campus360:banner-avisos';

export async function readBannersFromKv(): Promise<BannerAnnouncement[] | null> {
  const redis = getRedis();
  if (!redis) return null;

  const data = await redis.get<BannerAnnouncement[]>(BANNER_KV_KEY);
  return data ?? null;
}

export async function writeBannersToKv(
  messages: BannerAnnouncement[],
  mode: CacheWriteMode = 'fallback'
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  await redis.set(BANNER_KV_KEY, messages, getRedisSetOptions(mode));
}

export function isBannerKvEnabled(): boolean {
  return isRedisEnabled();
}
