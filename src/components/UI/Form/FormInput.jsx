import React from 'react';
import PropTypes from 'prop-types';

/**
 * FormInput component - Styled input field with label and error handling
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.name - Input name
 * @param {'text'|'email'|'password'|'number'|'tel'|'date'} props.type - Input type
 * @param {string|number} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.icon - FontAwesome icon class
 * @param {string} props.className - Additional CSS classes
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  icon,
  className = '',
  ...rest
}) => {
  const handleChange = (e) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
    onChange(newValue);
  };

  const inputClasses = `
    w-full
    border
    ${error ? 'border-red-300' : 'border-gray-300'}
    rounded-lg
    px-3
    py-2
    ${icon ? 'pl-10' : ''}
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
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`${icon} text-gray-400`}></i>
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...rest}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'date']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string
};

export default FormInput;
