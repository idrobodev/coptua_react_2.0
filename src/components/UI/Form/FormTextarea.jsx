import React from 'react';
import PropTypes from 'prop-types';

/**
 * FormTextarea component - Styled textarea with label and error handling
 * 
 * @param {Object} props
 * @param {string} props.label - Textarea label
 * @param {string} props.name - Textarea name
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.rows - Number of rows
 * @param {string} props.className - Additional CSS classes
 */
const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  rows = 3,
  className = '',
  ...rest
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const textareaClasses = `
    w-full
    border
    ${error ? 'border-red-300' : 'border-gray-300'}
    rounded-lg
    px-3
    py-2
    focus:ring-2
    focus:ring-blue-500
    focus:border-transparent
    disabled:bg-gray-100
    disabled:cursor-not-allowed
    transition-colors
    resize-vertical
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={textareaClasses}
        {...rest}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

FormTextarea.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  className: PropTypes.string
};

export default FormTextarea;
