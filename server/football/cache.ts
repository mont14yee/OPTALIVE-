export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  staleTtlMs: number;
  key: string;
}

export interface CacheLookupResult<T> {
  data: T;
  isStale: boolean;
  cachedAt: string;
  expiresAt: string;
}

export class FootballCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private hits = 0;
  private misses = 0;
  private stales = 0;

  constructor() {
    // Background garbage collection every 60s
    this.cleanupTimer = setInterval(() => this.cleanup(), 60000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  public get<T>(key: string): CacheLookupResult<T> | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age <= entry.ttlMs) {
      // Fresh hit
      this.hits++;
      return {
        data: entry.data,
        isStale: false,
        cachedAt: new Date(entry.timestamp).toISOString(),
        expiresAt: new Date(entry.timestamp + entry.ttlMs).toISOString()
      };
    }

    if (age <= entry.staleTtlMs) {
      // Stale data detected but within acceptable grace period for resilience
      this.stales++;
      return {
        data: entry.data,
        isStale: true,
        cachedAt: new Date(entry.timestamp).toISOString(),
        expiresAt: new Date(entry.timestamp + entry.ttlMs).toISOString()
      };
    }

    // Completely expired
    this.store.delete(key);
    this.misses++;
    return null;
  }

  public set<T>(key: string, data: T, ttlMs: number, staleTtlMs?: number): void {
    const now = Date.now();
    // Default stale tolerance is 4x standard TTL (or minimum 5 minutes)
    const effectiveStaleTtl = staleTtlMs ?? Math.max(ttlMs * 4, 300000);

    this.store.set(key, {
      data,
      timestamp: now,
      ttlMs,
      staleTtlMs: effectiveStaleTtl,
      key
    });
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.staleTtlMs) {
        this.store.delete(key);
      }
    }
  }

  public getStats() {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      stales: this.stales
    };
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

export const footballCache = new FootballCache();
