import React from 'react';
import { Link } from 'react-router-dom';

const FileBreadcrumb = ({ currentPath, onBreadcrumbClick }) => {
  return (
    <div className="mb-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span>/</span>
        <span className="flex items-center space-x-1">
          {currentPath.split('/').map((part, i) => {
            const pathPrefix = currentPath.split('/').slice(0, i + 1).join('/');
            return (
              <span key={i} className="flex items-center">
                <button
                  onClick={() => onBreadcrumbClick(pathPrefix)}
                  className="hover:text-blue-600 font-medium"
                >
                  {part}
                </button>
                {i < currentPath.split('/').length - 1 && <span>/</span>}
              </span>
            );
          })}
          {!currentPath && <span className="font-medium">Raíz</span>}
        </span>
      </nav>
    </div>
  );
};

export default FileBreadcrumb;