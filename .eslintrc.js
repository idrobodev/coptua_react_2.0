/**
 * ESLint Configuration
 * 
 * This configuration extends Create React App's default ESLint setup,
 * which includes rules for React, JSX, and modern JavaScript.
 * 
 * The 'react-app' preset includes:
 * - ESLint recommended rules
 * - React-specific linting rules
 * - JSX accessibility rules
 * - Import/export validation
 * 
 * The 'react-app/jest' preset adds:
 * - Jest-specific linting rules
 * - Testing best practices
 * 
 * To customize this configuration, add your own rules below.
 * See: https://eslint.org/docs/rules/
 */
module.exports = {
  extends: [
    'react-app',      // CRA's base ESLint configuration
    'react-app/jest'  // Jest-specific rules for testing
  ],
  
  // Add custom rules here if needed
  // Example:
  // rules: {
  //   'no-console': 'warn',
  //   'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  // }
};
