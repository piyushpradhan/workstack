import type { RedisClientType } from "redis";

interface CacheOptions {
    ttl?: number;
    namespace?: string;
}

class CacheService {
    constructor(private redis: RedisClientType, private defaultTTL: number = 60 * 60, private defaultNamespace: string = "") { }

    async getCached<T>(key: string, options?: CacheOptions): Promise<T | null> {
        const fullKey = this.buildKey(key, options?.namespace);

        try {
            const cached = await this.redis.get(fullKey);

            if (cached) {
                return JSON.parse(cached) as T;
            }

            return null;
        } catch (error) {
            console.error(`Error getting key: ${fullKey}`, error);
            return null;
        }
    }

    async setCached<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
        const fullKey = this.buildKey(key, options?.namespace);

        try {
            await this.redis.set(fullKey, JSON.stringify(value), { EX: options?.ttl ?? this.defaultTTL });
        } catch (error) {
            console.error(`Error setting key: ${fullKey}`, error);
        }
    }

    async invalidateCache(keys: string | string[], options?: CacheOptions): Promise<void> {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const fullKeys = keysArray.map(key => this.buildKey(key, options?.namespace));

        try {
            if (fullKeys.length === 1) {
                await this.redis.del(fullKeys[0]);
            } else {
                const pipeline = this.redis.multi();

                fullKeys.forEach(key => {
                    pipeline.del(key);
                });

                await pipeline.exec();
            }
        } catch (error) {
            console.error(`Error invalidating cache for keys: ${fullKeys.join(", ")}`, error);
        }
    }

    async getOrSet<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T> {
        const cached = await this.getCached<T>(key, options);

        if (cached !== null) {
            return cached;
        }

        const data = await fetchFn();

        this.setCached(key, data, options).catch(error => {
            console.error(`Error caching after fetching value for key ${key}: `, error);
        });

        return data;
    }

    private buildKey(key: string, namespace?: string): string {
        const ns = namespace ?? this.defaultNamespace;
        return ns ? `${ns}:${key}` : key;
    }
}

export function createCacheService(redis: RedisClientType, defaultTTL: number = 3600, defaultNamespace: string = ""): CacheService {
    return new CacheService(redis, defaultTTL, defaultNamespace);
}

export { CacheService };