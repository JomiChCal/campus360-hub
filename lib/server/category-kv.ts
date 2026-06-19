import type { CacheWriteMode } from '@/lib/server/cache-write-mode';
import { getRedisSetOptions } from '@/lib/server/cache-write-mode';
import { getRedis, isRedisEnabled } from '@/lib/server/redis-client';
import type { WizardCategory } from '@/types/category';

export const CATEGORIES_KV_KEY = 'campus360:categorias-wizard';

export async function readCategoriesFromKv(): Promise<WizardCategory[] | null> {
  const redis = getRedis();
  if (!redis) return null;

  const data = await redis.get<WizardCategory[]>(CATEGORIES_KV_KEY);
  return data ?? null;
}

export async function writeCategoriesToKv(
  categories: WizardCategory[],
  mode: CacheWriteMode = 'fallback'
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  await redis.set(CATEGORIES_KV_KEY, categories, getRedisSetOptions(mode));
}

export function isCategoriesKvEnabled(): boolean {
  return isRedisEnabled();
}
