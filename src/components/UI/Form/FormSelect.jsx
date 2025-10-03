import React from 'react';
import PropTypes from 'prop-types';

/**
 * FormSelect component - Styled select dropdown with label and error handling
 * 
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {string} props.name - Select name
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 */
const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = 'Seleccionar...',
  className = '',
  ...rest
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    // Try to parse as number if the original value was a number
    const parsedValue = !isNaN(newValue) && newValue !== '' ? parseFloat(newValue) : newValue;
    onChange(parsedValue);
  };

  const selectClasses = `
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
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
        {...rest}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

FormSelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default FormSelect;
