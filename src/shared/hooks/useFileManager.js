import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { dbService, ROLES } from '../services/database';

// Hook personalizado para manejo de archivos
export const useFileManager = () => {
  const [state, setState] = useState({
    currentPath: '',
    files: [],
    folders: [],
    loading: true,
    error: null,
    uploading: false,
    isAdmin: false
  });

  const [ui, setUI] = useState({
    viewMode: 'list', // 'list' | 'grid'
    sortBy: 'name', // 'name' | 'size' | 'date'
    sortOrder: 'asc', // 'asc' | 'desc'
    searchTerm: '',
    selectedFiles: [],
    showPreview: false,
    previewFile: null
  });

  const [notifications, setNotifications] = useState([]);
  const [folderOperations, setFolderOperations] = useState({
    newFolderName: '',
    renamingFolder: null
  });

  // Notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

  // Check admin permissions
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const admin = await dbService.hasPermission(ROLES.ADMINISTRADOR);
        setState(prev => ({ ...prev, isAdmin: admin, loading: false }));
      } catch (err) {
        setState(prev => ({ ...prev, error: err.message, loading: false }));
      }
    };
    checkAdmin();
  }, []);

  // Load files and folders
  const loadFiles = useCallback(async (path = '') => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { files: loadedFiles, folders: loadedFolders } = await storage.listFiles(path);
      setState(prev => ({
        ...prev,
        files: loadedFiles,
        folders: loadedFolders,
        currentPath: path,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
      addNotification(`Error loading files: ${error.message}`, 'error');
    }
  }, [addNotification]);

  // Initial load
  useEffect(() => {
    if (state.isAdmin) {
      loadFiles();
    }
  }, [state.isAdmin, loadFiles]);

  // Navigation functions
  const navigateToFolder = (folderName) => {
    const newPath = state.currentPath ? `${state.currentPath}/${folderName}` : folderName;
    loadFiles(newPath);
  };

  const navigateToPath = (targetPath) => {
    loadFiles(targetPath);
  };

  // File operations
  const uploadFiles = async (acceptedFiles) => {
    if (!state.isAdmin) {
      addNotification('Permission denied: Admin access required for uploads', 'error');
      return;
    }

    setState(prev => ({ ...prev, uploading: true }));
    try {
      for (const file of acceptedFiles) {
        await storage.upload(file, state.currentPath);
      }
      addNotification(`${acceptedFiles.length} files uploaded successfully`, 'success');
      loadFiles(state.currentPath);
    } catch (error) {
      addNotification(`Upload error: ${error.message}`, 'error');
    } finally {
      setState(prev => ({ ...prev, uploading: false }));
    }
  };

  const deleteFile = async (fileName) => {
    if (!state.isAdmin || !window.confirm(`Delete file '${fileName}'?`)) return;
    try {
      const fullPath = state.currentPath ? `${state.currentPath}/${fileName}` : fileName;
      await storage.deleteFile(fullPath);
      addNotification('File deleted successfully', 'success');
      loadFiles(state.currentPath);
    } catch (error) {
      addNotification(`Error deleting file: ${error.message}`, 'error');
    }
  };

  const downloadFile = async (fileName) => {
    try {
      const fullPath = state.currentPath ? `${state.currentPath}/${fileName}` : fileName;
      const url = await storage.getDownloadUrl(fullPath);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (error) {
      addNotification(`Error downloading file: ${error.message}`, 'error');
    }
  };

  // Folder operations
  const createFolder = async () => {
    if (!state.isAdmin || !folderOperations.newFolderName.trim()) return;
    try {
      await storage.createFolder(folderOperations.newFolderName.trim(), state.currentPath);
      addNotification('Folder created successfully', 'success');
      setFolderOperations(prev => ({ ...prev, newFolderName: '' }));
      loadFiles(state.currentPath);
    } catch (error) {
      addNotification(`Error creating folder: ${error.message}`, 'error');
    }
  };

  const renameFolder = async (oldName) => {
    if (!state.isAdmin || !folderOperations.renamingFolder?.newName.trim()) return;
    try {
      await storage.renameFolder(oldName, folderOperations.renamingFolder.newName.trim(), state.currentPath);
      addNotification('Folder renamed successfully', 'success');
      setFolderOperations(prev => ({ ...prev, renamingFolder: null }));
      loadFiles(state.currentPath);
    } catch (error) {
      addNotification(`Error renaming folder: ${error.message}`, 'error');
      setFolderOperations(prev => ({ ...prev, renamingFolder: null }));
    }
  };

  const deleteFolder = async (folderName) => {
    if (!state.isAdmin || !window.confirm(`Delete folder '${folderName}' and all contents?`)) return;
    try {
      await storage.deleteFolder(state.currentPath ? `${state.currentPath}/${folderName}` : folderName);
      addNotification('Folder deleted successfully', 'success');
      loadFiles(state.currentPath);
    } catch (error) {
      addNotification(`Error deleting folder: ${error.message}`, 'error');
    }
  };

  // UI functions
  const updateUI = (updates) => {
    setUI(prev => ({ ...prev, ...updates }));
  };

  const updateFolderOperations = (updates) => {
    setFolderOperations(prev => ({ ...prev, ...updates }));
  };

  // Filtered and sorted files
  const processedFiles = state.files
    .filter(file =>
      file.nombre.toLowerCase().includes(ui.searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;

      switch (ui.sortBy) {
        case 'size':
          aValue = a.tamaño || 0;
          bValue = b.tamaño || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
      }

      if (ui.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  return {
    // State
    ...state,
    ui,
    notifications,
    folderOperations,
    processedFiles,
    
    // Actions
    loadFiles,
    navigateToFolder,
    navigateToPath,
    uploadFiles,
    deleteFile,
    downloadFile,
    createFolder,
    renameFolder,
    deleteFolder,
    updateUI,
    updateFolderOperations,
    addNotification
  };
};

export default useFileManager;
