import React from 'react';
import PropTypes from 'prop-types';

/**
 * FormGroup component - Container for form fields with responsive grid layout
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form fields
 * @param {1|2|3|4} props.columns - Number of columns on desktop
 * @param {'sm'|'md'|'lg'} props.gap - Gap between fields
 * @param {string} props.className - Additional CSS classes
 */
const FormGroup = ({
  children,
  columns = 2,
  gap = 'md',
  className = ''
}) => {
  // Gap styles
  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  // Column styles for desktop
  const columnStyles = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  };

  const groupClasses = `
    grid
    grid-cols-1
    ${columnStyles[columns]}
    ${gapStyles[gap]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};

FormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.oneOf([1, 2, 3, 4]),
  gap: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default FormGroup;
