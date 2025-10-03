import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';

/**
 * EmptyState component - Display empty state with optional action
 * 
 * @param {Object} props
 * @param {string} props.icon - FontAwesome icon class
 * @param {string} props.title - Empty state title
 * @param {string} props.message - Empty state message
 * @param {Object} props.action - Action button {label, onClick}
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({
  icon = 'fas fa-inbox',
  title,
  message,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="text-center max-w-md">
        <i className={`${icon} text-gray-300 text-6xl mb-4`}></i>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        {message && (
          <p className="text-gray-500 mb-6">
            {message}
          </p>
        )}
        {action && (
          <Button
            variant="primary"
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.string
  }),
  className: PropTypes.string
};

export default EmptyState;
