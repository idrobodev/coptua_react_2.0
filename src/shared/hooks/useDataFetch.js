import { useState, useEffect, useCallback } from 'react';

/**
 * useDataFetch hook - Fetch data with loading and error states
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Array} deps - Dependencies array
 * @returns {Object} - { data, loading, error, refetch }
 */
const useDataFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

export default useDataFetch;
