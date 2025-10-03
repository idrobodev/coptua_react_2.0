import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatCard component for displaying statistics and metrics
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.icon - FontAwesome icon class
 * @param {'blue'|'green'|'red'|'purple'|'orange'|'gray'} props.color - Color scheme
 * @param {string} props.subtitle - Optional subtitle text
 * @param {Object} props.trend - Optional trend indicator {value: number, isPositive: boolean}
 * @param {Function} props.onClick - Optional click handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
const StatCard = ({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
  trend,
  onClick,
  loading = false,
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
    }
  };

  const scheme = colorSchemes[color];

  // Base styles
  const baseStyles = 'bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300';
  const hoverStyles = onClick ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : 'hover:shadow-xl';
  const clickableStyles = onClick ? 'group' : '';

  const cardClasses = `
    ${baseStyles}
    ${hoverStyles}
    ${clickableStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-Poppins font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-Lato font-bold mt-2 mb-1 text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs font-Poppins text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} mr-1`}></i>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={`p-4 bg-gradient-to-br ${scheme.gradient} rounded-2xl transition-transform duration-300 ${onClick ? 'group-hover:scale-110' : ''}`}>
          <i className={`${icon} ${scheme.text} text-2xl`}></i>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'purple', 'orange', 'gray']),
  subtitle: PropTypes.string,
  trend: PropTypes.shape({
    value: PropTypes.number.isRequired,
    isPositive: PropTypes.bool.isRequired
  }),
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default StatCard;
