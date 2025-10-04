import React from 'react';
import { LoadingSpinner } from 'components/UI';

const FileUploadZone = ({
  isAdmin,
  getRootProps,
  getInputProps,
  isDragActive,
  uploading,
  uploadStates = []
}) => {
  return (
    <>
      {isAdmin && (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all duration-300 ease-in-out transform ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <LoadingSpinner size="md" text="Subiendo archivos..." />
            ) : (
              <>
                <i className={`fas fa-cloud-upload-alt text-4xl transition-colors duration-300 ${
                  isDragActive ? 'text-blue-500 animate-bounce' : 'text-gray-400'
                } mb-4`}></i>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Suelta los archivos aquí...' : 'Arrastra archivos aquí o haz clic para seleccionar'}
                </p>
                <p className="text-sm text-gray-500 mb-4">Soporta todos los tipos de archivos (máx. 100MB cada uno)</p>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Seleccionar Archivos
                </button>
              </>
            )}
          </div>

          {/* Mostrar estados de carga de archivos individuales */}
          {uploadStates.length > 0 && (
            <div className="mb-6 space-y-3">
              {uploadStates.map((uploadState, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {uploadState.file.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      {uploadState.status === 'success' && (
                        <i className="fas fa-check-circle text-green-500 text-lg"></i>
                      )}
                      {uploadState.status === 'error' && (
                        <i className="fas fa-exclamation-circle text-red-500 text-lg"></i>
                      )}
                      {uploadState.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ease-out ${
                        uploadState.status === 'success'
                          ? 'bg-green-500'
                          : uploadState.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${uploadState.progress || 0}%` }}
                    ></div>
                  </div>

                  {/* Mensajes de estado */}
                  <div className="text-xs text-gray-600">
                    {uploadState.status === 'uploading' && (
                      <span>{uploadState.progress || 0}% completado</span>
                    )}
                    {uploadState.status === 'success' && (
                      <span className="text-green-600">Archivo subido exitosamente</span>
                    )}
                    {uploadState.status === 'error' && uploadState.error && (
                      <span className="text-red-600">{uploadState.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6 text-center transition-all duration-300">
          <i className="fas fa-lock text-yellow-500 text-3xl mb-4 animate-pulse"></i>
          <h3 className="text-lg font-bold text-yellow-800 mb-2">Acceso Restringido</h3>
          <p className="text-yellow-700">Solo administradores pueden subir y eliminar archivos.</p>
        </div>
      )}
    </>
  );
};

export default FileUploadZone;