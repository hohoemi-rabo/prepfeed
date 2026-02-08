/**
 * データフェッチ共通フック
 * 検索ページ等で繰り返されるfetch+state管理パターンを共通化
 */

import { useEffect, useState } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * URLからデータを取得するフック
 * urlがnull/undefinedの場合はフェッチしない
 *
 * @param url - フェッチ先URL（nullでスキップ）
 * @param errorPrefix - コンソールエラーのプレフィックス
 */
export function useFetch<T>(
  url: string | null,
  errorPrefix: string = 'Fetch error'
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || 'データの取得に失敗しました');
        }

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error ? err.message : 'エラーが発生しました';
          console.error(`${errorPrefix}:`, errorMessage);
          setError(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, errorPrefix]);

  return { data, isLoading, error };
}
