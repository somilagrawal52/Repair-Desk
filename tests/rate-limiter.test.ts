import { describe, it, expect } from "vitest";
import { trackingRateLimiter } from "../src/lib/rate-limiter";

describe("Tracking API Rate Limiter Tests", () => {
  it("allows requests under the rate limit threshold", () => {
    const testIp = `test-ip-${Date.now()}`;
    const first = trackingRateLimiter.check(testIp);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(29);

    const second = trackingRateLimiter.check(testIp);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(28);
  });

  it("blocks requests when the maximum threshold is exceeded", () => {
    const burstIp = `burst-ip-${Date.now()}`;
    // Consume all 30 tokens
    for (let i = 0; i < 30; i++) {
      trackingRateLimiter.check(burstIp);
    }

    // 31st request must be blocked
    const blocked = trackingRateLimiter.check(burstIp);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });
});
