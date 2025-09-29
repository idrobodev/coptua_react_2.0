import { useState, useCallback, useMemo, useEffect } from 'react';
import { storage } from '../../../../services/storage';
import { dbService, ROLES } from '../../../../services/database';
import { getFileType } from '../../../../utils/fileUtils';

const useFileManager = () => {
  // Basic state
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Additional state for enhanced functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('createdAt'); // 'name', 'size', 'createdAt', 'type'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState(null); // {folderName, newName}

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

  // Simple notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

  // Load files and folders
  const loadFiles = useCallback(async (path = '') => {
    setLoading(true);
    try {
      const result = await storage.listFiles(path);

      const { files: loadedFiles, folders: loadedFolders } = result;
      setFiles(loadedFiles || []);
      setFolders(loadedFolders || []);
      setCurrentPath(path);
    } catch (error) {
      addNotification(`Error loading files: ${error.message}`, 'error');
      setFiles([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Check admin permission on mount
  const checkAdmin = useCallback(async () => {
    try {
      const admin = await dbService.hasPermission(ROLES.ADMINISTRADOR);
      setIsAdmin(admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load files on mount
  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  useEffect(() => {
    const savedPath = localStorage.getItem('lastFileManagerPath') || '';
    loadFiles(savedPath);
  }, [loadFiles]);

  // Save current path to cache
  useEffect(() => {
    localStorage.setItem('lastFileManagerPath', currentPath);
  }, [currentPath]);

  // Navigation functions
  const navigateToPath = (targetPath) => {
    loadFiles(targetPath);
  };

  const navigateToFolder = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    loadFiles(newPath);
  };

  const handleBreadcrumbClick = (pathPrefix) => {
    navigateToPath(pathPrefix);
  };

  // Folder CRUD functions
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

  // File CRUD functions
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

  return {
    // State
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
    fileTypeOptions,
    filteredAndSortedFiles,

    // Setters
    setSearchTerm,
    setSelectedFileType,
    setViewMode,
    setSortBy,
    setSortOrder,
    setNewFolderName,
    setRenamingFolder,
    setUploading,
    setError,

    // Functions
    loadFiles,
    addNotification,
    checkAdmin,
    navigateToPath,
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
  };
};

export default useFileManager;