import React from 'react';
import PropTypes from 'prop-types';

/**
 * GradientText component - Text with gradient color effect
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.from - Starting gradient color (Tailwind color class)
 * @param {string} props.to - Ending gradient color (Tailwind color class)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ElementType} props.as - HTML element to render as
 */
const GradientText = ({
  children,
  from = 'blue-600',
  to = 'purple-600',
  className = '',
  as: Component = 'span'
}) => {
  const gradientClass = `bg-gradient-to-r from-${from} to-${to} bg-clip-text text-transparent`;

  return (
    <Component className={`${gradientClass} ${className}`}>
      {children}
    </Component>
  );
};

GradientText.propTypes = {
  children: PropTypes.node.isRequired,
  from: PropTypes.string,
  to: PropTypes.string,
  className: PropTypes.string,
  as: PropTypes.elementType
};

export default GradientText;