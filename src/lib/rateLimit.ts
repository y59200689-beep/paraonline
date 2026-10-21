import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

// In-memory fallback store
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const localStore = new Map<string, RateLimitEntry>();

let redis: Redis | null = null;
const isProduction = process.env.NODE_ENV === 'production';
let hasReportedDatabaseFailure = false;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    void err; // The shared database backend remains available.
  }
}

/**
 * Check if a request is within the rate limit.
 * Uses Redis, then a shared database counter in production; local memory in development.
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
      void err; // Credentials and provider error payloads must stay out of logs.
    }
  }

  // Supabase provides an atomic, cross-instance backend when Redis is absent
  // or unavailable. Never silently downgrade production to per-process limits.
  if (isProduction) {
    try {
      const { supabaseAdmin } = await import('./supabase-server');
      const { data, error } = await supabaseAdmin.rpc('consume_storefront_rate_limit', {
        p_key: createHash('sha256').update(key).digest('hex'),
        p_limit: limit,
        p_window_ms: windowMs,
      });
      if (error) throw new Error('Rate-limit database unavailable');
      const result = Array.isArray(data) ? data[0] : data;
      if (!result || typeof result.allowed !== 'boolean' || !Number.isFinite(Number(result.reset_at_ms))) throw new Error('Invalid rate-limit result');
      return { allowed: result.allowed, remaining: Number(result.remaining), resetAt: Number(result.reset_at_ms) };
    } catch {
      if (!hasReportedDatabaseFailure) {
        hasReportedDatabaseFailure = true;
        console.error('[RateLimit] Shared rate-limit backends unavailable; requests are temporarily restricted.');
      }
      return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs };
    }
  }

  // 2. In-memory fallback
  const now = Date.now();
  for (const [storedKey, value] of localStore) if (value.resetAt <= now) localStore.delete(storedKey);
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
