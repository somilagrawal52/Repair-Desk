interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 30, windowSeconds: number = 60) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;

    // Periodic cleanup of stale entries every 5 minutes
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetAt) {
      // First request or window expired
      this.store.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1000),
      };
    }

    if (entry.count >= this.maxRequests) {
      // Limit exceeded
      const resetInSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
      };
    }

    // Increment count
    entry.count += 1;
    const resetInSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetInSeconds,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Global instance: 30 requests per 60 seconds per IP
export const trackingRateLimiter = new MemoryRateLimiter(30, 60);
