import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingState component - Display loading spinner with optional message
 * 
 * @param {Object} props
 * @param {string} props.message - Loading message
 * @param {'sm'|'md'|'lg'} props.size - Spinner size
 * @param {boolean} props.fullScreen - Full screen overlay
 * @param {string} props.className - Additional CSS classes
 */
const LoadingState = ({
  message = 'Cargando...',
  size = 'md',
  fullScreen = false,
  className = ''
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const spinnerClasses = `fas fa-spinner fa-spin ${sizeStyles[size]} text-blue-600`;

  const content = (
    <div className="flex flex-col items-center justify-center">
      <i className={spinnerClasses}></i>
      {message && (
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      {content}
    </div>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingState;
