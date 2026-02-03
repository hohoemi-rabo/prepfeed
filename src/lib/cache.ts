/**
 * キャッシュユーティリティ
 * Vercel KVを使用したキャッシュ実装（開発環境ではインメモリにフォールバック）
 */

import { kv } from '@vercel/kv';

// キャッシュTTL（秒）
const CACHE_TTL = 30 * 60; // 30分

// インメモリキャッシュ（開発環境用）
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Vercel KVが利用可能かチェック
 */
function isVercelKVAvailable(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

/**
 * キャッシュキーを生成
 */
export function generateCacheKey(prefix: string, identifier: string): string {
  return `prepfeed:${prefix}:${identifier}`;
}

/**
 * キャッシュからデータを取得
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (isVercelKVAvailable()) {
      // Vercel KVから取得
      const data = await kv.get<T>(key);
      return data;
    } else {
      // インメモリキャッシュから取得
      const entry = memoryCache.get(key);
      if (!entry) return null;

      // 有効期限チェック
      if (Date.now() > entry.expiresAt) {
        memoryCache.delete(key);
        return null;
      }

      return entry.data as T;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * キャッシュにデータを保存
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL
): Promise<void> {
  try {
    if (isVercelKVAvailable()) {
      // Vercel KVに保存
      await kv.set(key, data, { ex: ttl });
    } else {
      // インメモリキャッシュに保存
      const expiresAt = Date.now() + ttl * 1000;
      memoryCache.set(key, { data, expiresAt });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * キャッシュを削除
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    if (isVercelKVAvailable()) {
      // Vercel KVから削除
      await kv.del(key);
    } else {
      // インメモリキャッシュから削除
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * パターンに一致するキャッシュを削除
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    if (isVercelKVAvailable()) {
      // Vercel KVでパターンマッチングして削除
      // 注: この実装は簡易版です。本番環境では適切なキー管理が必要
      console.warn('Pattern-based cache deletion not fully implemented for Vercel KV');
    } else {
      // インメモリキャッシュからパターンマッチングして削除
      const keysToDelete: string[] = [];
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => memoryCache.delete(key));
    }
  } catch (error) {
    console.error('Cache delete by pattern error:', error);
  }
}

/**
 * キャッシュ付きデータフェッチ
 * キャッシュにデータがあればそれを返し、なければfetchFnを実行してキャッシュに保存
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  // キャッシュから取得を試みる
  const cached = await getCache<T>(key);
  if (cached !== null) {
    console.log(`Cache hit: ${key}`);
    return cached;
  }

  // キャッシュミス: データを取得
  console.log(`Cache miss: ${key}`);
  const data = await fetchFn();

  // キャッシュに保存
  await setCache(key, data, ttl);

  return data;
}

/**
 * インメモリキャッシュをクリア（開発環境用）
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
}

/**
 * キャッシュ統計を取得（開発環境用）
 */
export function getCacheStats() {
  if (!isVercelKVAvailable()) {
    return {
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys()),
    };
  }
  return {
    message: 'Using Vercel KV (stats not available)',
  };
}