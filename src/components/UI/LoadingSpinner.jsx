import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner component - Reusable loading spinner with optional text
 * 
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Spinner size
 * @param {'blue'|'gray'|'white'} props.color - Spinner color
 * @param {string} props.text - Optional loading text
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  text = '',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-2 ${colorClasses[color]} ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['blue', 'gray', 'white']),
  text: PropTypes.string,
  className: PropTypes.string
};

export default LoadingSpinner;