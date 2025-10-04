import { ROLES, dashboardClient } from './api';
import { dbService } from './database';

const STORAGE_BASE_URL = process.env.REACT_APP_STORAGE_BASE_URL;

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
      // Get signed URL from backend
      const response = await dashboardClient.post('/storage/upload-url', {
        path: path || '',
        fileName: file.name,
        contentType: file.type || 'application/octet-stream'
      });

      const signedUrl = response.data.signedUrl;

      // Upload to signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const fullPath = (path ? path + '/' : '') + file.name;

      return {
        path: fullPath,
        publicUrl: STORAGE_BASE_URL + '/' + fullPath
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
      // Get signed URL from backend
      const response = await dashboardClient.post('/storage/delete-url', {
        path: fullPath
      });

      const signedUrl = response.data.signedUrl;

      // Delete using signed URL
      const deleteResponse = await fetch(signedUrl, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar archivo');
    }
  }

  async listFiles(path = '') {
    try {
      const response = await dashboardClient.get('/storage/list', {
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
      await dashboardClient.post('/storage/delete-folder', {
        path
      });
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
      const response = await dashboardClient.post('/storage/create-folder', {
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
      await dashboardClient.post('/storage/rename-folder', {
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
    // Return public URL
    return STORAGE_BASE_URL + '/' + path;
  }
}

export const storage = new StorageService();
export default storage;