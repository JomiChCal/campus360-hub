import { Redis } from '@upstash/redis';

import type { ScheduleStore } from '@/lib/schedule-config-core';

export const SCHEDULE_KV_KEY = 'campus360:schedule-config';

let redisClient: Redis | null = null;

export function isScheduleKvEnabled(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}

function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error('Redis URL y token son obligatorios cuando KV está habilitado.');
    }

    redisClient = new Redis({ url, token });
  }

  return redisClient;
}

export async function readScheduleFromKv(): Promise<ScheduleStore | null> {
  if (!isScheduleKvEnabled()) return null;

  const data = await getRedis().get<ScheduleStore>(SCHEDULE_KV_KEY);
  return data ?? null;
}

export async function writeScheduleToKv(store: ScheduleStore): Promise<void> {
  if (!isScheduleKvEnabled()) return;
  await getRedis().set(SCHEDULE_KV_KEY, store);
}

export function getScheduleStorageBackend(): 'kv' | 'filesystem' {
  return isScheduleKvEnabled() ? 'kv' : 'filesystem';
}
