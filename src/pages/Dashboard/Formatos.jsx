import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useDropzone } from 'react-dropzone';
import { storage } from '../../services/storage';
import { dbService, ROLES } from '../../services/database';
import { Link } from 'react-router-dom';
import { getFileType, formatFileSize, formatDate } from '../../utils/fileUtils';

const Formatos = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState(null); // {folderName, newName}

  // New state for enhanced functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('createdAt'); // 'name', 'size', 'createdAt', 'type'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const navigateToPath = (targetPath) => {
    loadFiles(targetPath);
  };

  // Simple notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

  // Check admin permission on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const admin = await dbService.hasPermission(ROLES.ADMINISTRADOR);
        setIsAdmin(admin);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  // Load files and folders
  const loadFiles = useCallback(async (path = '') => {
    setLoading(true);
    try {
      console.log('🔄 Cargando archivos para path:', path);
      const result = await storage.listFiles(path);
      console.log('📊 Resultado listFiles:', result);
      
      const { files: loadedFiles, folders: loadedFolders } = result;
      setFiles(loadedFiles || []);
      setFolders(loadedFolders || []);
      setCurrentPath(path);
      
      console.log('✅ Archivos cargados:', {
        files: loadedFiles?.length || 0,
        folders: loadedFolders?.length || 0,
        path: path
      });
    } catch (error) {
      console.error('❌ Error loading files:', error);
      addNotification(`Error loading files: ${error.message}`, 'error');
      setFiles([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Navigate to folder
  const navigateToFolder = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    loadFiles(newPath);
  };


  // Navigate to specific path prefix for breadcrumb
  const handleBreadcrumbClick = (pathPrefix) => {
    navigateToPath(pathPrefix);
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!isAdmin || !newFolderName.trim()) return;
    try {
      await storage.createFolder(newFolderName.trim(), currentPath);
      addNotification('Folder created successfully', 'success');
      setNewFolderName('');
      loadFiles(currentPath);
    } catch (error) {
      addNotification(`Error creating folder: ${error.message}`, 'error');
    }
  };

  // Handle rename for specific folder
  const handleRenameFolder = async (oldName) => {
    if (!isAdmin || !renamingFolder || !renamingFolder.newName.trim()) return;
    try {
      await storage.renameFolder(oldName, renamingFolder.newName.trim(), currentPath);
      addNotification('Folder renamed successfully', 'success');
      setRenamingFolder(null);
      loadFiles(currentPath);
    } catch (error) {
      addNotification(`Error renaming folder: ${error.message}`, 'error');
      setRenamingFolder(null);
    }
  };

  const startRename = (folder) => {
    setRenamingFolder({ folderName: folder, newName: folder });
  };

  const cancelRename = () => {
    setRenamingFolder(null);
  };

  const updateRenameName = (newName) => {
    setRenamingFolder(prev => ({ ...prev, newName }));
  };

  // Delete folder
  const handleDeleteFolder = async (folderName) => {
    if (!isAdmin || !window.confirm(`Delete folder '${folderName}' and all contents?`)) return;
    try {
      await storage.deleteFolder(currentPath ? `${currentPath}/${folderName}` : folderName);
      addNotification('Folder deleted successfully', 'success');
      loadFiles(currentPath);
    } catch (error) {
      addNotification(`Error deleting folder: ${error.message}`, 'error');
    }
  };

  // Delete file
  const handleDeleteFile = async (fileName) => {
    if (!isAdmin || !window.confirm(`Delete file '${fileName}'?`)) return;
    try {
      const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
      await storage.deleteFile(fullPath);
      addNotification('File deleted successfully', 'success');
      loadFiles(currentPath);
    } catch (error) {
      addNotification(`Error deleting file: ${error.message}`, 'error');
    }
  };

  // Download file
  const handleDownload = async (fileName) => {
    try {
      const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
      const url = await storage.getDownloadUrl(fullPath);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (error) {
      addNotification(`Error downloading file: ${error.message}`, 'error');
    }
  };

  // Upload files
  const onDrop = async (acceptedFiles) => {
    if (!isAdmin) {
      addNotification('Permission denied: Admin access required for uploads', 'error');
      return;
    }

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        await storage.upload(file, currentPath);
      }
      addNotification(`${acceptedFiles.length} files uploaded successfully`, 'success');
      loadFiles(currentPath);
    } catch (error) {
      addNotification(`Upload error: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Filtered and sorted files
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files.filter(file => {
      const matchesSearch = file.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const fileType = getFileType(file.nombre);
      const matchesType = selectedFileType === 'all' || fileType.category === selectedFileType;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
          break;
        case 'size':
          aValue = a.tamaño || 0;
          bValue = b.tamaño || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'type':
          aValue = getFileType(a.nombre).category;
          bValue = getFileType(b.nombre).category;
          break;
        default:
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }, [files, searchTerm, selectedFileType, sortBy, sortOrder]);

  // File type options for filter
  const fileTypeOptions = [
    { value: 'all', label: 'Todos los tipos', icon: 'fas fa-file' },
    { value: 'document', label: 'Documentos', icon: 'fas fa-file-alt' },
    { value: 'image', label: 'Imágenes', icon: 'fas fa-image' },
    { value: 'video', label: 'Videos', icon: 'fas fa-video' },
    { value: 'audio', label: 'Audio', icon: 'fas fa-music' },
    { value: 'archive', label: 'Archivos', icon: 'fas fa-archive' },
    { value: 'code', label: 'Código', icon: 'fas fa-code' },
  ];

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
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <span className="flex items-center space-x-1">
              {currentPath.split('/').map((part, i) => {
                const pathPrefix = currentPath.split('/').slice(0, i + 1).join('/');
                return (
                  <span key={i} className="flex items-center">
                    <button
                      onClick={() => handleBreadcrumbClick(pathPrefix)}
                      className="hover:text-blue-600 font-medium"
                    >
                      {part}
                    </button>
                    {i < currentPath.split('/').length - 1 && <span>/</span>}
                  </span>
                );
              })}
              {!currentPath && <span className="font-medium">Raíz</span>}
            </span>
          </nav>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar archivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* File Type Filter */}
              <div className="relative">
                <select
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fileTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Fecha</option>
                  <option value="name">Nombre</option>
                  <option value="size">Tamaño</option>
                  <option value="type">Tipo</option>
                </select>
                <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
              >
                <i className={`fas fa-sort-amount-${sortOrder === 'asc' ? 'up' : 'down'} text-gray-600`}></i>
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  title="Vista de lista"
                >
                  <i className="fas fa-list"></i>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  title="Vista de cuadrícula"
                >
                  <i className="fas fa-th"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredAndSortedFiles.length} archivo{filteredAndSortedFiles.length !== 1 ? 's' : ''} encontrado{filteredAndSortedFiles.length !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
            {selectedFileType !== 'all' && ` de tipo ${fileTypeOptions.find(opt => opt.value === selectedFileType)?.label.toLowerCase()}`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Folders Section */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Carpetas</h3>
            
            {/* Create Folder */}
            {isAdmin && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nombre de nueva carpeta"
                  className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                />
                <button
                  onClick={handleCreateFolder}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Crear Carpeta
                </button>
              </div>
            )}

            {/* Folders List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {folders.map((folder) => (
                <div key={folder} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => navigateToFolder(folder)}
                    className="flex-1 text-left hover:bg-gray-100 p-2 rounded"
                  >
                    <i className="fas fa-folder mr-2 text-yellow-500"></i>
                    {renamingFolder?.folderName === folder ? (
                      <input
                        type="text"
                        value={renamingFolder.newName}
                        onChange={(e) => updateRenameName(e.target.value)}
                        onBlur={() => {
                          if (renamingFolder.newName.trim()) {
                            handleRenameFolder(folder);
                          } else {
                            cancelRename();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameFolder(folder);
                          } else if (e.key === 'Escape') {
                            cancelRename();
                          }
                        }}
                        autoFocus
                        className="bg-transparent border-b border-blue-500 px-1"
                      />
                    ) : (
                      folder
                    )}
                  </button>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      {renamingFolder?.folderName === folder ? (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleRenameFolder(folder)}
                            className="text-green-600 hover:text-green-800"
                            title="Guardar"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            onClick={cancelRename}
                            className="text-gray-600 hover:text-gray-800"
                            title="Cancelar"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => startRename(folder)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Renombrar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteFolder(folder)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {folders.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay carpetas</p>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="lg:col-span-2">
            {/* Upload Zone */}
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

            {/* Files Display */}
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
                      ? (currentPath ? 'Esta carpeta está vacía' : 'El directorio raíz está vacío')
                      : 'Intenta ajustar los filtros de búsqueda'
                    }
                  </p>
                  {isAdmin && files.length === 0 && (
                    <p className="text-sm text-gray-400">
                      {currentPath ? 'Sube archivos o crea carpetas para organizar.' : 'Comienza creando carpetas o subiendo archivos.'}
                    </p>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAndSortedFiles.map((file) => {
                      const fileType = getFileType(file.nombre);
                      const isImage = fileType.category === 'image';

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
                                  onClick={() => handleDownload(file.nombre)}
                                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                                  title="Descargar"
                                >
                                  <i className="fas fa-download text-blue-600"></i>
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteFile(file.nombre)}
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
                              {formatDate(file.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* List View */
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
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleDownload(file.nombre)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                  title="Descargar"
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteFile(file.nombre)}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Formatos;