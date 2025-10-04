import axios from 'axios';

// Configuración de la API de formatos
const FORMATOS_API_BASE_URL = process.env.REACT_APP_FORMATOS_API_URL ||
  'http://localhost:8082/api';

console.log('🔧 FORMATOS_API_BASE_URL configurada como:', FORMATOS_API_BASE_URL);

// Crear instancia de axios para la API de formatos
const formatosClient = axios.create({
  baseURL: FORMATOS_API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para manejar respuestas y errores
formatosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en formatos API:', error.config?.url, error.response?.status, error.message);

    // Manejar errores específicos
    if (error.response?.status === 413) {
      throw new Error('El archivo es demasiado grande (máximo 100MB)');
    } else if (error.response?.status === 409) {
      throw new Error(error.response.data?.detail || 'Conflicto: el recurso ya existe');
    } else if (error.response?.status === 404) {
      throw new Error('Recurso no encontrado');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || 'Datos inválidos');
    } else if (error.response?.status === 500) {
      throw new Error('Error interno del servidor');
    }

    // Error de red o desconocido
    if (!error.response) {
      throw new Error('No se puede conectar con el servidor de formatos');
    }

    throw error;
  }
);

class FormatosApiService {
  // ==================== ARCHIVOS ====================

  /**
   * Lista archivos y carpetas en una ruta específica
   * @param {string} path - Ruta a listar (opcional, default="")
   * @returns {Promise<{files: Array, folders: Array, path: string}>}
   */
  async listFiles(path = "") {
    try {
      const response = await formatosClient.get('/files/list', {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error listando archivos:', error);
      throw error;
    }
  }

  /**
   * Sube un archivo al servidor
   * @param {File} file - Archivo a subir
   * @param {string} path - Ruta de destino (opcional)
   * @returns {Promise<Object>} Información del archivo subido
   */
  async uploadFile(file, path = "") {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      const response = await formatosClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      throw error;
    }
  }

  /**
   * Descarga un archivo por su ID
   * @param {number} fileId - ID del archivo
   * @returns {Promise<Blob>} Archivo como blob
   */
  async downloadFile(fileId) {
    try {
      const response = await formatosClient.get(`/files/download/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error descargando archivo:', error);
      throw error;
    }
  }

  /**
   * Elimina un archivo por su ID
   * @param {number} fileId - ID del archivo a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteFile(fileId) {
    try {
      const response = await formatosClient.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }

  // ==================== CARPETAS ====================

  /**
   * Crea una nueva carpeta
   * @param {string} nombre - Nombre de la carpeta
   * @param {string} parentPath - Ruta del directorio padre (opcional)
   * @returns {Promise<Object>} Información de la carpeta creada
   */
  async createFolder(nombre, parentPath = "") {
    try {
      const response = await formatosClient.post('/folders/create', {
        nombre,
        parentPath
      });
      return response.data;
    } catch (error) {
      console.error('Error creando carpeta:', error);
      throw error;
    }
  }

  /**
   * Renombra una carpeta
   * @param {string} oldName - Nombre actual de la carpeta
   * @param {string} newName - Nuevo nombre de la carpeta
   * @param {string} parentPath - Ruta del directorio padre
   * @returns {Promise<Object>} Confirmación del cambio
   */
  async renameFolder(oldName, newName, parentPath = "") {
    try {
      const response = await formatosClient.put('/folders/rename', {
        oldName,
        newName,
        parentPath
      });
      return response.data;
    } catch (error) {
      console.error('Error renombrando carpeta:', error);
      throw error;
    }
  }

  /**
   * Elimina una carpeta por su ID
   * @param {number} folderId - ID de la carpeta a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteFolder(folderId) {
    try {
      const response = await formatosClient.delete(`/folders/${folderId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando carpeta:', error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const formatosApi = new FormatosApiService();
export default formatosApi;