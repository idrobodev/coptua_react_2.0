import React from 'react';

/**
 * PerformanceDebugOverlay component - Debug overlay for performance metrics
 * Displays performance information in development mode only
 * 
 * @returns {React.ReactElement|null} Debug overlay or null in production
 */
const PerformanceDebugOverlay = () => {
  // En desarrollo, mostrar un overlay simple
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        Performance Debug Overlay
      </div>
    );
  }

  return null;
};

export default PerformanceDebugOverlay;