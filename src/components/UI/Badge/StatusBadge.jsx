import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusBadge component for displaying status indicators
 * 
 * @param {Object} props
 * @param {string} props.status - Status text to display
 * @param {'success'|'warning'|'danger'|'info'|'default'} props.variant - Color variant
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {string} props.icon - FontAwesome icon class
 * @param {Function} props.onClick - Click handler (makes badge clickable)
 * @param {string} props.className - Additional CSS classes
 */
const StatusBadge = ({
  status,
  variant = 'default',
  size = 'md',
  icon,
  onClick,
  className = '',
  ...rest
}) => {
  // Variant styles
  const variantStyles = {
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  // Icon size styles
  const iconSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Base styles
  const baseStyles = 'inline-flex items-center font-semibold rounded-full transition-colors duration-200';

  // Clickable styles
  const clickableStyles = onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500' : '';

  // Combine all styles
  const badgeClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${clickableStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {icon && (
        <i className={`${icon} ${iconSizeStyles[size]} ${status ? 'mr-1.5' : ''}`}></i>
      )}
      {status}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={badgeClasses}
        onClick={onClick}
        {...rest}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={badgeClasses} {...rest}>
      {content}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'default']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default StatusBadge;
