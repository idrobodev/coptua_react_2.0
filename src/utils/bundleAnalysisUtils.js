/**
 * Bundle Analysis Utilities for Development
 * 
 * These utilities provide runtime bundle analysis capabilities
 * and integrate with the performance debugging overlay
 * 
 * Requirements addressed: 3.4, 4.3
 */

/**
 * Get basic bundle information from webpack stats
 */
export const getBundleInfo = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // This information is available at build time
  const bundleInfo = {
    environment: process.env.NODE_ENV,
    buildTime: process.env.REACT_APP_BUILD_TIME || 'Unknown',
    version: process.env.REACT_APP_VERSION || '0.1.0',
    
    // Estimated bundle information (these would be populated by build process)
    estimatedSize: 'Run build:analyze for accurate size',
    chunks: 'Run build:stats for chunk information',
    
    // Development server info
    devServer: {
      port: process.env.PORT || 3001,
      host: 'localhost',
      hotReload: true,
      fastRefresh: true
    }
  };

  return bundleInfo;
};

/**
 * Performance metrics for the current session
 */
export const getPerformanceMetrics = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0];
  const paintEntries = performance.getEntriesByType('paint');
  
  const metrics = {
    // Navigation timing
    domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : 0,
    loadComplete: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0,
    
    // Paint timing
    firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // Memory usage (if available)
    memoryUsage: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    } : null,
    
    // Connection info
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : null
  };

  return metrics;
};

/**
 * Bundle analysis recommendations based on current metrics
 */
export const getBundleRecommendations = () => {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  const recommendations = [];
  const metrics = getPerformanceMetrics();
  
  if (metrics) {
    // Check for slow loading
    if (metrics.firstContentfulPaint > 2000) {
      recommendations.push({
        type: 'warning',
        title: 'Slow First Contentful Paint',
        description: 'Consider code splitting and lazy loading',
        action: 'Run npm run analyze:interactive to identify large bundles'
      });
    }
    
    // Check memory usage
    if (metrics.memoryUsage && metrics.memoryUsage.used > 50) {
      recommendations.push({
        type: 'warning',
        title: 'High Memory Usage',
        description: `Using ${metrics.memoryUsage.used}MB of JavaScript heap`,
        action: 'Check for memory leaks and optimize component re-renders'
      });
    }
    
    // Check connection
    if (metrics.connection && metrics.connection.effectiveType === 'slow-2g') {
      recommendations.push({
        type: 'info',
        title: 'Slow Connection Detected',
        description: 'Consider optimizing for low-bandwidth users',
        action: 'Implement progressive loading and image optimization'
      });
    }
  }
  
  // General recommendations
  recommendations.push({
    type: 'info',
    title: 'Bundle Analysis Available',
    description: 'Use built-in tools to analyze your bundle',
    action: 'Run npm run analyze:interactive for detailed analysis'
  });
  
  return recommendations;
};

/**
 * Format bytes for display
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get webpack chunk information (development only)
 */
export const getChunkInfo = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // In development, we can access some webpack information
  const chunkInfo = {
    hotReloadEnabled: !!module.hot,
    fastRefreshEnabled: process.env.FAST_REFRESH !== 'false',
    
    // These would be populated by webpack at build time
    totalChunks: 'Available after build',
    entryChunks: 'Available after build',
    asyncChunks: 'Available after build'
  };

  return chunkInfo;
};

/**
 * Development-only bundle analysis commands
 */
export const bundleCommands = {
  // Open interactive analyzer
  openAnalyzer: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 To analyze your bundle, run:');
      console.log('npm run analyze:interactive');
      console.log('\nOr for a static report:');
      console.log('npm run analyze:report');
    }
  },
  
  // Show available commands
  showCommands: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Available bundle analysis commands:');
      console.log('npm run analyze:interactive - Interactive bundle analyzer');
      console.log('npm run analyze:report - Static HTML report');
      console.log('npm run analyze:stats - Detailed JSON statistics');
      console.log('npm run build:analyze - Build with analysis');
      console.log('npm run build:stats - Build with detailed stats');
    }
  },
  
  // Quick performance check
  checkPerformance: () => {
    if (process.env.NODE_ENV === 'development') {
      const metrics = getPerformanceMetrics();
      console.log('⚡ Performance Metrics:', metrics);
      
      const recommendations = getBundleRecommendations();
      if (recommendations.length > 0) {
        console.log('💡 Recommendations:');
        recommendations.forEach(rec => {
          console.log(`${rec.type === 'warning' ? '⚠️' : 'ℹ️'} ${rec.title}: ${rec.description}`);
        });
      }
    }
  }
};

// Make commands available globally in development
if (process.env.NODE_ENV === 'development') {
  window.bundleAnalysis = bundleCommands;
}