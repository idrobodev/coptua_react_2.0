import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * SearchInput component with debounce functionality
 *
 * @param {Object} props
 * @param {string} props.value - Search value
 * @param {Function} props.onChange - Change handler (called after debounce)
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceMs - Debounce delay in milliseconds
 * @param {string} props.icon - FontAwesome icon class
 * @param {string} props.label - Label text
 * @param {string} props.className - Additional CSS classes
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 300,
  icon = 'fas fa-search',
  label,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  const inputClasses = `
    w-full
    border
    border-gray-300
    rounded-md
    pl-10
    pr-10
    py-2
    focus:ring-2
    focus:ring-blue-500
    focus:border-transparent
    transition-colors
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className={`${icon} text-gray-400`}></i>
        </div>

        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClasses}
        />

        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  icon: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string
};

export default SearchInput;
