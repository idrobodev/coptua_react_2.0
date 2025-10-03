import React from 'react';
import PropTypes from 'prop-types';
import StatCard from './StatCard';

/**
 * StatsGrid component for displaying multiple StatCards in a responsive grid
 * 
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects with StatCard props
 * @param {2|3|4|5} props.columns - Number of columns on desktop
 * @param {'sm'|'md'|'lg'} props.gap - Gap between cards
 * @param {string} props.className - Additional CSS classes
 */
const StatsGrid = ({
  stats,
  columns = 4,
  gap = 'md',
  className = ''
}) => {
  // Gap styles
  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  // Column styles for desktop
  const columnStyles = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5'
  };

  const gridClasses = `
    grid
    grid-cols-1
    md:grid-cols-2
    ${columnStyles[columns]}
    ${gapStyles[gap]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={gridClasses}>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.key || index}
          {...stat}
        />
      ))}
    </div>
  );
};

StatsGrid.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.oneOf(['blue', 'green', 'red', 'purple', 'orange', 'gray']),
      subtitle: PropTypes.string,
      trend: PropTypes.shape({
        value: PropTypes.number.isRequired,
        isPositive: PropTypes.bool.isRequired
      }),
      onClick: PropTypes.func,
      loading: PropTypes.bool,
      key: PropTypes.string
    })
  ).isRequired,
  columns: PropTypes.oneOf([2, 3, 4, 5]),
  gap: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default StatsGrid;
