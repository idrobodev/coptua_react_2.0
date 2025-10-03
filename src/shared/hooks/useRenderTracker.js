import { useRef, useEffect } from 'react';

/**
 * Development-only hook to track component re-renders and detect excessive re-rendering
 * @param {string} componentName - Name of the component being tracked
 * @param {Object} props - Component props to track changes (optional)
 * @param {number} threshold - Number of renders before warning (default: 10)
 */
const useRenderTracker = (componentName, props = {}, threshold = 10) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const propsHistory = useRef([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    renderCount.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    const totalTime = currentTime - startTime.current;

    // Track props changes
    const currentProps = { ...props };
    const previousProps = propsHistory.current[propsHistory.current.length - 1] || {};
    
    // Find changed props
    const changedProps = {};
    Object.keys(currentProps).forEach(key => {
      if (currentProps[key] !== previousProps[key]) {
        changedProps[key] = {
          from: previousProps[key],
          to: currentProps[key]
        };
      }
    });

    // Store current props for next comparison
    propsHistory.current.push(currentProps);
    
    // Keep only last 5 prop snapshots to prevent memory leaks
    if (propsHistory.current.length > 5) {
      propsHistory.current = propsHistory.current.slice(-5);
    }

    // Log render information
    const hasChangedProps = Object.keys(changedProps).length > 0;
    const logStyle = renderCount.current > threshold ? 'color: red; font-weight: bold;' : 'color: blue;';
    
    console.log(
      `%c🔄 ${componentName} rendered (#${renderCount.current})`,
      logStyle,
      {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        totalTime: `${totalTime}ms`,
        ...(hasChangedProps && { changedProps }),
        ...(renderCount.current === 1 && { note: 'Initial render' })
      }
    );

    // Warn about excessive re-renders
    if (renderCount.current > threshold) {
      console.warn(
        `⚠️ ${componentName} has rendered ${renderCount.current} times! This might indicate a performance issue.`,
        {
          component: componentName,
          renderCount: renderCount.current,
          averageRenderTime: `${Math.round(totalTime / renderCount.current)}ms`,
          suggestions: [
            'Check if props are being recreated on each render',
            'Consider using React.memo() if props rarely change',
            'Use useMemo() or useCallback() for expensive computations',
            'Verify context providers are not causing unnecessary re-renders'
          ]
        }
      );
    }

    // Warn about rapid re-renders (less than 16ms apart - faster than 60fps)
    if (timeSinceLastRender < 16 && renderCount.current > 1) {
      console.warn(
        `⚡ ${componentName} is re-rendering very rapidly (${timeSinceLastRender}ms since last render)`,
        {
          component: componentName,
          timeSinceLastRender: `${timeSinceLastRender}ms`,
          suggestion: 'Consider debouncing state updates or using React.memo()'
        }
      );
    }

    lastRenderTime.current = currentTime;
  });

  // Return render statistics for debugging
  return {
    renderCount: renderCount.current,
    getStats: () => ({
      componentName,
      renderCount: renderCount.current,
      totalTime: Date.now() - startTime.current,
      averageRenderTime: Math.round((Date.now() - startTime.current) / renderCount.current),
      propsHistory: propsHistory.current
    })
  };
};

export default useRenderTracker;