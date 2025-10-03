import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing global performance monitoring state
 * Provides toggle functionality and persistence via localStorage
 */
const usePerformanceMonitoring = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (process.env.NODE_ENV !== 'development') return false;
    
    // Check environment variable first
    if (process.env.REACT_APP_PERFORMANCE_MONITORING === 'true') return true;
    
    // Check localStorage
    return localStorage.getItem('enablePerformanceMonitoring') === 'true';
  });

  const [overlayVisible, setOverlayVisible] = useState(() => {
    if (process.env.NODE_ENV !== 'development') return false;
    return localStorage.getItem('performanceOverlayVisible') === 'true';
  });

  // Persist settings to localStorage
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('enablePerformanceMonitoring', isEnabled.toString());
    }
  }, [isEnabled]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('performanceOverlayVisible', overlayVisible.toString());
    }
  }, [overlayVisible]);

  const toggleMonitoring = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const toggleOverlay = useCallback(() => {
    setOverlayVisible(prev => !prev);
  }, []);

  const enableMonitoring = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disableMonitoring = useCallback(() => {
    setIsEnabled(false);
  }, []);

  const showOverlay = useCallback(() => {
    setOverlayVisible(true);
  }, []);

  const hideOverlay = useCallback(() => {
    setOverlayVisible(false);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Shift + M to toggle monitoring
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        toggleMonitoring();
        console.log(`Performance monitoring ${!isEnabled ? 'enabled' : 'disabled'}`);
      }
      
      // Ctrl/Cmd + Shift + O to toggle overlay
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        toggleOverlay();
        console.log(`Performance overlay ${!overlayVisible ? 'shown' : 'hidden'}`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEnabled, overlayVisible, toggleMonitoring, toggleOverlay]);

  // Console commands for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Make functions available globally for console debugging
      window.performanceMonitoring = {
        toggle: toggleMonitoring,
        enable: enableMonitoring,
        disable: disableMonitoring,
        showOverlay,
        hideOverlay,
        isEnabled,
        overlayVisible
      };
    }

    return () => {
      if (window.performanceMonitoring) {
        delete window.performanceMonitoring;
      }
    };
  }, [
    toggleMonitoring, 
    enableMonitoring, 
    disableMonitoring, 
    showOverlay, 
    hideOverlay, 
    isEnabled, 
    overlayVisible
  ]);

  return {
    isEnabled,
    overlayVisible,
    toggleMonitoring,
    toggleOverlay,
    enableMonitoring,
    disableMonitoring,
    showOverlay,
    hideOverlay
  };
};

export default usePerformanceMonitoring;