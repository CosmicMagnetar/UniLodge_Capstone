import { Request, Response, NextFunction } from 'express';

interface UsageEntry {
  timestamp: number;
  tokensEstimate: number;
  model: string;
  responseTimeMs: number;
}

interface UserUsage {
  entries: UsageEntry[];
  dailyCount: number;
  dailyResetAt: number;
}

const usageStore = new Map<string, UserUsage>();
const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || '50');

function getUserUsage(userId: string): UserUsage {
  const now = Date.now();
  let usage = usageStore.get(userId);

  if (!usage || now >= usage.dailyResetAt) {
    usage = {
      entries: usage?.entries || [],
      dailyCount: 0,
      dailyResetAt: now + 86400000, // 24 hours
    };
    usageStore.set(userId, usage);
  }

  return usage;
}

/**
 * Check daily usage limit — returns 429 if exceeded.
 */
export function checkDailyLimit(req: Request, res: Response, next: NextFunction): void {
  const userId = req.body?.userId || req.ip || 'anonymous';
  const usage = getUserUsage(userId);

  if (usage.dailyCount >= DAILY_LIMIT) {
    const retryAfter = Math.ceil((usage.dailyResetAt - Date.now()) / 1000);
    res.status(429).json({
      error: 'Daily usage limit exceeded',
      dailyLimit: DAILY_LIMIT,
      retryAfter,
    });
    return;
  }

  next();
}

/**
 * Track usage after request completes.
 */
export function usageTracker(req: Request, res: Response, next: NextFunction) {
  const userId = req.body?.userId || req.ip || 'anonymous';
  const startTime = Date.now();

  // Hook into response finish
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const responseTimeMs = Date.now() - startTime;
    const tokensEstimate = body?.response ? Math.ceil(body.response.length / 4) : 0;

    const usage = getUserUsage(userId);
    usage.dailyCount++;
    usage.entries.push({
      timestamp: Date.now(),
      tokensEstimate,
      model: body?.model || 'unknown',
      responseTimeMs,
    });

    // Keep only last 100 entries per user
    if (usage.entries.length > 100) {
      usage.entries = usage.entries.slice(-100);
    }

    return originalJson(body);
  };

  next();
}

/**
 * Get usage statistics for a user.
 */
export function getUsageStats(userId: string) {
  const usage = getUserUsage(userId);

  const totalRequests = usage.entries.length;
  const totalTokens = usage.entries.reduce((sum, e) => sum + e.tokensEstimate, 0);
  const avgResponseTime = totalRequests > 0
    ? Math.round(usage.entries.reduce((sum, e) => sum + e.responseTimeMs, 0) / totalRequests)
    : 0;

  return {
    userId,
    dailyCount: usage.dailyCount,
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: Math.max(0, DAILY_LIMIT - usage.dailyCount),
    dailyResetAt: new Date(usage.dailyResetAt).toISOString(),
    totalRequests,
    totalTokensEstimate: totalTokens,
    avgResponseTimeMs: avgResponseTime,
  };
}
