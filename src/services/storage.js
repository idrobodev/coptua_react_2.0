import { api, ROLES, apiClient } from './api';
import { dbService } from './database';

class StorageService {
  async isAdmin() {
    return await dbService.hasPermission(ROLES.ADMINISTRADOR);
  }

  async upload(file, path = '') {
    if (!(await this.isAdmin())) {
      throw new Error('Permission denied: Admin access required');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path || '');

      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        path: response.data.path,
        publicUrl: response.data.url
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.message || 'Error al subir archivo');
    }
  }

  async deleteFile(fullPath) {
    if (!(await this.isAdmin())) {
      throw new Error('Permission denied: Admin access required');
    }

    try {
      await apiClient.delete(`/files/${encodeURIComponent(fullPath)}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar archivo');
    }
  }

  async listFiles(path = '') {
    try {
      const response = await apiClient.get('/files', {
        params: { path: path || '' }
      });

      return {
        files: response.data.files || [],
        folders: response.data.folders || []
      };
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(error.response?.data?.message || 'Error al listar archivos');
    }
  }

  async deleteFolder(path) {
    if (!(await this.isAdmin())) {
      throw new Error('Permission denied: Admin access required');
    }

    try {
      await apiClient.delete(`/files/folder/${encodeURIComponent(path)}`);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar carpeta');
    }
  }

  async createFolder(folderName, parentPath = '') {
    if (!(await this.isAdmin())) {
      throw new Error('Permission denied: Admin access required');
    }

    try {
      const response = await apiClient.post('/files/folder', {
        name: folderName,
        parentPath: parentPath || ''
      });

      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error(error.response?.data?.message || 'Error al crear carpeta');
    }
  }

  async renameFolder(oldName, newName, parentPath = '') {
    if (!(await this.isAdmin())) {
      throw new Error('Permission denied: Admin access required');
    }

    try {
      await apiClient.put('/files/folder/rename', {
        oldName,
        newName,
        parentPath: parentPath || ''
      });
    } catch (error) {
      console.error('Error renaming folder:', error);
      throw new Error(error.response?.data?.message || 'Error al renombrar carpeta');
    }
  }

  async getDownloadUrl(path) {
    try {
      const response = await apiClient.get(`/files/download-url/${encodeURIComponent(path)}`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener URL de descarga');
    }
  }
}

export const storage = new StorageService();
export default storage;