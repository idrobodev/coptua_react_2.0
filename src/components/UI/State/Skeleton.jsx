import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton component - Loading placeholder with pulse animation
 * 
 * @param {Object} props
 * @param {'text'|'title'|'card'|'circle'|'rectangle'} props.variant - Skeleton type
 * @param {string} props.width - Custom width
 * @param {string} props.height - Custom height
 * @param {number} props.count - Number of skeleton items
 * @param {string} props.className - Additional CSS classes
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = ''
}) => {
  // Variant styles
  const variantStyles = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    card: 'h-48 rounded-lg',
    circle: 'rounded-full',
    rectangle: 'rounded-lg'
  };

  const baseClasses = 'bg-gray-200 animate-pulse';
  const variantClass = variantStyles[variant];

  const skeletonStyle = {
    width: width || (variant === 'circle' ? '3rem' : '100%'),
    height: height || (variant === 'circle' ? '3rem' : undefined)
  };

  const skeletonClasses = `
    ${baseClasses}
    ${variantClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (count === 1) {
    return <div className={skeletonClasses} style={skeletonStyle} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} style={skeletonStyle} />
      ))}
    </div>
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'title', 'card', 'circle', 'rectangle']),
  width: PropTypes.string,
  height: PropTypes.string,
  count: PropTypes.number,
  className: PropTypes.string
};

export default Skeleton;
