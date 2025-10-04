import React from 'react';
import { Skeleton } from 'components/UI';
import FileGridView from './FileGridView';
import FileListView from './FileListView';

const FileDisplay = ({ loading, filteredAndSortedFiles, files, viewMode, searchTerm, onDownload, onDeleteFile, isAdmin }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          Archivos ({filteredAndSortedFiles.length}{files.length !== filteredAndSortedFiles.length ? ` de ${files.length}` : ''})
        </h3>
      </div>

      {loading ? (
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="aspect-square bg-white flex items-center justify-center">
                    <Skeleton variant="circle" width="3rem" height="3rem" />
                  </div>
                  <div className="p-3 space-y-2">
                    <Skeleton variant="text" width="80%" />
                    <div className="flex justify-between items-center">
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="rectangle" width="20%" height="1.5rem" />
                    </div>
                    <Skeleton variant="text" width="60%" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                  {Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton variant="circle" width="2rem" height="2rem" className="mr-3" />
                          <div className="space-y-1">
                            <Skeleton variant="text" width="120px" />
                            <Skeleton variant="text" width="80px" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton variant="rectangle" width="60px" height="1.5rem" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton variant="text" width="50px" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Skeleton variant="text" width="70px" />
                          <Skeleton variant="text" width="50px" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Skeleton variant="circle" width="2rem" height="2rem" />
                          <Skeleton variant="circle" width="2rem" height="2rem" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          searchTerm={searchTerm}
          onDownload={onDownload}
          onDeleteFile={onDeleteFile}
          isAdmin={isAdmin}
        />
      ) : (
        <FileListView
          filteredAndSortedFiles={filteredAndSortedFiles}
          searchTerm={searchTerm}
          onDownload={onDownload}
          onDeleteFile={onDeleteFile}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default FileDisplay;