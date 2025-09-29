import React from 'react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';
import FileGridView from './FileGridView';
import FileListView from './FileListView';

const FileDisplay = ({ loading, filteredAndSortedFiles, files, viewMode, onDownload, onDeleteFile, isAdmin }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          Archivos ({filteredAndSortedFiles.length}{files.length !== filteredAndSortedFiles.length ? ` de ${files.length}` : ''})
        </h3>
      </div>

      {loading ? (
        <div className="p-6">
          <LoadingSpinner size="md" />
        </div>
      ) : filteredAndSortedFiles.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <i className="fas fa-folder-open text-6xl mb-4 text-gray-300"></i>
          <h3 className="text-lg font-medium mb-2">
            {files.length === 0 ? 'No hay archivos' : 'No se encontraron archivos'}
          </h3>
          <p className="text-gray-400 mb-4">
            {files.length === 0
              ? 'Esta carpeta está vacía'
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
          {isAdmin && files.length === 0 && (
            <p className="text-sm text-gray-400">
              Sube archivos o crea carpetas para organizar.
            </p>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <FileGridView
          filteredAndSortedFiles={filteredAndSortedFiles}
          onDownload={onDownload}
          onDeleteFile={onDeleteFile}
          isAdmin={isAdmin}
        />
      ) : (
        <FileListView
          filteredAndSortedFiles={filteredAndSortedFiles}
          onDownload={onDownload}
          onDeleteFile={onDeleteFile}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default FileDisplay;