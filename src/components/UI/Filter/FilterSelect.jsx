import React from 'react';
import PropTypes from 'prop-types';

/**
 * FilterSelect component - Styled select for filtering
 * 
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.className - Additional CSS classes
 */
const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Todos',
  className = ''
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const selectClasses = `
    w-full
    border
    border-gray-300
    rounded-md
    px-3
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
      
      <select
        value={value}
        onChange={handleChange}
        className={selectClasses}
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
    </div>
  );
};

FilterSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default FilterSelect;
