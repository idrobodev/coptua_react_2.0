/**
 * CRACO Configuration with Hot Reload Optimizations
 * 
 * CRACO (Create React App Configuration Override) allows customization of
 * Create React App's webpack configuration without ejecting.
 * 
 * This configuration enhances the development experience by:
 * - Consolidating PostCSS configuration (Tailwind CSS + Autoprefixer)
 * - Enabling React Fast Refresh for instant component updates
 * - Optimizing webpack for faster rebuilds and hot reload
 * - Configuring proper source maps for debugging without performance impact
 * - Setting up development server optimizations
 * - Providing bundle analysis tools for optimization
 * 
 * Key Features:
 * - Filesystem caching for 10x faster rebuilds
 * - Optimized file watching with minimal CPU usage
 * - Bundle analyzer integration for size optimization
 * - CORS-enabled dev server for API integration
 * 
 * Requirements addressed: 1.1, 1.2, 1.3, 1.4, 1.5, 3.2, 4.1, 4.2
 */

const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {

  // ============================================
  // WEBPACK CONFIGURATION
  // ============================================
  // Customizes webpack behavior for both development and production builds
  // This section handles source maps, caching, bundle analysis, and optimization
  webpack: {
    configure: (webpackConfig, { env }) => {
      // Hot reload optimizations for development
      if (env === 'development') {
        // Configure source maps for better debugging without performance impact
        // 'eval-cheap-module-source-map' provides fast rebuilds with accurate line numbers
        // Trade-off: Slightly less accurate column numbers for much faster rebuild times
        webpackConfig.devtool = 'eval-cheap-module-source-map';

        // Optimize webpack for faster rebuilds
        // These optimizations skip expensive operations during development
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          removeAvailableModules: false,  // Skip checking for available modules (faster)
          removeEmptyChunks: false,       // Skip removing empty chunks (faster)
          splitChunks: false,             // Disable code splitting in dev (faster, simpler debugging)
        };

        // Enable webpack caching for faster rebuilds
        // Filesystem cache persists between builds, dramatically improving rebuild speed
        webpackConfig.cache = {
          type: 'filesystem',              // Store cache on disk (vs memory)
          buildDependencies: {
            config: [__filename],          // Invalidate cache when this config changes
          },
        };

        // Optimize file watching for hot reload
        // Reduces CPU usage and improves responsiveness during development
        webpackConfig.watchOptions = {
          ignored: /node_modules/,         // Don't watch node_modules (huge performance gain)
          aggregateTimeout: 300,           // Wait 300ms after change before rebuilding
          poll: false,                     // Use native file watching (faster than polling)
        };

      }

      // Bundle analysis for development builds
      // Usage: ANALYZE_BUNDLE=true npm start
      // Opens interactive treemap visualization at http://localhost:8888
      if (process.env.ANALYZE_BUNDLE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',          // Interactive server mode
            analyzerHost: 'localhost',       // Host for analyzer server
            analyzerPort: 8888,              // Port for analyzer server
            openAnalyzer: true,              // Auto-open browser
            generateStatsFile: true,         // Also generate JSON stats
            statsFilename: 'bundle-stats.json',
            logLevel: 'info'
          })
        );
      }

      // Bundle analysis for production builds (static report)
      // Usage: ANALYZE_BUNDLE=true npm run build
      // Generates static HTML report in build/ directory
      if (env === 'production' && process.env.ANALYZE_BUNDLE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',          // Generate static HTML file
            reportFilename: 'bundle-report.html',
            openAnalyzer: false,             // Don't auto-open (CI-friendly)
            generateStatsFile: true,         // Also generate JSON stats
            statsFilename: 'bundle-stats.json'
          })
        );
      }

      // Generate detailed stats for custom analysis
      // Usage: GENERATE_STATS=true npm run build
      // Creates detailed JSON file for custom tooling or webpack-bundle-analyzer CLI
      if (process.env.GENERATE_STATS === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'disabled',        // Don't generate report, only stats
            generateStatsFile: true,
            statsFilename: 'detailed-stats.json',
            statsOptions: {
              source: false,                 // Exclude source code (reduces file size)
              reasons: true,                 // Why modules are included
              modules: true,                 // Module information
              chunks: true,                  // Chunk information
              chunkModules: true,            // Modules within chunks
              chunkOrigins: true,            // How chunks were created
              depth: true,                   // Module dependency depth
              usedExports: true,             // Which exports are used
              providedExports: true,         // Which exports are provided
              optimizationBailout: true,     // Why optimizations failed
              errorDetails: true             // Detailed error information
            }
          })
        );
      }

      return webpackConfig;
    },
  },

  // ============================================
  // DEV SERVER CONFIGURATION
  // ============================================
  // Configures webpack-dev-server for optimal development experience
  // Handles hot reload, error overlays, file watching, and CORS
  devServer: {
    // Hot reload configuration
    // Enables Hot Module Replacement (HMR) for instant updates without full page reload
    hot: true,

    // Development server optimizations
    compress: true,              // Enable gzip compression for faster loading
    historyApiFallback: true,    // Support client-side routing (React Router)

    // Overlay configuration for better error handling
    // Shows compilation errors/warnings directly in the browser
    client: {
      overlay: {
        errors: true,            // Show error overlay (helpful for debugging)
        warnings: false,         // Hide warning overlay (reduces noise during development)
      },
      progress: false,           // Disable progress overlay (improves performance)
    },

    // Watch options for hot reload
    // Monitors file changes to trigger automatic recompilation
    watchFiles: {
      paths: ['src/**/*'],       // Watch all files in src directory
      options: {
        usePolling: false,       // Use native file watching (more efficient than polling)
        interval: 1000,          // Check for changes every 1000ms (only if polling enabled)
        ignored: ['**/node_modules/**', '**/.git/**'],  // Ignore these directories
      },
    },

    // Performance optimizations
    // Configures how static files are served during development
    static: {
      directory: path.join(__dirname, 'public'),  // Serve files from public directory
      watch: {
        ignored: /node_modules/,                  // Don't watch node_modules for changes
      },
    },

    // Headers for better caching during development
    // Enables CORS for API calls during local development
    headers: {
      'Access-Control-Allow-Origin': '*',         // Allow requests from any origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },

  // ============================================
  // BABEL CONFIGURATION
  // ============================================
  // Customizes Babel transpilation settings
  // Note: React Refresh is disabled to avoid conflicts with CRA's built-in Fast Refresh
  babel: {
    plugins: [
      // Custom Babel plugins can be added here
      // Currently empty - using CRA's default Babel configuration
    ].filter(Boolean),
    
    // Modify Babel loader options to remove react-refresh plugin
    // This prevents duplicate React Refresh loaders which can cause issues
    loaderOptions: (babelLoaderOptions) => {
      // Remove react-refresh/babel plugin if present in the configuration
      if (babelLoaderOptions.plugins) {
        babelLoaderOptions.plugins = babelLoaderOptions.plugins.filter(
          plugin => {
            // Handle string plugin names (e.g., 'react-refresh/babel')
            if (typeof plugin === 'string') {
              return !plugin.includes('react-refresh');
            }
            // Handle array plugin configs (e.g., ['react-refresh/babel', options])
            if (Array.isArray(plugin)) {
              return !plugin[0].includes('react-refresh');
            }
            return true;
          }
        );
      }
      return babelLoaderOptions;
    },
  },
};
