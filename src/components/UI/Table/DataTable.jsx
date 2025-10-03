import React from 'react';
import PropTypes from 'prop-types';
import EmptyState from '../State/EmptyState';
import Skeleton from '../State/Skeleton';

/**
 * DataTable component - Configurable data table with loading and empty states
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Column configuration
 * @param {Function} props.keyExtractor - Function to extract unique key from row
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.emptyState - Custom empty state component
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.rowClassName - Function to get row className
 * @param {boolean} props.stickyHeader - Sticky table header
 * @param {string} props.className - Additional CSS classes
 */
const DataTable = ({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyState,
  onRowClick,
  rowClassName,
  stickyHeader = false,
  className = ''
}) => {
  const getAlignment = (align) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const renderCell = (column, row) => {
    if (column.render) {
      return column.render(row);
    }
    return row[column.key];
  };

  const getRowClasses = (row) => {
    const baseClasses = 'hover:bg-gray-50 transition-colors';
    const clickableClasses = onRowClick ? 'cursor-pointer' : '';
    const customClasses = rowClassName ? rowClassName(row) : '';
    
    return `${baseClasses} ${clickableClasses} ${customClasses}`.trim();
  };

  const tableClasses = `
    w-full
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const headerClasses = `
    bg-gray-50
    ${stickyHeader ? 'sticky top-0 z-10' : ''}
  `.trim();

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className={tableClasses}>
            <thead className={headerClasses}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <Skeleton variant="text" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        {emptyState || (
          <EmptyState
            icon="fas fa-inbox"
            title="No hay datos"
            message="No se encontraron resultados"
          />
        )}
      </div>
    );
  }

  // Data table
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          <thead className={headerClasses}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`
                    px-6
                    py-3
                    text-xs
                    font-medium
                    text-gray-500
                    uppercase
                    tracking-wider
                    ${getAlignment(column.align)}
                  `}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={getRowClasses(row)}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      px-6
                      py-4
                      whitespace-nowrap
                      text-sm
                      ${getAlignment(column.align)}
                    `}
                  >
                    {renderCell(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      align: PropTypes.oneOf(['left', 'center', 'right'])
    })
  ).isRequired,
  keyExtractor: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  emptyState: PropTypes.node,
  onRowClick: PropTypes.func,
  rowClassName: PropTypes.func,
  stickyHeader: PropTypes.bool,
  className: PropTypes.string
};

export default DataTable;
