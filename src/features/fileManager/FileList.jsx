import React from 'react';
import { getFileType, formatFileSize, formatDate } from 'utils/fileUtils';

const FileList = ({ files, onDownload, onDelete, isAdmin, sortBy, sortOrder, onSort }) => {
  const handleSort = (column) => {
    if (sortBy === column) {
      onSort(column, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(column, 'asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <i className="fas fa-sort text-gray-400 ml-1"></i>;
    }
    return (
      <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} text-blue-500 ml-1`}></i>
    );
  };

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="text-center py-12">
          <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-500 mb-2">No hay archivos</h3>
          <p className="text-gray-400">Esta carpeta está vacía</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  Nombre
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('size')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  Tamaño
                  <SortIcon column="size" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  Fecha
                  <SortIcon column="date" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  Tipo
                  <SortIcon column="type" />
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {files.map((file) => {
              const fileType = getFileType(file.nombre);

              return (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <i className={`${fileType.icon} ${fileType.color} mr-3 text-lg`}></i>
                      <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate" title={file.nombre}>
                          {file.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {file.nombre.split('.').pop()?.toUpperCase()} file
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(file.tamaño)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {formatDate(file.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {file.createdAt ? new Date(file.createdAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      fileType.category === 'document' ? 'bg-blue-100 text-blue-800' :
                      fileType.category === 'image' ? 'bg-purple-100 text-purple-800' :
                      fileType.category === 'video' ? 'bg-red-100 text-red-800' :
                      fileType.category === 'audio' ? 'bg-indigo-100 text-indigo-800' :
                      fileType.category === 'archive' ? 'bg-yellow-100 text-yellow-800' :
                      fileType.category === 'code' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fileType.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onDownload(file.nombre)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Descargar"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(file.nombre)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;
