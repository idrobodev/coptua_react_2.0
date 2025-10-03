/**
 * CRACO Configuration with Hot Reload Optimizations
 * 
 * This configuration enhances the development experience by:
 * - Enabling React Fast Refresh for instant component updates
 * - Optimizing webpack for faster rebuilds and hot reload
 * - Configuring proper source maps for debugging without performance impact
 * - Setting up development server optimizations
 * 
 * Requirements addressed: 1.1, 1.2, 1.3, 4.1, 4.2
 */

const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  // PostCSS configuration moved to postcss.config.js

  webpack: {
    configure: (webpackConfig, { env }) => {
      // Hot reload optimizations for development
      if (env === 'development') {
        // Configure source maps for better debugging without performance impact
        webpackConfig.devtool = 'eval-cheap-module-source-map';

        // Optimize webpack for faster rebuilds
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };

        // Enable webpack caching for faster rebuilds
        webpackConfig.cache = {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
        };

        // Optimize file watching
        webpackConfig.watchOptions = {
          ignored: /node_modules/,
          aggregateTimeout: 300,
          poll: false,
        };

      }

      // Bundle analysis for development builds
      if (process.env.ANALYZE_BUNDLE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerHost: 'localhost',
            analyzerPort: 8888,
            openAnalyzer: true,
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json',
            logLevel: 'info'
          })
        );
      }

      // Bundle analysis for production builds (static report)
      if (env === 'production' && process.env.ANALYZE_BUNDLE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-report.html',
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json'
          })
        );
      }

      // Generate detailed stats for custom analysis
      if (process.env.GENERATE_STATS === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'disabled',
            generateStatsFile: true,
            statsFilename: 'detailed-stats.json',
            statsOptions: {
              source: false,
              reasons: true,
              modules: true,
              chunks: true,
              chunkModules: true,
              chunkOrigins: true,
              depth: true,
              usedExports: true,
              providedExports: true,
              optimizationBailout: true,
              errorDetails: true
            }
          })
        );
      }

      return webpackConfig;
    },
  },

  devServer: {
    // Hot reload configuration
    hot: true,

    // Development server optimizations
    compress: true,
    historyApiFallback: true,

    // Overlay configuration for better error handling
    client: {
      overlay: {
        errors: true,
        warnings: false, // Only show errors to reduce noise
      },
      progress: false, // Disable progress overlay for better performance
    },

    // Watch options for hot reload
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: false,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
    },

    // Performance optimizations
    static: {
      directory: path.join(__dirname, 'public'),
      watch: {
        ignored: /node_modules/,
      },
    },

    // Headers for better caching during development
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },

  // Babel configuration - Disable React Refresh to avoid duplicate loaders
  babel: {
    plugins: [
      // Remove react-refresh babel plugin
    ].filter(Boolean),
    loaderOptions: (babelLoaderOptions) => {
      // Remove react-refresh/babel plugin if present
      if (babelLoaderOptions.plugins) {
        babelLoaderOptions.plugins = babelLoaderOptions.plugins.filter(
          plugin => {
            if (typeof plugin === 'string') {
              return !plugin.includes('react-refresh');
            }
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
