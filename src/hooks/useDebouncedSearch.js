import { useState, useEffect, useRef, useMemo } from 'react';

export default function useDebouncedSearch(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);
  
  // Memoize delay to prevent unnecessary effect re-runs
  const memoizedDelay = useMemo(() => delay, [delay]);
  
  useEffect(() => {
    // Clear existing timeout to prevent memory leaks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Optimize: Don't set timeout if value hasn't actually changed
    if (debouncedValue === value) {
      return;
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      timeoutRef.current = null;
    }, memoizedDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, memoizedDelay, debouncedValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedValue;
}
