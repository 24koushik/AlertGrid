import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useFetch<T>(url: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data);
      if (options?.onSuccess) options.onSuccess(response.data);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errMsg);
      if (options?.onError) options.onError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
