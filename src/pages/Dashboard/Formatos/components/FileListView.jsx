import React from 'react';
import { getFileType, formatFileSize, formatDate } from '../../../../utils/fileUtils';

const FileListView = ({ filteredAndSortedFiles, onDownload, onDeleteFile, isAdmin }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredAndSortedFiles.map((file) => {
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
                        {file.nombre.split('.').pop()?.toUpperCase()} • {fileType.category}
                      </div>
                    </div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {file.tamaño ? formatFileSize(file.tamaño) : 'Desconocido'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {file.createdAt ? formatDate(file.createdAt) : 'Desconocido'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {file.createdAt ? new Date(file.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </div>
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
                        onClick={() => onDeleteFile(file.nombre)}
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
  );
};

export default FileListView;