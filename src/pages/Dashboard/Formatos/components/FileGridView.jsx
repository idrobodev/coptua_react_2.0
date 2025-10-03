import React from 'react';
import { getFileType, formatFileSize, formatDate } from 'shared/utils/fileUtils';

const FileGridView = ({ filteredAndSortedFiles, onDownload, onDeleteFile, isAdmin }) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredAndSortedFiles.map((file) => {
          const fileType = getFileType(file.nombre);

          return (
            <div
              key={file.id}
              className="group relative bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* File Preview/Icon */}
              <div className="aspect-square flex items-center justify-center bg-white relative">
                <i className={`${fileType.icon} ${fileType.color} text-3xl`}></i>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onDownload(file.nombre)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                      title="Descargar"
                    >
                      <i className="fas fa-download text-blue-600"></i>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteFile(file.nombre)}
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
                  <span>{file.tamaño ? formatFileSize(file.tamaño) : 'Desconocido'}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    fileType.category === 'document' ? 'bg-blue-100 text-blue-800' :
                    fileType.category === 'image' ? 'bg-purple-100 text-purple-800' :
                    fileType.category === 'video' ? 'bg-red-100 text-red-800' :
                    fileType.category === 'audio' ? 'bg-indigo-100 text-indigo-800' :
                    fileType.category === 'archive' ? 'bg-yellow-100 text-yellow-800' :
                    fileType.category === 'code' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {file.nombre.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {file.createdAt ? formatDate(file.createdAt) : 'Desconocido'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileGridView;