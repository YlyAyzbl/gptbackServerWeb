import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * API调用Hook - 处理加载、错误和数据状态
 * 使用 useRef 存储 apiFunction 避免因函数引用变化导致的无限循环
 */
export const useApiCall = <T,>(
  apiFunction: () => Promise<any>,
  autoFetch: boolean = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // 使用 ref 存储最新的 apiFunction，避免依赖变化导致重复调用
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunctionRef.current();
      setData(response.data || response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || '请求失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // 移除 apiFunction 依赖，使用 ref 代替

  // 自动获取数据 - 只在组件挂载时执行一次
  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
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
