import React from 'react';
import PropTypes from 'prop-types';

/**
 * ButtonGroup component for grouping buttons with consistent spacing
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button components
 * @param {'horizontal'|'vertical'} props.orientation - Layout direction
 * @param {'sm'|'md'|'lg'} props.spacing - Space between buttons
 * @param {'left'|'center'|'right'|'between'} props.align - Horizontal alignment
 * @param {string} props.className - Additional CSS classes
 */
const ButtonGroup = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  align = 'left',
  className = ''
}) => {
  // Spacing styles
  const spacingStyles = {
    horizontal: {
      sm: 'space-x-2',
      md: 'space-x-3',
      lg: 'space-x-4'
    },
    vertical: {
      sm: 'space-y-2',
      md: 'space-y-3',
      lg: 'space-y-4'
    }
  };

  // Alignment styles
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  // Orientation styles
  const orientationStyles = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };

  const groupClasses = `
    flex
    ${orientationStyles[orientation]}
    ${spacingStyles[orientation][spacing]}
    ${alignStyles[align]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  spacing: PropTypes.oneOf(['sm', 'md', 'lg']),
  align: PropTypes.oneOf(['left', 'center', 'right', 'between']),
  className: PropTypes.string
};

export default ButtonGroup;
