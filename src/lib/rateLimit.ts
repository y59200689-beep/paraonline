import { Redis } from '@upstash/redis';

// In-memory fallback store
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const localStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of localStore.entries()) {
      if (entry.resetAt < now) localStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

let redis: Redis | null = null;
const isProduction = process.env.NODE_ENV === 'production';
let hasWarnedAboutLocalFallback = false;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.error('[RateLimit] Failed to initialize Upstash Redis:', err);
  }
}

/**
 * Check if a request is within the rate limit.
 * Uses Upstash Redis if configured; otherwise, falls back to in-memory Map.
 * 
 * @param key       Unique key (e.g. `${route}:${ip}`)
 * @param limit     Maximum number of requests allowed in the window
 * @param windowMs  Time window in milliseconds
 * @returns `{ allowed: boolean; remaining: number; resetAt: number }`
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  // 1. Try Upstash Redis rate limiting
  if (redis) {
    try {
      const currentCount = await redis.incr(key);
      if (currentCount === 1) {
        await redis.pexpire(key, windowMs);
      }
      
      const pttl = await redis.pttl(key);
      if (pttl === -1) {
        await redis.pexpire(key, windowMs);
      }
      
      const resetAt = Date.now() + (pttl > 0 ? pttl : windowMs);
      const remaining = Math.max(0, limit - currentCount);

      return {
        allowed: currentCount <= limit,
        remaining,
        resetAt,
      };
    } catch (err) {
      console.error('[RateLimit] Upstash Redis error:', err);
    }
  }

  // Keep checkout and other customer actions available while Redis is being
  // configured. This is weaker across serverless instances, so production logs
  // a clear warning exactly once; add Upstash to make the limit distributed.
  if (isProduction && !hasWarnedAboutLocalFallback) {
    hasWarnedAboutLocalFallback = true;
    console.warn('[RateLimit] Upstash Redis is not available; using the temporary local fallback.');
  }

  // 2. In-memory fallback
  const now = Date.now();
  const entry = localStore.get(key);

  if (!entry || entry.resetAt < now) {
    localStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
}

/**
 * Extract the best available IP from Next.js request headers.
 * Falls back to '127.0.0.1' in local development.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}
