import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Button from '../Button/Button';

/**
 * ViewModal component - Modal for displaying details in a two-column layout
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {Array} props.data - Array of {label, value, fullWidth} objects
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Modal size
 * @param {string} props.className - Additional CSS classes
 */
const ViewModal = ({
  isOpen,
  onClose,
  title,
  data,
  actions,
  size = 'lg',
  className = ''
}) => {
  const footer = (
    <>
      {actions}
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
      >
        Cerrar
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item, index) => (
          <div
            key={index}
            className={`space-y-2 ${item.fullWidth ? 'md:col-span-2' : ''}`}
          >
            <label className="block text-sm font-medium text-gray-600">
              {item.label}
            </label>
            <div className="text-base text-gray-900">
              {typeof item.value === 'string' || typeof item.value === 'number' ? (
                <p className="font-semibold">{item.value}</p>
              ) : (
                item.value
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

ViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node
      ]).isRequired,
      fullWidth: PropTypes.bool
    })
  ).isRequired,
  actions: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
};

export default ViewModal;
