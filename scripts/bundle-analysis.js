#!/usr/bin/env node

/**
 * Bundle Analysis Utilities
 * 
 * This script provides various bundle analysis capabilities:
 * - Interactive bundle analyzer
 * - Static HTML reports
 * - JSON stats generation
 * - Performance recommendations
 * 
 * Requirements addressed: 3.4, 4.3
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BUILD_DIR = path.join(__dirname, '../build');
const STATS_DIR = path.join(__dirname, '../build/stats');

// Ensure stats directory exists
if (!fs.existsSync(STATS_DIR)) {
  fs.mkdirSync(STATS_DIR, { recursive: true });
}

/**
 * Utility functions
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
};

/**
 * Run bundle analyzer in interactive mode
 */
const runInteractiveAnalyzer = () => {
  log('🔍 Starting interactive bundle analyzer...', 'info');
  log('This will build the app and open the analyzer in your browser.', 'info');
  
  try {
    execSync('cross-env ANALYZE_BUNDLE=true npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, ANALYZE_BUNDLE: 'true' }
    });
    log('✅ Bundle analysis complete! Check your browser.', 'success');
  } catch (error) {
    log('❌ Failed to run bundle analyzer', 'error');
    console.error(error.message);
    process.exit(1);
  }
};

/**
 * Generate static HTML report
 */
const generateStaticReport = () => {
  log('📊 Generating static bundle report...', 'info');
  
  try {
    execSync('cross-env ANALYZE_BUNDLE=true npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, ANALYZE_BUNDLE: 'true' }
    });
    
    const reportPath = path.join(BUILD_DIR, 'bundle-report.html');
    if (fs.existsSync(reportPath)) {
      log(`✅ Static report generated: ${reportPath}`, 'success');
      log('Open the HTML file in your browser to view the report.', 'info');
    } else {
      log('⚠️  Report file not found. Check build output.', 'warning');
    }
  } catch (error) {
    log('❌ Failed to generate static report', 'error');
    console.error(error.message);
    process.exit(1);
  }
};

/**
 * Generate detailed stats JSON
 */
const generateDetailedStats = () => {
  log('📈 Generating detailed bundle statistics...', 'info');
  
  try {
    execSync('cross-env GENERATE_STATS=true npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, GENERATE_STATS: 'true' }
    });
    
    const statsPath = path.join(BUILD_DIR, 'detailed-stats.json');
    if (fs.existsSync(statsPath)) {
      log(`✅ Detailed stats generated: ${statsPath}`, 'success');
      analyzeStats(statsPath);
    } else {
      log('⚠️  Stats file not found. Check build output.', 'warning');
    }
  } catch (error) {
    log('❌ Failed to generate detailed stats', 'error');
    console.error(error.message);
    process.exit(1);
  }
};

/**
 * Analyze stats and provide recommendations
 */
const analyzeStats = (statsPath) => {
  try {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    
    log('\n📋 Bundle Analysis Summary:', 'info');
    log('================================', 'info');
    
    // Asset analysis
    if (stats.assets) {
      const totalSize = stats.assets.reduce((sum, asset) => sum + asset.size, 0);
      log(`Total bundle size: ${formatBytes(totalSize)}`, 'info');
      
      // Find largest assets
      const largestAssets = stats.assets
        .sort((a, b) => b.size - a.size)
        .slice(0, 5);
      
      log('\n🔍 Largest assets:', 'info');
      largestAssets.forEach((asset, index) => {
        log(`${index + 1}. ${asset.name}: ${formatBytes(asset.size)}`, 'info');
      });
      
      // Check for large assets
      const largeAssets = stats.assets.filter(asset => asset.size > 1024 * 1024); // > 1MB
      if (largeAssets.length > 0) {
        log('\n⚠️  Large assets detected (>1MB):', 'warning');
        largeAssets.forEach(asset => {
          log(`- ${asset.name}: ${formatBytes(asset.size)}`, 'warning');
        });
      }
    }
    
    // Module analysis
    if (stats.modules) {
      const totalModules = stats.modules.length;
      log(`\nTotal modules: ${totalModules}`, 'info');
      
      // Find largest modules
      const largestModules = stats.modules
        .filter(module => module.size)
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);
      
      if (largestModules.length > 0) {
        log('\n📦 Largest modules:', 'info');
        largestModules.forEach((module, index) => {
          const name = module.name || module.identifier || 'Unknown';
          const displayName = name.length > 50 ? `${name.substring(0, 50)}...` : name;
          log(`${index + 1}. ${displayName}: ${formatBytes(module.size)}`, 'info');
        });
      }
      
      // Check for duplicate modules
      const moduleNames = stats.modules.map(m => m.name || m.identifier).filter(Boolean);
      const duplicates = moduleNames.filter((name, index) => 
        moduleNames.indexOf(name) !== index
      );
      
      if (duplicates.length > 0) {
        log('\n⚠️  Potential duplicate modules detected:', 'warning');
        [...new Set(duplicates)].forEach(name => {
          log(`- ${name}`, 'warning');
        });
      }
    }
    
    // Performance recommendations
    log('\n💡 Performance Recommendations:', 'info');
    log('================================', 'info');
    
    if (stats.assets) {
      const jsAssets = stats.assets.filter(asset => asset.name.endsWith('.js'));
      const cssAssets = stats.assets.filter(asset => asset.name.endsWith('.css'));
      
      const totalJsSize = jsAssets.reduce((sum, asset) => sum + asset.size, 0);
      const totalCssSize = cssAssets.reduce((sum, asset) => sum + asset.size, 0);
      
      if (totalJsSize > 2 * 1024 * 1024) { // > 2MB
        log('- Consider code splitting to reduce JavaScript bundle size', 'warning');
      }
      
      if (totalCssSize > 500 * 1024) { // > 500KB
        log('- Consider CSS optimization and unused CSS removal', 'warning');
      }
      
      if (jsAssets.length > 10) {
        log('- Consider consolidating JavaScript chunks', 'warning');
      }
    }
    
    log('- Use React.lazy() for route-based code splitting', 'info');
    log('- Implement tree shaking for unused code elimination', 'info');
    log('- Consider using a CDN for large third-party libraries', 'info');
    
  } catch (error) {
    log('❌ Failed to analyze stats file', 'error');
    console.error(error.message);
  }
};

