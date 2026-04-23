import { Request, Response, NextFunction } from 'express';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface HourlyBucket {
  count: number;
  resetAt: number;
}

// Per-minute rate limit: 10 requests per minute per userId
const minuteBuckets = new Map<string, TokenBucket>();
// Per-hour rate limit: 100 requests per hour per userId
const hourlyBuckets = new Map<string, HourlyBucket>();

const MINUTE_LIMIT = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '10');
const HOURLY_LIMIT = parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '100');

function getMinuteBucket(userId: string): TokenBucket {
  const now = Date.now();
  let bucket = minuteBuckets.get(userId);

  if (!bucket) {
    bucket = { tokens: MINUTE_LIMIT, lastRefill: now };
    minuteBuckets.set(userId, bucket);
    return bucket;
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor(elapsed / (60000 / MINUTE_LIMIT));
  if (refill > 0) {
    bucket.tokens = Math.min(MINUTE_LIMIT, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  return bucket;
}

function getHourlyBucket(userId: string): HourlyBucket {
  const now = Date.now();
  let bucket = hourlyBuckets.get(userId);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + 3600000 };
    hourlyBuckets.set(userId, bucket);
  }

  return bucket;
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const userId = req.body?.userId || req.ip || 'anonymous';

  // Check minute bucket
  const minuteBucket = getMinuteBucket(userId);
  if (minuteBucket.tokens <= 0) {
    const retryAfter = Math.ceil(60000 / MINUTE_LIMIT / 1000);
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter,
      limit: 'per-minute',
    });
    return;
  }

  // Check hourly bucket
  const hourlyBucket = getHourlyBucket(userId);
  if (hourlyBucket.count >= HOURLY_LIMIT) {
    const retryAfter = Math.ceil((hourlyBucket.resetAt - Date.now()) / 1000);
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter,
      limit: 'per-hour',
    });
    return;
  }

  // Consume tokens
  minuteBucket.tokens--;
  hourlyBucket.count++;

  // Set headers
  res.setHeader('X-RateLimit-Remaining', minuteBucket.tokens.toString());
  res.setHeader('X-RateLimit-Limit', MINUTE_LIMIT.toString());

  next();
}
