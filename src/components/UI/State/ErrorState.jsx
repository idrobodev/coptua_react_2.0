import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';

/**
 * ErrorState component - Display error message with retry option
 * 
 * @param {Object} props
 * @param {string} props.message - Error message
 * @param {Function} props.onRetry - Retry handler
 * @param {string} props.retryLabel - Retry button label
 * @param {string} props.icon - FontAwesome icon class
 * @param {string} props.className - Additional CSS classes
 */
const ErrorState = ({
  message,
  onRetry,
  retryLabel = 'Reintentar',
  icon = 'fas fa-exclamation-circle',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
        <i className={`${icon} text-red-600 text-5xl mb-4`}></i>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Algo salió mal
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        {onRetry && (
          <Button
            variant="danger"
            icon="fas fa-redo"
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

ErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string
};

export default ErrorState;
