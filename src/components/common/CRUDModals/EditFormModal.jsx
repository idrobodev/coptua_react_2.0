import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormModal from '../../UI/Modal/FormModal';
import FormInput from '../../UI/Form/FormInput';
import FormSelect from '../../UI/Form/FormSelect';
import FormTextarea from '../../UI/Form/FormTextarea';
import FormGroup from '../../UI/Form/FormGroup';

/**
 * EditFormModal component - Composite modal for editing entities
 * Combines FormModal with common edit patterns including form state management
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {Object} props.initialData - Initial form data for editing
 * @param {Function} props.onSubmit - Submit handler (receives form data)
 * @param {React.ReactNode} props.children - Form fields (receives formData and handleChange)
 * @param {Array} props.fields - Field configuration array (alternative to children)
 * @param {string} props.submitLabel - Submit button label
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Modal size
 * @param {Function} props.validate - Optional validation function
 * @param {string} props.className - Additional CSS classes
 */
const EditFormModal = ({
  isOpen,
  onClose,
  title,
  initialData,
  onSubmit,
  children,
  fields,
  submitLabel = 'Guardar Cambios',
  size = 'lg',
  validate,
  className = ''
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
      setSubmitError('');
    }
  }, [initialData, isOpen]);

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
      if (typeof onClose === 'function') {
        onClose();
      } else {
        console.error('onClose is not a function in EditFormModal');
      }
      // Reset form after successful submission
      setFormData(initialData || {});
      setErrors({});
    } catch (error) {
      setSubmitError(error.message || 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(initialData || {});
      setErrors({});
      setSubmitError('');
      if (typeof onClose === 'function') {
        onClose();
      } else {
        console.error('onClose is not a function in EditFormModal');
      }
    }
  };

  // Function to render form fields from configuration
  const renderFields = () => {
    if (!fields || !Array.isArray(fields)) return null;

    return (
      <FormGroup columns={2}>
        {fields.map((field, index) => {
          const fieldProps = {
            key: field.name || index,
            name: field.name,
            label: field.label,
            value: formData[field.name] || '',
            onChange: (value) => handleChange(field.name, value),
            error: errors[field.name],
            required: field.required,
            placeholder: field.placeholder,
            disabled: field.disabled,
            ...field
          };

          switch (field.type) {
            case 'select':
              return (
                <FormSelect
                  {...fieldProps}
                  options={field.options || []}
                />
              );
            case 'textarea':
              return (
                <FormTextarea
                  {...fieldProps}
                />
              );
            case 'text':
            case 'email':
            case 'password':
            case 'number':
            case 'tel':
            case 'date':
            default:
              return (
                <FormInput
                  {...fieldProps}
                  type={field.type || 'text'}
                />
              );
          }
        })}
      </FormGroup>
    );
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
      {fields ? renderFields() : (
        typeof children === 'function'
          ? children({ formData, handleChange, errors })
          : React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child, { formData, handleChange, errors })
                : child
            )
      )}
    </FormModal>
  );
};

EditFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  initialData: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node
  ]),
  fields: PropTypes.array,
  submitLabel: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  validate: PropTypes.func,
  className: PropTypes.string
};

export default EditFormModal;
