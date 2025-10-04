import React from 'react';
import DashboardLayout from 'components/layout/DashboardLayout';
import { LoadingSpinner } from 'components/UI';
import { useDropzone } from 'react-dropzone';
import useFileManager from './Formatos/hooks/useFileManager';
import FileBreadcrumb from './Formatos/components/FileBreadcrumb';
import FileControls from './Formatos/components/FileControls';
import FolderList from './Formatos/components/FolderList';
import FileUploadZone from './Formatos/components/FileUploadZone';
import FileDisplay from './Formatos/components/FileDisplay';

const Formatos = () => {
  const {
    currentPath,
    files,
    folders,
    loading,
    error,
    uploading,
    isAdmin,
    notifications,
    searchTerm,
    debouncedSearchTerm,
    selectedFileType,
    viewMode,
    sortBy,
    sortOrder,
    newFolderName,
    renamingFolder,
    filteredAndSortedFiles,
    setSearchTerm,
    setSelectedFileType,
    setViewMode,
    setSortBy,
    setSortOrder,
    setNewFolderName,
    navigateToFolder,
    handleBreadcrumbClick,
    handleCreateFolder,
    handleRenameFolder,
    startRename,
    cancelRename,
    updateRenameName,
    handleDeleteFolder,
    handleDeleteFile,
    handleDownload,
    onDrop,
  } = useFileManager();


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { '*/*': [] }, // All types
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
    disabled: !isAdmin || uploading,
  });

  if (loading) {
    return (
      <DashboardLayout
        title="Formatos"
        subtitle="Cargando archivos..."
        loading={true}
        loadingText="Cargando formatos y carpetas..."
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Formatos"
        subtitle="Error al cargar datos"
        loading={false}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading formats: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin && loading === false) {
    return (
      <DashboardLayout
        title="Formatos"
        subtitle="Acceso Restringido"
        loading={false}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <i className="fas fa-lock text-yellow-500 text-3xl mb-4"></i>
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Acceso Restringido</h3>
            <p className="text-yellow-700">Solo administradores pueden gestionar archivos.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Formatos"
      subtitle="Gestión de Archivos y Carpetas"
    >
      
      {/* Enhanced Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map(({ id, message, type }) => {
          const getIcon = () => {
            switch (type) {
              case 'success': return 'fas fa-check-circle';
              case 'error': return 'fas fa-exclamation-circle';
              case 'warning': return 'fas fa-exclamation-triangle';
              case 'info': default: return 'fas fa-info-circle';
            }
          };

          const getColors = () => {
            switch (type) {
              case 'success': return 'bg-gradient-to-r from-green-500 to-green-600 border-green-400';
              case 'error': return 'bg-gradient-to-r from-red-500 to-red-600 border-red-400';
              case 'warning': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400';
              case 'info': default: return 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400';
            }
          };

          return (
            <div
              key={id}
              className={`flex items-center p-4 rounded-lg shadow-xl border-l-4 text-white transform transition-all duration-300 ease-out animate-slideInRight ${getColors()}`}
              style={{
                animation: 'slideInRight 0.5s ease-out forwards',
              }}
            >
              <i className={`${getIcon()} mr-3 text-lg flex-shrink-0`}></i>
              <span className="flex-1 text-sm font-medium">{message}</span>
              <button
                onClick={() => {
                  // Remove notification - this would need to be implemented in useFileManager
                  // For now, we'll just hide it
                  const element = document.getElementById(`toast-${id}`);
                  if (element) {
                    element.style.animation = 'slideOutRight 0.3s ease-in forwards';
                    setTimeout(() => {
                      // This should call a removeNotification function from the hook
                    }, 300);
                  }
                }}
                className="ml-3 p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors duration-200 flex-shrink-0"
                id={`toast-${id}`}
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
      `}</style>

      <div className="px-6 py-6">
        <FileBreadcrumb
          currentPath={currentPath}
          onBreadcrumbClick={handleBreadcrumbClick}
        />

        <FileControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFileType={selectedFileType}
          setSelectedFileType={setSelectedFileType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredAndSortedFiles={filteredAndSortedFiles}
          files={files}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FolderList
            folders={folders}
            isAdmin={isAdmin}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            onCreateFolder={handleCreateFolder}
            renamingFolder={renamingFolder}
            onUpdateRenameName={updateRenameName}
            onStartRename={startRename}
            onCancelRename={cancelRename}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onNavigateToFolder={navigateToFolder}
          />

          <div className="lg:col-span-2">
            <FileUploadZone
              isAdmin={isAdmin}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              uploading={uploading}
            />

            <FileDisplay
              loading={loading}
              filteredAndSortedFiles={filteredAndSortedFiles}
              files={files}
              viewMode={viewMode}
              searchTerm={debouncedSearchTerm}
              onDownload={handleDownload}
              onDeleteFile={handleDeleteFile}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Formatos;