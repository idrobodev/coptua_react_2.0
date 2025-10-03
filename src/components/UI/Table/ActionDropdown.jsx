import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ActionDropdown component - Dropdown menu for row actions
 * 
 * @param {Object} props
 * @param {Array} props.actions - Array of action objects {label, icon, onClick, variant, disabled}
 * @param {string} props.triggerIcon - Icon for trigger button
 * @param {'left'|'right'} props.position - Dropdown position
 * @param {string} props.className - Additional CSS classes
 */
const ActionDropdown = ({
  actions,
  triggerIcon = 'fas fa-ellipsis-v',
  position = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  const getVariantClasses = (variant) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50';
      default:
        return 'text-gray-700 hover:bg-gray-50';
    }
  };

  return (
    <div ref={dropdownRef} className={`relative dropdown-container ${className}`}>
      <button
        type="button"
        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Opciones"
        aria-expanded={isOpen}
      >
        <i className={triggerIcon}></i>
      </button>

      {isOpen && (
        <div
          className={`
            absolute
            ${positionClasses[position]}
            mt-2
            w-48
            bg-white
            border
            border-gray-200
            rounded-lg
            shadow-lg
            z-10
            animate-fadeIn
            overflow-hidden
          `}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
              disabled={action.disabled}
              className={`
                w-full
                text-left
                px-4
                py-2
                text-sm
                transition-colors
                ${getVariantClasses(action.variant)}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${index !== actions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
            >
              {action.icon && (
                <i className={`${action.icon} mr-2`}></i>
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ActionDropdown.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['default', 'danger']),
      disabled: PropTypes.bool
    })
  ).isRequired,
  triggerIcon: PropTypes.string,
  position: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string
};

export default ActionDropdown;
