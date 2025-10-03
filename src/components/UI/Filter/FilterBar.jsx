import React from 'react';
import PropTypes from 'prop-types';
import FilterSelect from './FilterSelect';
import SearchInput from './SearchInput';
import Button from '../Button/Button';

/**
 * FilterBar component - Responsive filter bar with multiple filter types
 * 
 * @param {Object} props
 * @param {Array} props.filters - Array of filter configurations
 * @param {Object} props.values - Current filter values
 * @param {Function} props.onChange - Change handler (name, value)
 * @param {Function} props.onClear - Clear all filters handler
 * @param {boolean} props.showClearButton - Show clear button
 * @param {string} props.className - Additional CSS classes
 */
const FilterBar = ({
  filters,
  values,
  onChange,
  onClear,
  showClearButton = true,
  className = ''
}) => {
  const hasActiveFilters = Object.values(values).some(value => 
    value !== '' && value !== 'all' && value !== 'Todos' && value !== 'Todas'
  );

  const renderFilter = (filter) => {
    const value = values[filter.name] || '';

    switch (filter.type) {
      case 'select':
        return (
          <FilterSelect
            key={filter.name}
            label={filter.label}
            value={value}
            onChange={(newValue) => onChange(filter.name, newValue)}
            options={filter.options || []}
            placeholder={filter.placeholder}
          />
        );

      case 'search':
        return (
          <SearchInput
            key={filter.name}
            value={value}
            onChange={(newValue) => onChange(filter.name, newValue)}
            placeholder={filter.placeholder || 'Buscar...'}
            debounceMs={filter.debounceMs}
          />
        );

      case 'date':
        return (
          <div key={filter.name} className="w-full">
            {filter.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
            )}
            <input
              type="date"
              value={value}
              onChange={(e) => onChange(filter.name, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'custom':
        return filter.component ? (
          <div key={filter.name}>
            {React.createElement(filter.component, {
              value,
              onChange: (newValue) => onChange(filter.name, newValue),
              ...filter.props
            })}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const barClasses = `
    bg-white
    shadow-sm
    border-b
    border-gray-200
    px-6
    py-4
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={barClasses}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filters.map(renderFilter)}
        
        {showClearButton && onClear && (
          <div className="flex items-end">
            <Button
              variant="ghost"
              icon="fas fa-times"
              onClick={onClear}
              disabled={!hasActiveFilters}
              fullWidth
            >
              Limpiar
            </Button>
          </div>
        )}
      </div>
      
      {hasActiveFilters && (
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <i className="fas fa-filter mr-2"></i>
          <span>Filtros activos</span>
        </div>
      )}
    </div>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['select', 'search', 'date', 'custom']).isRequired,
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      options: PropTypes.array,
      placeholder: PropTypes.string,
      debounceMs: PropTypes.number,
      component: PropTypes.elementType,
      props: PropTypes.object
    })
  ).isRequired,
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  showClearButton: PropTypes.bool,
  className: PropTypes.string
};

export default FilterBar;
