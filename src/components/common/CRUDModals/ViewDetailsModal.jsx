import React from 'react';
import PropTypes from 'prop-types';
import ViewModal from '../../UI/Modal/ViewModal';

/**
 * ViewDetailsModal component - Composite modal for viewing entity details
 * Combines ViewModal with common layout patterns for CRUD operations
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {Array} props.data - Array of {label, value, fullWidth} objects
 * @param {React.ReactNode} props.actions - Optional action buttons (edit, delete, etc.)
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Modal size
 * @param {string} props.className - Additional CSS classes
 */
const ViewDetailsModal = ({
  isOpen,
  onClose,
  title,
  data,
  actions,
  size = 'lg',
  className = ''
}) => {
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      data={data}
      actions={actions}
      size={size}
      className={className}
    />
  );
};

ViewDetailsModal.propTypes = {
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

export default ViewDetailsModal;
