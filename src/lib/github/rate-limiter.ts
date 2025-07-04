// ============================================================================
// GITHUB API RATE LIMITING
// ============================================================================

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class GitHubRateLimiter {
  private cache = new Map<string, CacheEntry>();
  private rateLimitInfo: RateLimitInfo | null = null;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // Minimum 100ms between requests

  /**
   * Check if we can make a request based on rate limits
   * @returns Promise<boolean>
   */
  async canMakeRequest(): Promise<boolean> {
    // Check minimum interval between requests
    const now = Date.now();
    if (now - this.lastRequestTime < this.minRequestInterval) {
      return false;
    }

    // If we have rate limit info, check remaining requests
    if (this.rateLimitInfo) {
      if (this.rateLimitInfo.remaining <= 0) {
        const resetTime = this.rateLimitInfo.reset * 1000;
        if (now < resetTime) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Update rate limit information from response headers
   * @param headers - Response headers
   */
  updateRateLimitInfo(headers: Headers): void {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    const used = headers.get('x-ratelimit-used');

    if (limit && remaining && reset && used) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        used: parseInt(used, 10),
      };
    }
  }

  /**
   * Get current rate limit information
   * @returns RateLimitInfo | null
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   * @returns number
   */
  getTimeUntilReset(): number {
    if (!this.rateLimitInfo) {
      return 0;
    }
    const now = Date.now();
    const resetTime = this.rateLimitInfo.reset * 1000;
    return Math.max(0, resetTime - now);
  }

  /**
   * Wait until we can make a request
   * @returns Promise<void>
   */
  async waitForRequest(): Promise<void> {
    while (!(await this.canMakeRequest())) {
      const waitTime = Math.max(
        this.minRequestInterval - (Date.now() - this.lastRequestTime),
        this.getTimeUntilReset()
      );
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Record that a request was made
   */
  recordRequest(): void {
    this.lastRequestTime = Date.now();
  }

  /**
   * Cache a response
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds
   */
  setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cached data
   * @param key - Cache key
   * @returns any | null
   */
  getCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns { size: number; keys: string[] }
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const githubRateLimiter = new GitHubRateLimiter();

/**
 * Decorator function to add rate limiting to GitHub API calls
 * @param fn - The function to wrap
 * @param cacheKey - Optional cache key for caching
 * @param cacheTtl - Cache TTL in milliseconds
 * @returns Wrapped function
 */
export function withRateLimiting<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey?: (...args: T) => string,
  cacheTtl: number = 5 * 60 * 1000
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    // Check cache first
    if (cacheKey) {
      const key = cacheKey(...args);
      const cached = githubRateLimiter.getCache(key);
      if (cached) {
        return cached;
      }
    }

    // Wait for rate limit
    await githubRateLimiter.waitForRequest();

    // Make the request
    githubRateLimiter.recordRequest();
    const result = await fn(...args);

    // Cache the result
    if (cacheKey) {
      const key = cacheKey(...args);
      githubRateLimiter.setCache(key, result, cacheTtl);
    }

    return result;
  };
} 