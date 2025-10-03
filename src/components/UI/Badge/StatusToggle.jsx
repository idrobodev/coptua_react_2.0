import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge';

/**
 * StatusToggle component for toggling between different status states
 * 
 * @param {Object} props
 * @param {string} props.currentStatus - Current status value
 * @param {Array} props.statuses - Array of status objects with value, label, and variant
 * @param {Function} props.onChange - Callback when status changes
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
const StatusToggle = ({
  currentStatus,
  statuses,
  onChange,
  disabled = false,
  loading = false,
  className = '',
  ...rest
}) => {
  const [isChanging, setIsChanging] = useState(false);

  // Find current status config
  const currentStatusConfig = statuses.find(s => s.value === currentStatus) || statuses[0];

  // Find next status in cycle
  const getNextStatus = () => {
    const currentIndex = statuses.findIndex(s => s.value === currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    return statuses[nextIndex];
  };

  const nextStatus = getNextStatus();

  const handleClick = async () => {
    if (disabled || loading || isChanging) return;

    setIsChanging(true);
    try {
      await onChange(nextStatus.value);
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const isDisabled = disabled || loading || isChanging;

  return (
    <div className={`inline-block ${className}`} title={isDisabled ? '' : `Cambiar a ${nextStatus.label}`}>
      <StatusBadge
        status={isChanging || loading ? 'Cambiando...' : currentStatusConfig.label}
        variant={currentStatusConfig.variant}
        icon={isChanging || loading ? 'fas fa-spinner fa-spin' : undefined}
        onClick={isDisabled ? undefined : handleClick}
        className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        {...rest}
      />
    </div>
  );
};

StatusToggle.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  statuses: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'default']).isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default StatusToggle;