/**
 * Compare bundle sizes between builds
 */
const compareBundles = (previousStatsPath) => {
  if (!fs.existsSync(previousStatsPath)) {
    log('❌ Previous stats file not found', 'error');
    return;
  }
  
  log('🔄 Generating current stats for comparison...', 'info');
  generateDetailedStats();
  
  const currentStatsPath = path.join(BUILD_DIR, 'detailed-stats.json');
  if (!fs.existsSync(currentStatsPath)) {
    log('❌ Current stats file not found', 'error');
    return;
  }
  
  try {
    const previousStats = JSON.parse(fs.readFileSync(previousStatsPath, 'utf8'));
    const currentStats = JSON.parse(fs.readFileSync(currentStatsPath, 'utf8'));
    
    log('\n📊 Bundle Size Comparison:', 'info');
    log('==========================', 'info');
    
    if (previousStats.assets && currentStats.assets) {
      const prevTotal = previousStats.assets.reduce((sum, asset) => sum + asset.size, 0);
      const currTotal = currentStats.assets.reduce((sum, asset) => sum + asset.size, 0);
      const diff = currTotal - prevTotal;
      const diffPercent = ((diff / prevTotal) * 100).toFixed(2);
      
      log(`Previous total: ${formatBytes(prevTotal)}`, 'info');
      log(`Current total: ${formatBytes(currTotal)}`, 'info');
      
      if (diff > 0) {
        log(`Size increase: +${formatBytes(diff)} (+${diffPercent}%)`, 'warning');
      } else if (diff < 0) {
        log(`Size decrease: ${formatBytes(Math.abs(diff))} (-${Math.abs(diffPercent)}%)`, 'success');
      } else {
        log('No size change', 'info');
      }
    }
    
  } catch (error) {
    log('❌ Failed to compare bundles', 'error');
    console.error(error.message);
  }
};

/**
 * Main CLI interface
 */
const main = () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🚀 Bundle Analysis Utilities\n');
  
  switch (command) {
    case 'interactive':
    case 'i':
      runInteractiveAnalyzer();
      break;
      
    case 'report':
    case 'r':
      generateStaticReport();
      break;
      
    case 'stats':
    case 's':
      generateDetailedStats();
      break;
      
    case 'compare':
    case 'c':
      const previousStatsPath = args[1];
      if (!previousStatsPath) {
        log('❌ Please provide path to previous stats file', 'error');
        log('Usage: npm run analyze:compare <path-to-previous-stats.json>', 'info');
        process.exit(1);
      }
      compareBundles(previousStatsPath);
      break;
      
    case 'help':
    case 'h':
    default:
      log('Available commands:', 'info');
      log('  interactive, i  - Run interactive bundle analyzer', 'info');
      log('  report, r       - Generate static HTML report', 'info');
      log('  stats, s        - Generate detailed JSON stats', 'info');
      log('  compare, c      - Compare with previous build', 'info');
      log('  help, h         - Show this help message', 'info');
      log('\nExamples:', 'info');
      log('  node scripts/bundle-analysis.js interactive', 'info');
      log('  node scripts/bundle-analysis.js report', 'info');
      log('  node scripts/bundle-analysis.js compare build/old-stats.json', 'info');
      break;
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  runInteractiveAnalyzer,
  generateStaticReport,
  generateDetailedStats,
  analyzeStats,
  compareBundles
};