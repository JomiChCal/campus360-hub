export type CacheWriteMode = 'refresh' | 'fallback';

const FALLBACK_TTL_SECONDS = 600;
const REFRESH_TTL_SECONDS = 604_800;

export function getRedisSetOptions(mode: CacheWriteMode): { ex: number } {
  return { ex: mode === 'refresh' ? REFRESH_TTL_SECONDS : FALLBACK_TTL_SECONDS };
}
