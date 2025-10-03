import { useCallback, useRef, useMemo } from 'react';

/**
 * A hook that provides optimized callback memoization with stable references
 * and automatic dependency tracking to prevent unnecessary re-renders.
 * 
 * @param {Function} callback - The callback function to memoize
 * @param {Array} dependencies - Array of dependencies for the callback
 * @param {Object} options - Configuration options
 * @param {boolean} options.deepCompare - Whether to perform deep comparison of dependencies
 * @returns {Function} Memoized callback with stable reference
 */
export default function useOptimizedCallback(callback, dependencies = [], options = {}) {
  const { deepCompare = false } = options;
  const callbackRef = useRef(callback);
  const depsRef = useRef(dependencies);
  const memoizedCallbackRef = useRef(null);
  
  // Update callback ref on every render to capture latest closure
  callbackRef.current = callback;
  
  // Memoize dependencies comparison
  const depsChanged = useMemo(() => {
    if (!depsRef.current || depsRef.current.length !== dependencies.length) {
      return true;
    }
    
    if (deepCompare) {
      return !deepEqual(depsRef.current, dependencies);
    }
    
    // Shallow comparison
    return dependencies.some((dep, index) => dep !== depsRef.current[index]);
  }, dependencies);
  
  // Create memoized callback only when dependencies change
  const memoizedCallback = useMemo(() => {
    if (depsChanged || !memoizedCallbackRef.current) {
      depsRef.current = dependencies;
      
      const optimizedCallback = (...args) => {
        // Always call the latest callback to avoid stale closures
        return callbackRef.current(...args);
      };
      
      memoizedCallbackRef.current = optimizedCallback;
      return optimizedCallback;
    }
    
    return memoizedCallbackRef.current;
  }, [depsChanged]);
  
  return memoizedCallback;
}

/**
 * Deep equality comparison for dependency arrays
 * @param {Array} a - First array
 * @param {Array} b - Second array
 * @returns {boolean} Whether arrays are deeply equal
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    const valA = a[i];
    const valB = b[i];
    
    if (valA === valB) continue;
    
    // Handle objects and arrays
    if (typeof valA === 'object' && typeof valB === 'object') {
      if (Array.isArray(valA) && Array.isArray(valB)) {
        if (!deepEqual(valA, valB)) return false;
      } else if (Array.isArray(valA) || Array.isArray(valB)) {
        return false;
      } else {
        // Simple object comparison
        const keysA = Object.keys(valA);
        const keysB = Object.keys(valB);
        if (keysA.length !== keysB.length) return false;
        
        for (const key of keysA) {
          if (!keysB.includes(key) || valA[key] !== valB[key]) {
            return false;
          }
        }
      }
    } else {
      return false;
    }
  }
  
  return true;
}

/**
 * Alternative hook using React's built-in useCallback with enhanced features
 * Provides automatic dependency tracking and stable references
 * 
 * @param {Function} callback - The callback function to memoize
 * @param {Array} dependencies - Array of dependencies for the callback
 * @returns {Function} Memoized callback
 */
export function useStableCallback(callback, dependencies = []) {
  const callbackRef = useRef(callback);
  
  // Update callback ref to capture latest closure
  callbackRef.current = callback;
  
  // Use React's useCallback with stable wrapper
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, dependencies);
}