import { useState, useMemo } from 'react';

/**
 * Custom hook for pagination logic
 * 
 * @param {Array} data - The array of data to paginate
 * @param {number} pageSize - Number of items per page (default: 10)
 * @returns {Object} Pagination state and functions
 * 
 * @example
 * const { 
 *   currentPage, 
 *   totalPages, 
 *   paginatedData, 
 *   setPage, 
 *   nextPage, 
 *   prevPage 
 * } = usePagination(items, 10);
 */
export const usePagination = (data, pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / pageSize);
  }, [data.length, pageSize]);

  // Calculate start and end indices
  const { startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return { startIndex: start, endIndex: end };
  }, [currentPage, pageSize]);

  // Calculate paginated data slice
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Set page function with validation
  const setPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Navigate to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Navigate to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Reset to first page
  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    pageSize,
    setPage,
    nextPage,
    prevPage,
    resetPage,
    paginatedData,
    startIndex,
    endIndex,
    // Additional helper properties
    totalItems: data.length,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startItem: data.length > 0 ? startIndex + 1 : 0,
    endItem: Math.min(endIndex, data.length)
  };
};

export default usePagination;
