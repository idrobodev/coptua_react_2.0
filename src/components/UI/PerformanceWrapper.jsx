import React, { useRef, useEffect, useState } from 'react';
import useRenderTracker from '../../hooks/useRenderTracker';

/**
 * Development-only wrapper component for monitoring component performance
 * Provides render count, timing measurements, and visual performance indicators
 */
const PerformanceWrapper = ({
  children,
  componentName = 'Unknown Component',
  showOverlay = false,
  threshold = 10,
  trackProps = false,
  ...props
}) => {
  const renderStartTime = useRef(Date.now());
  const mountTime = useRef(Date.now());
  const [renderTimes, setRenderTimes] = useState([]);
  const [isVisible, setIsVisible] = useState(showOverlay);

  // Use the render tracker hook
  const trackerProps = trackProps ? props : {};
  const renderStats = useRenderTracker(componentName, trackerProps, threshold);

  // Track render timing
  useEffect(() => {
    const renderEndTime = Date.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    setRenderTimes(prev => {
      const newTimes = [...prev, renderDuration];
      // Keep only last 10 render times to prevent memory leaks
      return newTimes.slice(-10);
    });

    renderStartTime.current = Date.now();

    // Emit performance data for global overlay
    const stats = renderStats?.getStats();
    if (stats) {
      const averageTime = renderTimes.length > 0
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
        : 0;

      const performanceEvent = new CustomEvent('performance-update', {
        detail: {
          componentName,
          stats: {
            ...stats,
            averageTime,
            lastRenderTime: renderDuration
          }
        }
      });

      window.dispatchEvent(performanceEvent);
    }
  });

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return children;
  }

  const stats = renderStats?.getStats();
  const averageRenderTime = renderTimes.length > 0
    ? Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length)
    : 0;
  const lastRenderTime = renderTimes[renderTimes.length - 1] || 0;
  const isSlowRender = lastRenderTime > 16; // Slower than 60fps
  const hasExcessiveRenders = stats?.renderCount > threshold;

  const overlayStyle = {
    position: 'relative',
    border: hasExcessiveRenders ? '2px solid red' : isSlowRender ? '2px solid orange' : '1px solid #ccc',
    borderRadius: '4px',
    margin: '2px'
  };

  const badgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: hasExcessiveRenders ? '#ff4444' : isSlowRender ? '#ff8800' : '#4CAF50',
    color: 'white',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '10px',
    zIndex: 1000,
    fontFamily: 'monospace',
    cursor: 'pointer',
    userSelect: 'none'
  };

  const detailsStyle = {
    position: 'absolute',
    top: '20px',
    right: '0px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace',
    zIndex: 1001,
    minWidth: '200px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  };

  const handleBadgeClick = (e) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleBadgeClick(e);
    }
  };

  return (
    <div style={showOverlay ? overlayStyle : {}}>
      {showOverlay && (
        <>
          <div
            style={badgeStyle}
            onClick={handleBadgeClick}
            onKeyPress={handleKeyPress}
            tabIndex={0}
            role="button"
            aria-label={`Performance stats for ${componentName}`}
            title="Click to toggle performance details"
          >
            {stats?.renderCount || 0}
          </div>

          {isVisible && (
            <div style={detailsStyle}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                📊 {componentName}
              </div>
              <div>Renders: {stats?.renderCount || 0}</div>
              <div>Last: {lastRenderTime}ms</div>
              <div>Avg: {averageRenderTime}ms</div>
              <div>Total: {stats?.totalTime || 0}ms</div>

              {hasExcessiveRenders && (
                <div style={{ color: '#ff6666', marginTop: '4px', fontSize: '10px' }}>
                  ⚠️ Excessive renders detected!
                </div>
              )}

              {isSlowRender && (
                <div style={{ color: '#ffaa66', marginTop: '4px', fontSize: '10px' }}>
                  🐌 Slow render detected
                </div>
              )}

              <div style={{ marginTop: '4px', fontSize: '9px', opacity: 0.7 }}>
                Click badge to hide
              </div>
            </div>
          )}
        </>
      )}

      {children}
    </div>
  );
};

// Higher-order component version for easier wrapping
export const withPerformanceTracking = (
  WrappedComponent,
  componentName,
  options = {}
) => {
  const WithPerformanceTracking = React.forwardRef((props, ref) => {
    return (
      <PerformanceWrapper
        componentName={componentName || WrappedComponent.displayName || WrappedComponent.name}
        {...options}
        {...props}
      >
        <WrappedComponent {...props} ref={ref} />
      </PerformanceWrapper>
    );
  });

  WithPerformanceTracking.displayName = `withPerformanceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPerformanceTracking;
};

export default PerformanceWrapper;