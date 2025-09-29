import React from 'react';
import { getFileType, formatFileSize, formatDate } from 'utils/fileUtils';

const FileGrid = ({ files, onDownload, onDelete, isAdmin, onPreview }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-500 mb-2">No hay archivos</h3>
        <p className="text-gray-400">Esta carpeta está vacía</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {files.map((file) => {
        const fileType = getFileType(file.nombre);
        const isImage = fileType.category === 'image';

        return (
          <div
            key={file.id}
            className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            {/* File Preview/Icon */}
            <div className="aspect-square flex items-center justify-center bg-gray-50 relative">
              {isImage ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <i className={`${fileType.icon} ${fileType.color} text-4xl`}></i>
                  {/* TODO: Add actual image preview when storage service supports it */}
                </div>
              ) : (
                <i className={`${fileType.icon} ${fileType.color} text-4xl`}></i>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  {isImage && (
                    <button
                      onClick={() => onPreview(file)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                      title="Vista previa"
                    >
                      <i className="fas fa-eye text-gray-600"></i>
                    </button>
                  )}
                  <button
                    onClick={() => onDownload(file.nombre)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    title="Descargar"
                  >
                    <i className="fas fa-download text-blue-600"></i>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(file.nombre)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                      title="Eliminar"
                    >
                      <i className="fas fa-trash text-red-600"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="p-3">
              <h4
                className="font-medium text-sm text-gray-900 truncate mb-1"
                title={file.nombre}
              >
                {file.nombre}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatFileSize(file.tamaño)}</span>
                <span>{formatDate(file.createdAt)}</span>
              </div>
            </div>

            {/* File type badge */}
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white shadow-sm ${fileType.color}`}>
                {file.nombre.split('.').pop()?.toUpperCase()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileGrid;
