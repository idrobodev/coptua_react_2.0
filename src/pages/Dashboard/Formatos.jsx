import React from 'react';
import DashboardLayout from 'components/layout/DashboardLayout';
import { LoadingSpinner } from 'components/ui';
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
      
      {/* Simple Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`p-4 rounded-lg shadow-lg text-white animate-slide-in-right ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
          >
            {message}
          </div>
        ))}
      </div>

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