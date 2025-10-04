import React from 'react';
import PropTypes from 'prop-types';

/**
 * ActionCard component for quick action buttons with icon and label
 * 
 * @param {Object} props
 * @param {string} props.label - Action label text
 * @param {string} props.icon - FontAwesome icon class
 * @param {'blue'|'green'|'red'|'purple'|'orange'|'gray'|'indigo'} props.color - Color scheme
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 */
const ActionCard = ({
  label,
  icon,
  color = 'blue',
  onClick,
  disabled = false,
  className = ''
}) => {
  // Color schemes
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      gradient: 'from-blue-100 to-blue-200'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      gradient: 'from-green-100 to-green-200'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      gradient: 'from-red-100 to-red-200'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      gradient: 'from-purple-100 to-purple-200'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      gradient: 'from-orange-100 to-orange-200'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      gradient: 'from-gray-100 to-gray-200'
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      gradient: 'from-indigo-100 to-indigo-200'
    }
  };

  const scheme = colorSchemes[color];

  // Base styles
  const baseStyles = 'p-4 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 group';
  const hoverStyles = disabled ? '' : 'hover:shadow-xl hover:scale-105 cursor-pointer';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const cardClasses = `
    ${baseStyles}
    ${hoverStyles}
    ${disabledStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={cardClasses}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="flex flex-col items-center">
        <div className={`p-3 bg-gradient-to-br ${scheme.gradient} rounded-2xl mb-2 transition-transform duration-300 ${disabled ? '' : 'group-hover:scale-110'}`}>
          <i className={`${icon} ${scheme.text} text-xl`}></i>
        </div>
        <span className="text-xs font-Poppins font-medium text-gray-700 text-center">
          {label}
        </span>
      </div>
    </button>
  );
};

ActionCard.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'purple', 'orange', 'gray', 'indigo']),
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default ActionCard;
