/**
 * Performance monitoring utilities for development
 * These utilities help track component re-renders and identify performance issues
 */

import useRenderTracker from '../hooks/useRenderTracker';
import usePerformanceMonitoring from '../hooks/usePerformanceMonitoring';

/**
 * Example usage of useRenderTracker hook:
 * 
 * const MyComponent = ({ data, onUpdate }) => {
 *   // Track renders with props monitoring
 *   useRenderTracker('MyComponent', { data, onUpdate });
 *   
 *   return <div>Component content</div>;
 * };
 */

/**
 * Example usage of PerformanceWrapper component:
 * 
 * import PerformanceWrapper from '../components/UI/PerformanceWrapper';
 * 
 * const MyComponent = () => (
 *   <PerformanceWrapper 
 *     componentName="MyComponent"
 *     showOverlay={true}
 *     threshold={5}
 *     trackProps={true}
 *   >
 *     <SomeExpensiveComponent />
 *   </PerformanceWrapper>
 * );
 */

/**
 * Example usage of withPerformanceTracking HOC:
 * 
 * import { withPerformanceTracking } from '../components/UI/PerformanceWrapper';
 * 
 * const OptimizedComponent = withPerformanceTracking(
 *   MyComponent, 
 *   'MyComponent',
 *   { showOverlay: true, threshold: 8 }
 * );
 */

/**
 * Global performance monitoring toggle
 * Set this to true to enable performance monitoring across the app
 */
export const ENABLE_PERFORMANCE_MONITORING = process.env.NODE_ENV === 'development' && 
  (process.env.REACT_APP_PERFORMANCE_MONITORING === 'true' || 
   localStorage.getItem('enablePerformanceMonitoring') === 'true');

/**
 * Utility to conditionally wrap components with performance monitoring
 * @param {React.Component} Component - Component to wrap
 * @param {string} name - Component name for tracking
 * @param {Object} options - Performance monitoring options
 * @returns {React.Component} - Wrapped or original component
 */
export const conditionalPerformanceWrap = (Component, name, options = {}) => {
  if (ENABLE_PERFORMANCE_MONITORING) {
    // Lazy import to avoid circular dependency
    const { withPerformanceTracking } = require('../components/UI/PerformanceWrapper');
    return withPerformanceTracking(Component, name, options);
  }
  return Component;
};

/**
 * Performance monitoring configuration
 */
export const PERFORMANCE_CONFIG = {
  // Default threshold for excessive render warnings
  DEFAULT_RENDER_THRESHOLD: 10,
  
  // Threshold for slow render warnings (in milliseconds)
  SLOW_RENDER_THRESHOLD: 16,
  
  // Maximum number of render times to keep in memory
  MAX_RENDER_HISTORY: 10,
  
  // Maximum number of prop snapshots to keep
  MAX_PROP_HISTORY: 5,
  
  // Components that should always be monitored (if monitoring is enabled)
  ALWAYS_MONITOR: [
    'AuthProvider',
    'Dashboard',
    'Finance',
    'Participantes'
  ],
  
  // Components that should never be monitored (to avoid noise)
  NEVER_MONITOR: [
    'LoadingSpinner',
    'NotificationSystem'
  ]
};

/**
 * Utility to check if a component should be monitored
 * @param {string} componentName - Name of the component
 * @returns {boolean} - Whether the component should be monitored
 */
export const shouldMonitorComponent = (componentName) => {
  if (!ENABLE_PERFORMANCE_MONITORING) return false;
  if (PERFORMANCE_CONFIG.NEVER_MONITOR.includes(componentName)) return false;
  if (PERFORMANCE_CONFIG.ALWAYS_MONITOR.includes(componentName)) return true;
  
  // Default: monitor if explicitly enabled
  return true;
};

// Re-export hooks
export { 
  useRenderTracker, 
  usePerformanceMonitoring
};

// Lazy exports to avoid circular dependencies
export const getPerformanceWrapper = () => require('../components/UI/PerformanceWrapper').default;
export const getPerformanceDebugOverlay = () => require('../components/UI/PerformanceDebugOverlay').default;
export const getWithPerformanceTracking = () => require('../components/UI/PerformanceWrapper').withPerformanceTracking;