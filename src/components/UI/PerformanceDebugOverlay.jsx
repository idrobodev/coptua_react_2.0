import React, { useState, useEffect, useRef } from 'react';
import { ENABLE_PERFORMANCE_MONITORING, PERFORMANCE_CONFIG } from '../../utils/performanceUtils';
import { getBundleInfo, getPerformanceMetrics, getBundleRecommendations } from '../../utils/bundleAnalysisUtils';

/**
 * Global performance debugging overlay for development
 * Shows component render information and provides toggle functionality
 */
const PerformanceDebugOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [performanceData, setPerformanceData] = useState({});
  const [sortBy, setSortBy] = useState('renderCount');
  const [activeTab, setActiveTab] = useState('components');
  const [bundleInfo, setBundleInfo] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const intervalRef = useRef();

  useEffect(() => {
    // Initialize bundle info and performance metrics
    setBundleInfo(getBundleInfo());
    setPerformanceMetrics(getPerformanceMetrics());
    
    // Listen for performance data updates from components
    const handlePerformanceUpdate = (event) => {
      const { componentName, stats } = event.detail;
      setPerformanceData(prev => ({
        ...prev,
        [componentName]: {
          ...stats,
          lastUpdate: Date.now()
        }
      }));
    };

    // Clean up old data periodically
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setPerformanceData(prev => {
        const filtered = {};
        Object.entries(prev).forEach(([name, data]) => {
          // Keep data for 30 seconds after last update
          if (now - data.lastUpdate < 30000) {
            filtered[name] = data;
          }
        });
        return filtered;
      });
    }, 5000);

    window.addEventListener('performance-update', handlePerformanceUpdate);
    
    return () => {
      window.removeEventListener('performance-update', handlePerformanceUpdate);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Keyboard shortcut to toggle overlay (Ctrl/Cmd + Shift + P)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Only render in development mode when performance monitoring is enabled
  if (process.env.NODE_ENV !== 'development' || !ENABLE_PERFORMANCE_MONITORING) {
    return null;
  }

  const sortedComponents = Object.entries(performanceData)
    .sort(([, a], [, b]) => {
      switch (sortBy) {
        case 'renderCount':
          return (b.renderCount || 0) - (a.renderCount || 0);
        case 'totalTime':
          return (b.totalTime || 0) - (a.totalTime || 0);
        case 'averageTime':
          return (b.averageTime || 0) - (a.averageTime || 0);
        case 'name':
          return a.localeCompare(b);
        default:
          return 0;
      }
    });

  const overlayStyles = {
    position: 'fixed',
    top: isMinimized ? '10px' : '10px',
    right: '10px',
    width: isMinimized ? '200px' : '400px',
    maxHeight: isMinimized ? '40px' : '80vh',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    color: 'white',
    borderRadius: '8px',
    padding: '12px',
    fontFamily: 'monospace',
    fontSize: '12px',
    zIndex: 10000,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    border: '1px solid #333',
    overflow: isMinimized ? 'hidden' : 'auto',
    transition: 'all 0.3s ease'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMinimized ? '0' : '12px',
    borderBottom: isMinimized ? 'none' : '1px solid #444',
    paddingBottom: isMinimized ? '0' : '8px'
  };

  const buttonStyles = {
    background: 'none',
    border: '1px solid #666',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    marginLeft: '4px'
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px'
  };

  const cellStyles = {
    padding: '4px 8px',
    borderBottom: '1px solid #333',
    textAlign: 'left'
  };

  const headerCellStyles = {
    ...cellStyles,
    backgroundColor: '#222',
    cursor: 'pointer',
    userSelect: 'none'
  };

  if (!isVisible) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontFamily: 'monospace',
          cursor: 'pointer',
          zIndex: 10000,
          border: '1px solid #444'
        }}
        onClick={() => setIsVisible(true)}
        title="Click to show performance overlay (Ctrl/Cmd + Shift + P)"
      >
        📊 Performance
      </div>
    );
  }

  return (
    <div style={overlayStyles}>
      <div style={headerStyles}>
        <div style={{ fontWeight: 'bold' }}>
          📊 Performance Monitor
          {!isMinimized && (
            <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '8px' }}>
              ({sortedComponents.length} components)
            </span>
          )}
        </div>
        <div>
          <button
            style={buttonStyles}
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '▼' : '▲'}
          </button>
          <button
            style={buttonStyles}
            onClick={() => setPerformanceData({})}
            title="Clear data"
          >
            🗑️
          </button>
          <button
            style={buttonStyles}
            onClick={() => setIsVisible(false)}
            title="Hide overlay"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div style={{ marginBottom: '8px', fontSize: '10px', opacity: 0.8 }}>
            Keyboard shortcut: Ctrl/Cmd + Shift + P
          </div>

          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            marginBottom: '12px',
            borderBottom: '1px solid #444'
          }}>
            {[
              { key: 'components', label: '📊 Components' },
              { key: 'bundle', label: '📦 Bundle' },
              { key: 'metrics', label: '⚡ Metrics' }
            ].map(tab => (
              <button
                key={tab.key}
                style={{
                  ...buttonStyles,
                  backgroundColor: activeTab === tab.key ? '#444' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid #66ff66' : '2px solid transparent',
                  borderRadius: '0',
                  marginLeft: '0',
                  marginRight: '8px',
                  padding: '8px 12px'
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'components' && (
            <>
              {sortedComponents.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                  No performance data available.
                  <br />
                  Components with PerformanceWrapper will appear here.
                </div>
              ) : (
                <table style={tableStyles}>
                  <thead>
                    <tr>
                      <th
                        style={headerCellStyles}
                        onClick={() => setSortBy('name')}
                        title="Click to sort by name"
                      >
                        Component {sortBy === 'name' && '↓'}
                      </th>
                      <th
                        style={headerCellStyles}
                        onClick={() => setSortBy('renderCount')}
                        title="Click to sort by render count"
                      >
                        Renders {sortBy === 'renderCount' && '↓'}
                      </th>
                      <th
                        style={headerCellStyles}
                        onClick={() => setSortBy('totalTime')}
                        title="Click to sort by total time"
                      >
                        Total {sortBy === 'totalTime' && '↓'}
                      </th>
                      <th
                        style={headerCellStyles}
                        onClick={() => setSortBy('averageTime')}
                        title="Click to sort by average time"
                      >
                        Avg {sortBy === 'averageTime' && '↓'}
                      </th>
                      <th style={headerCellStyles}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedComponents.map(([name, data]) => {
                      const isExcessive = (data.renderCount || 0) > PERFORMANCE_CONFIG.DEFAULT_RENDER_THRESHOLD;
                      const isSlow = (data.averageTime || 0) > PERFORMANCE_CONFIG.SLOW_RENDER_THRESHOLD;
                      
                      return (
                        <tr key={name}>
                          <td style={cellStyles}>
                            <span title={name}>
                              {name.length > 15 ? `${name.substring(0, 15)}...` : name}
                            </span>
                          </td>
                          <td style={cellStyles}>{data.renderCount || 0}</td>
                          <td style={cellStyles}>{Math.round(data.totalTime || 0)}ms</td>
                          <td style={cellStyles}>{Math.round(data.averageTime || 0)}ms</td>
                          <td style={cellStyles}>
                            {isExcessive && <span style={{ color: '#ff6666' }}>⚠️</span>}
                            {isSlow && <span style={{ color: '#ffaa66' }}>🐌</span>}
                            {!isExcessive && !isSlow && <span style={{ color: '#66ff66' }}>✓</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}

          {activeTab === 'bundle' && (
            <div>
              {bundleInfo ? (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📦 Bundle Information</div>
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      <div>Environment: {bundleInfo.environment}</div>
                      <div>Version: {bundleInfo.version}</div>
                      <div>Build Time: {bundleInfo.buildTime}</div>
                      <div>Bundle Size: {bundleInfo.estimatedSize}</div>
                      <div>Chunks: {bundleInfo.chunks}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔥 Dev Server</div>
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      <div>Port: {bundleInfo.devServer.port}</div>
                      <div>Hot Reload: {bundleInfo.devServer.hotReload ? '✅' : '❌'}</div>
                      <div>Fast Refresh: {bundleInfo.devServer.fastRefresh ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔍 Analysis Commands</div>
                    <div style={{ fontSize: '10px', lineHeight: '1.4', opacity: 0.8 }}>
                      <div>npm run analyze:interactive</div>
                      <div>npm run analyze:report</div>
                      <div>npm run analyze:stats</div>
                      <div>npm run build:analyze</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                  Bundle information not available
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div>
              {performanceMetrics ? (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚡ Performance Metrics</div>
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      <div>DOM Content Loaded: {performanceMetrics.domContentLoaded}ms</div>
                      <div>Load Complete: {performanceMetrics.loadComplete}ms</div>
                      <div>First Paint: {Math.round(performanceMetrics.firstPaint)}ms</div>
                      <div>First Contentful Paint: {Math.round(performanceMetrics.firstContentfulPaint)}ms</div>
                    </div>
                  </div>
                  
                  {performanceMetrics.memoryUsage && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🧠 Memory Usage</div>
                      <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                        <div>Used: {performanceMetrics.memoryUsage.used}MB</div>
                        <div>Total: {performanceMetrics.memoryUsage.total}MB</div>
                        <div>Limit: {performanceMetrics.memoryUsage.limit}MB</div>
                      </div>
                    </div>
                  )}
                  
                  {performanceMetrics.connection && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🌐 Connection</div>
                      <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                        <div>Type: {performanceMetrics.connection.effectiveType}</div>
                        <div>Downlink: {performanceMetrics.connection.downlink} Mbps</div>
                        <div>RTT: {performanceMetrics.connection.rtt}ms</div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>💡 Recommendations</div>
                    <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                      {getBundleRecommendations().map((rec, index) => (
                        <div key={index} style={{ 
                          marginBottom: '4px',
                          color: rec.type === 'warning' ? '#ffaa66' : '#66ff66'
                        }}>
                          {rec.type === 'warning' ? '⚠️' : 'ℹ️'} {rec.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                  Performance metrics not available
                </div>
              )}
            </div>
          )}

          <div style={{ 
            marginTop: '12px', 
            fontSize: '10px', 
            opacity: 0.6,
            borderTop: '1px solid #333',
            paddingTop: '8px'
          }}>
            {activeTab === 'components' && 'Legend: ⚠️ Excessive renders | 🐌 Slow renders | ✓ Good performance'}
            {activeTab === 'bundle' && 'Use console: window.bundleAnalysis.showCommands()'}
            {activeTab === 'metrics' && 'Metrics updated on page load. Refresh to update.'}
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceDebugOverlay;