import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';

/**
 * Pagination component - Page navigation controls
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change handler
 * @param {number} props.itemsPerPage - Items per page
 * @param {number} props.totalItems - Total number of items
 * @param {boolean} props.showInfo - Show items range info
 * @param {number} props.maxPageButtons - Maximum page buttons to show
 * @param {string} props.className - Additional CSS classes
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  showInfo = true,
  maxPageButtons = 5,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const containerClasses = `
    bg-white
    rounded-2xl
    shadow-lg
    border
    border-gray-100
    p-4
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        {showInfo && (
          <div className="text-sm text-gray-700">
            Mostrando {startIndex} a {endIndex} de {totalItems} resultados
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            icon="fas fa-chevron-left"
          >
            Anterior
          </Button>

          <div className="hidden sm:flex space-x-2">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-1 text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`
                    px-3
                    py-1
                    text-sm
                    font-medium
                    rounded-md
                    transition-colors
                    ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            icon="fas fa-chevron-right"
            iconPosition="right"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  showInfo: PropTypes.bool,
  maxPageButtons: PropTypes.number,
  className: PropTypes.string
};

export default Pagination;
