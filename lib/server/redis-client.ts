import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

function getRedisUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
}

function getRedisToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
}

export function isRedisEnabled(): boolean {
  return Boolean(getRedisUrl() && getRedisToken());
}

export function getRedis(): Redis | null {
  if (!isRedisEnabled()) return null;

  if (!redisClient) {
    redisClient = new Redis({
      url: getRedisUrl()!,
      token: getRedisToken()!,
    });
  }

  return redisClient;
}
