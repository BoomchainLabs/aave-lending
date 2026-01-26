import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = {
  USER_DATA: 30, // 30 seconds
  RESERVE_DATA: 60, // 1 minute
  BALANCES: 30, // 30 seconds
  RATES: 60, // 1 minute
  TRANSACTION: 120, // 2 minutes
};

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    console.log('[v0] Cache hit for key:', key);
    return data || null;
  } catch (error) {
    console.error('[v0] Cache get error:', error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.USER_DATA
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    console.log('[v0] Cache set for key:', key, 'TTL:', ttl);
  } catch (error) {
    console.error('[v0] Cache set error:', error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    // For Upstash, we need to delete keys matching a pattern
    // This is a simple implementation that deletes specific keys
    await redis.del(pattern);
    console.log('[v0] Cache invalidated for pattern:', pattern);
  } catch (error) {
    console.error('[v0] Cache invalidation error:', error);
  }
}

export function getCacheKey(
  type: 'user' | 'reserve' | 'balance' | 'allowance' | 'rate',
  ...params: string[]
): string {
  return `${type}:${params.join(':')}`;
}

export async function getUserDataCache(userAddress: string) {
  const key = getCacheKey('user', userAddress);
  return getCached(key);
}

export async function setUserDataCache(userAddress: string, data: any) {
  const key = getCacheKey('user', userAddress);
  await setCached(key, data, CACHE_TTL.USER_DATA);
}

export async function getReserveDataCache(tokenAddress: string) {
  const key = getCacheKey('reserve', tokenAddress);
  return getCached(key);
}

export async function setReserveDataCache(tokenAddress: string, data: any) {
  const key = getCacheKey('reserve', tokenAddress);
  await setCached(key, data, CACHE_TTL.RESERVE_DATA);
}

export async function getBalanceCache(userAddress: string, tokenAddress: string) {
  const key = getCacheKey('balance', userAddress, tokenAddress);
  return getCached(key);
}

export async function setBalanceCache(
  userAddress: string,
  tokenAddress: string,
  balance: string
) {
  const key = getCacheKey('balance', userAddress, tokenAddress);
  await setCached(key, balance, CACHE_TTL.BALANCES);
}
