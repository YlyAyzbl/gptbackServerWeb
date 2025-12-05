import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';

/**
 * API调用Hook - 处理加载、错误和数据状态
 */
export const useApiCall = <T,>(
  apiFunction: () => Promise<any>,
  autoFetch: boolean = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();
      setData(response.data || response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || '请求失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  // 自动获取数据
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  const refetch = useCallback(async () => {
    return fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    fetch: refetch,
    setData,
  };
};
