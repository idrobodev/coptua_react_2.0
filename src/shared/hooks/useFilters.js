import { useState, useCallback, useMemo } from 'react';

/**
 * useFilters hook - Manage filter state
 * 
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - { filters, setFilter, clearFilters, hasActiveFilters }
 */
const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== '' && 
      value !== 'all' && 
      value !== 'Todos' && 
      value !== 'Todas' &&
      value !== initialFilters[Object.keys(filters).find(key => filters[key] === value)]
    );
  }, [filters, initialFilters]);

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  };
};

export default useFilters;
