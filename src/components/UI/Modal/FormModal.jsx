import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Button from '../Button/Button';

/**
 * FormModal component - Modal specialized for forms with submit/cancel actions
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Object} props.initialData - Initial form data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {React.ReactNode} props.children - Form fields
 * @param {string} props.submitLabel - Submit button label
 * @param {string} props.cancelLabel - Cancel button label
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Modal size
 * @param {string} props.className - Additional CSS classes
 */
const FormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  initialData,
  loading = false,
  error,
  children,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  size = 'lg',
  className = ''
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    try {
      await onSubmit(e);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        icon={loading ? undefined : 'fas fa-save'}
        form="modal-form"
      >
        {loading ? 'Guardando...' : submitLabel}
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
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      className={className}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <form id="modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

FormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
};

export default FormModal;
