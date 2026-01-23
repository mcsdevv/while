/**
 * Shared Redis client with lazy initialization.
 * Avoids Upstash warnings during Next.js build when env vars aren't available.
 */
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

/**
 * Get the Redis client instance.
 * Creates the client on first access (lazy initialization).
 */
export function getRedis(): Redis {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}
