import React from 'react';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner';

const FileUploadZone = ({ isAdmin, getRootProps, getInputProps, isDragActive, uploading }) => {
  return (
    <>
      {isAdmin && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-colors ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <LoadingSpinner size="md" text="Subiendo..." />
          ) : (
            <>
              <i className={`fas fa-cloud-upload-alt text-4xl ${isDragActive ? 'text-blue-500' : 'text-gray-400'} mb-4`}></i>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Suelta los archivos aquí...' : 'Arrastra archivos aquí o haz clic para seleccionar'}
              </p>
              <p className="text-sm text-gray-500 mb-4">Soporta todos los tipos de archivos (máx. 100MB cada uno)</p>
              <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Seleccionar Archivos
              </button>
            </>
          )}
        </div>
      )}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6 text-center">
          <i className="fas fa-lock text-yellow-500 text-3xl mb-4"></i>
          <h3 className="text-lg font-bold text-yellow-800 mb-2">Acceso Restringido</h3>
          <p className="text-yellow-700">Solo administradores pueden subir y eliminar archivos.</p>
        </div>
      )}
    </>
  );
};

export default FileUploadZone;