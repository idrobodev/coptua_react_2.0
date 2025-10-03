import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormModal from '../../ui/Modal/FormModal';

/**
 * CreateFormModal component - Composite modal for creating new entities
 * Combines FormModal with common create patterns including form state management
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {Object} props.defaultValues - Default form values
 * @param {Function} props.onSubmit - Submit handler (receives form data)
 * @param {React.ReactNode} props.children - Form fields (receives formData and handleChange)
 * @param {string} props.submitLabel - Submit button label
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Modal size
 * @param {Function} props.validate - Optional validation function
 * @param {boolean} props.resetOnSuccess - Reset form after successful submission
 * @param {string} props.className - Additional CSS classes
 */
const CreateFormModal = ({
  isOpen,
  onClose,
  title,
  defaultValues = {},
  onSubmit,
  children,
  submitLabel = 'Crear',
  size = 'lg',
  validate,
  resetOnSuccess = true,
  className = ''
}) => {
  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(defaultValues);
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, defaultValues]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Run validation if provided
    if (validate) {
      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      
      if (resetOnSuccess) {
        setFormData(defaultValues);
        setErrors({});
      }
      
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Error al crear el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(defaultValues);
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      onSubmit={handleSubmit}
      loading={loading}
      error={submitError}
      submitLabel={submitLabel}
      size={size}
      className={className}
    >
      {typeof children === 'function' 
        ? children({ formData, handleChange, errors })
        : React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, { formData, handleChange, errors })
              : child
          )
      }
    </FormModal>
  );
};

CreateFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  defaultValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node
  ]).isRequired,
  submitLabel: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  validate: PropTypes.func,
  resetOnSuccess: PropTypes.bool,
  className: PropTypes.string
};

export default CreateFormModal;
