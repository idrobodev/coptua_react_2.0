// Servicio API para comunicación con Spring Boot Backend
import axios from 'axios';

// Configuración base de la API
// Usar la URL del host actual para la API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8080/api`;

console.log('🔧 API_BASE_URL configurada como:', API_BASE_URL);

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos timeout para operaciones pesadas
  withCredentials: false, // false por defecto - cambiar a true solo si backend requiere cookies/credenciales
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Especificar que esperamos JSON en las respuestas
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorInfo = generateErrorMessage(error);

    // Solo log crítico de errores
    if (errorInfo.isCorsError) {
      console.error('CORS ERROR:', error.config?.url);
    } else if (errorInfo.isNetworkError) {
      console.error('Network error:', error.message);
    } else if (error.response) {
      console.error(`HTTP ${error.response.status}:`, error.response.data);
    }

    // Manejar errores de autenticación
    if (error.response?.status === 401 && !errorInfo.isNetworkError) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }

    const enhancedError = {
      message: errorInfo.message,
      type: errorInfo.type,
      status: errorInfo.status,
      isCorsError: errorInfo.isCorsError,
      isNetworkError: errorInfo.isNetworkError,
      suggestions: errorInfo.suggestions,
      serverMessage: error.response?.data?.message || null,
      originalError: error,
      response: error.response
    };

    return Promise.reject(enhancedError);
  }
);

// Definición de roles del sistema
export const ROLES = {
  CONSULTA: 'CONSULTA',
  ADMINISTRADOR: 'ADMINISTRADOR'
};

// ==================== CORS ERROR DETECTION ====================

/**
 * Detecta si un error de axios es causado por CORS
 * @param {Error} error - El objeto de error de axios
 * @returns {boolean} true si es un error de CORS, false en caso contrario
 */
export const detectCorsError = (error) => {
  // CORS errors typically have these characteristics:
  // 1. No response object (preflight or actual request blocked)
  // 2. Network Error message
  // 3. Error code ERR_NETWORK
  // 4. Request was made but no response received

  // Check if there's no response (most common CORS indicator)
  if (!error.response) {
    // Check for network error patterns
    const isNetworkError = error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK';

    // Check if request was configured (means axios tried to send it)
    const hasRequestConfig = !!error.config;

    // CORS errors occur when:
    // - There's a network error
    // - Request was configured and attempted
    // - No response was received (blocked by browser)
    if (isNetworkError && hasRequestConfig) {
      // Additional check: if the URL is cross-origin
      const requestUrl = error.config?.url || '';
      const baseURL = error.config?.baseURL || '';
      const fullUrl = requestUrl.startsWith('http') ? requestUrl : baseURL + requestUrl;

      // If we're making a request to a different origin, it's likely CORS
      if (fullUrl.startsWith('http')) {
        const currentOrigin = `${window.location.protocol}//${window.location.host}`;
        const requestOrigin = new URL(fullUrl).origin;

        // Different origins = likely CORS issue
        if (currentOrigin !== requestOrigin) {
          return true;
        }
      }

      // Even same origin can have CORS issues in some cases
      // If it's a network error with no response, assume CORS
      return true;
    }
  }

  // Check for specific CORS-related error messages
  const errorMessage = error.message?.toLowerCase() || '';
  const corsKeywords = ['cors', 'cross-origin', 'preflight'];

  if (corsKeywords.some(keyword => errorMessage.includes(keyword))) {
    return true;
  }

  // Not a CORS error
  return false;
};

// ==================== ERROR MESSAGE GENERATOR ====================

/**
 * Genera mensajes de error amigables y accionables para diferentes tipos de errores
 * @param {Error} error - El objeto de error original
 * @returns {Object} Objeto con mensaje, sugerencias y tipo de error
 */
export const generateErrorMessage = (error) => {
  const errorInfo = {
    message: '',
    suggestions: [],
    type: 'unknown',
    isNetworkError: false,
    isCorsError: false,
    status: error.response?.status || 0,
    originalError: error
  };

  // Usar la función de detección de CORS
  const isCorsError = detectCorsError(error);

  // Detectar si es un error de red (sin respuesta del servidor)
  const isNetworkError = !error.response && (
    error.message === 'Network Error' ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    !error.status
  );

  if (isCorsError) {
    // Error de CORS
    errorInfo.type = 'cors';
    errorInfo.isCorsError = true;
    errorInfo.isNetworkError = true;
    errorInfo.message = 'No se puede conectar con el servidor debido a restricciones de CORS';
    errorInfo.suggestions = [
      '🔧 Verifica que el servidor backend esté ejecutándose en http://localhost:8080',
      '🔧 Asegúrate de que el backend tenga configurado CORS correctamente',
      '🔍 Revisa la consola del navegador para ver detalles específicos del error CORS',
      '⚙️ Si eres desarrollador, verifica la configuración de CORS en el backend (WebMvcConfigurer o SecurityFilterChain)',
      '🔄 Intenta reiniciar tanto el frontend como el backend',
      '📝 Verifica que el backend permita el origen: ' + window.location.origin
    ];
  } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    // Error de timeout
    errorInfo.type = 'timeout';
    errorInfo.isNetworkError = true;
    errorInfo.message = 'La solicitud al servidor tardó demasiado tiempo (timeout después de 30 segundos)';
    errorInfo.suggestions = [
      '🌐 Verifica tu conexión a internet',
      '⏱️ El servidor puede estar experimentando alta carga o procesando una operación pesada',
      '🔄 Intenta nuevamente en unos momentos',
      '📊 Si trabajas con grandes volúmenes de datos, considera filtrar o paginar los resultados',
      '🔧 Si el problema persiste, contacta al administrador del sistema'
    ];
  } else if (isNetworkError) {
    // Error de red general (backend no disponible)
    errorInfo.type = 'network';
    errorInfo.isNetworkError = true;
    errorInfo.message = 'No se puede conectar con el servidor - Backend no disponible';
    errorInfo.suggestions = [
      '🚀 Verifica que el servidor backend esté ejecutándose en ' + (error.config?.baseURL || 'http://localhost:8080'),
      '🌐 Comprueba tu conexión a internet',
      '🔍 Asegúrate de que la URL del servidor sea correcta',
      '🛡️ Verifica que no haya un firewall bloqueando la conexión',
      '🔧 Si eres desarrollador, inicia el backend con: ./mvnw spring-boot:run',
      '📞 Si el problema persiste, contacta al administrador del sistema'
    ];
  } else if (error.response) {
    // Error HTTP con respuesta del servidor
    const status = error.response.status;

    switch (status) {
      case 400:
        errorInfo.type = 'validation';
        errorInfo.message = 'Los datos enviados no son válidos (Error 400)';
        errorInfo.suggestions = [
          '📝 Verifica que todos los campos requeridos estén completos',
          '✅ Asegúrate de que los datos tengan el formato correcto (emails, teléfonos, fechas, etc.)',
          '🔍 Revisa los mensajes de validación específicos del servidor',
          '📋 Verifica que no haya campos con valores inválidos o fuera de rango'
        ];
        break;

      case 401:
        errorInfo.type = 'authentication';
        errorInfo.message = 'No estás autenticado o tu sesión ha expirado (Error 401)';
        errorInfo.suggestions = [
          '🔐 Inicia sesión nuevamente',
          '✅ Verifica que tus credenciales sean correctas',
          '⏱️ Tu sesión puede haber expirado por inactividad',
          '🔄 Intenta cerrar sesión y volver a iniciar sesión'
        ];
        break;

      case 403:
        errorInfo.type = 'authorization';
        errorInfo.message = 'No tienes permisos para realizar esta acción (Error 403)';
        errorInfo.suggestions = [
          '👤 Contacta al administrador para solicitar los permisos necesarios',
          '🔑 Verifica que tu cuenta tenga el rol adecuado',
          '⚙️ Puede que necesites permisos de ADMINISTRADOR para esta operación',
          '📋 Revisa qué acciones están permitidas para tu rol actual'
        ];
        break;

      case 404:
        errorInfo.type = 'notFound';
        errorInfo.message = 'El recurso solicitado no fue encontrado (Error 404)';
        errorInfo.suggestions = [
          '🔍 Verifica que el recurso exista en el sistema',
          '🗑️ Puede que el recurso haya sido eliminado recientemente',
          '🔄 Intenta refrescar la página y volver a intentar',
          '📋 Verifica que el ID o identificador sea correcto'
        ];
        break;

      case 409:
        errorInfo.type = 'conflict';
        errorInfo.message = 'Ya existe un recurso con estos datos (Error 409)';
        errorInfo.suggestions = [
          '🔍 Verifica que no estés duplicando información',
          '📝 Puede que ya exista un registro con el mismo identificador único',
          '✏️ Intenta con datos diferentes o actualiza el registro existente',
          '🔄 Refresca la lista para ver los datos actuales'
        ];
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        errorInfo.type = 'serverError';
        errorInfo.message = `Error interno del servidor (Error ${status})`;
        errorInfo.suggestions = [
          '🔥 El servidor está experimentando problemas técnicos',
          '⏱️ Intenta nuevamente en unos momentos',
          '🔧 Si el problema persiste, contacta al administrador del sistema',
          '📝 Este error ha sido registrado automáticamente para su revisión',
          '💾 Verifica que la base de datos esté disponible (si eres administrador)'
        ];
        break;

      default:
        errorInfo.type = 'http';
        errorInfo.message = `Error del servidor (código ${status})`;
        errorInfo.suggestions = [
          '❌ Ocurrió un error inesperado en el servidor',
          '🔄 Intenta nuevamente',
          '📞 Si el problema persiste, contacta al soporte técnico',
          '🔍 Código de error: ' + status
        ];
    }

    // Agregar mensaje específico del servidor si está disponible
    if (error.response.data?.message) {
      errorInfo.serverMessage = error.response.data.message;
    }
  } else {
    // Error desconocido
    errorInfo.type = 'unknown';
    errorInfo.message = 'Ocurrió un error inesperado';
    errorInfo.suggestions = [
      '🔄 Intenta refrescar la página',
      '🌐 Verifica tu conexión a internet',
      '💾 Limpia la caché del navegador si el problema persiste',
      '🔧 Intenta cerrar y volver a abrir la aplicación',
      '📞 Si el problema persiste, contacta al soporte técnico con detalles del error'
    ];
  }

  return errorInfo;
};

class ApiService {
  // ==================== AUTENTICACIÓN ====================

  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { data: responseData, error: responseError } = response.data;

      if (responseError) {
        const error = new Error(responseError.message || 'Error en el servidor');
        error.serverError = responseError;
        throw error;
      }

      if (!responseData) {
        throw new Error('Respuesta del servidor inválida');
      }

      const { token, user } = responseData;

      if (!token || !user) {
        throw new Error('Respuesta del servidor incompleta');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { data: { user, token }, error: null };
    } catch (error) {
      if (error.response) {
        const serverMessage = error.response.data?.error?.message || error.response.data?.message;
        throw new Error(serverMessage || 'Error del servidor');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        throw error;
      }
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      await apiClient.post('/auth/logout');

      // Limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar localStorage aunque falle la petición
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return { success: true, error: null };
    }
  }


  // Restablecer contraseña
  async resetPassword(email) {
    try {
      const response = await apiClient.post('/auth/reset-password', { email });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error en reset password:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al restablecer contraseña'
        }
      };
    }
  }

  async getCurrentUser() {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken');

      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);

          if (user && user.email && user.id) {
            return { data: user, error: null };
          } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            return { data: null, error: null };
          }
        } catch (parseError) {
          console.error('Error parseando usuario:', parseError);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          return { data: null, error: null };
        }
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return { data: null, error };
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData);

      // Actualizar usuario en localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al actualizar perfil'
        }
      };
    }
  }

  // Verificar permisos del usuario
  async hasPermission(requiredRole) {
    try {
      // Consultar endpoint real en backend
      const response = await apiClient.get('/auth/permission', {
        params: { role: requiredRole }
      });

      return response.data.hasPermission || false;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      // Fallback temporal a verificación local si el endpoint no existe
      try {
        const { data: user } = await this.getCurrentUser();

        if (!user) return false;

        const userRole = user.rol || ROLES.CONSULTA;

        // Jerarquía de roles: ADMINISTRADOR > CONSULTA
        const roleHierarchy = {
          [ROLES.ADMINISTRADOR]: 2,
          [ROLES.CONSULTA]: 1
        };

        const userLevel = roleHierarchy[userRole] || 1;
        const requiredLevel = roleHierarchy[requiredRole] || 1;

        return userLevel >= requiredLevel;
      } catch (fallbackError) {
        console.error('Fallback también falló:', fallbackError);
        return false;
      }
    }
  }

  // ==================== DASHBOARD ====================

  // Obtener datos del dashboard
  async getDashboardData() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error);
      return {
        data: { participantes: 0, mensualidades: 0 },
        error
      };
    }
  }

  // ==================== PARTICIPANTES ====================

  // Obtener participantes
  async getParticipantes() {
    try {
      const response = await apiClient.get('/participantes');
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error obteniendo participantes:', error);
      return {
        data: [],
        error: { message: 'Error al cargar participantes' }
      };
    }
  }

  async createParticipante(participanteData) {
    try {
      if (!participanteData.nombre || !participanteData.telefono) {
        return {
          data: null,
          error: { message: 'Nombre y teléfono son campos obligatorios' }
        };
      }

      const response = await apiClient.post('/participantes', participanteData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando participante:', error);
      return {
        data: null,
        error: {
          message: error.response?.data?.message || error.message || 'Error al crear participante'
        }
      };
    }
  }

  // Actualizar participante
  async updateParticipante(id, participanteData) {
    try {
      if (!id) {
        return {
          data: null,
          error: { message: 'ID de participante requerido' }
        };
      }

      const response = await apiClient.put(`/participantes/${id}`, participanteData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando participante:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al actualizar participante'
        }
      };
    }
  }

  // Eliminar participante
  async deleteParticipante(id) {
    try {
      await apiClient.delete(`/participantes/${id}`);
      return { error: null };
    } catch (error) {
      console.error('Error eliminando participante:', error);
      return {
        error: {
          message: error.message || 'Error al eliminar participante'
        }
      };
    }
  }

  // ==================== MENSUALIDADES ====================

  // Obtener mensualidades
  async getMensualidades() {
    try {
      const response = await apiClient.get('/mensualidades');
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error obteniendo mensualidades:', error);
      return {
        data: [],
        error: { message: 'Error al cargar mensualidades' }
      };
    }
  }

  // Crear nueva mensualidad
  async createMensualidad(mensualidadData) {
    try {
      if (!mensualidadData.participante_id || !mensualidadData.valor) {
        return {
          data: null,
          error: { message: 'Participante y valor son campos obligatorios' }
        };
      }

      const response = await apiClient.post('/mensualidades', mensualidadData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando mensualidad:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al crear mensualidad'
        }
      };
    }
  }

  // Actualizar mensualidad
  async updateMensualidad(id, mensualidadData) {
    try {
      if (!id) {
        return {
          data: null,
          error: { message: 'ID de mensualidad requerido' }
        };
      }

      const response = await apiClient.put(`/mensualidades/${id}`, mensualidadData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando mensualidad:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al actualizar mensualidad'
        }
      };
    }
  }

  // ==================== SEDES ====================

  // Obtener sedes
  async getSedes() {
    try {
      const response = await apiClient.get('/sedes');
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error obteniendo sedes:', error);
      return {
        data: [],
        error: { message: 'Error al cargar sedes' }
      };
    }
  }

  async createSede(sedeData) {
    try {
      const response = await apiClient.post('/sedes', sedeData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando sede:', error);
      return {
        data: null,
        error: {
          message: error.response?.data?.message || error.message || 'Error al crear sede'
        }
      };
    }
  }

  // Actualizar sede
  async updateSede(id, sedeData) {
    try {
      if (!id) {
        return {
          data: null,
          error: { message: 'ID de sede requerido' }
        };
      }

      const response = await apiClient.put(`/sedes/${id}`, sedeData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando sede:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al actualizar sede'
        }
      };
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Verifica la conexión con el backend y proporciona estado detallado
   * @returns {Promise<Object>} Objeto con información detallada de la conexión
   */
  async testConnection() {
    const startTime = Date.now();

    try {
      const response = await apiClient.get('/health');
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        connected: true,
        responseTime,
        status: response.status,
        baseURL: API_BASE_URL,
        data: response.data,
        message: 'Conexión exitosa con el backend'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorInfo = generateErrorMessage(error);

      console.error('Error de conexión con API:', error.message);

      return {
        success: false,
        connected: false,
        responseTime,
        baseURL: API_BASE_URL,
        error: error.message || 'Error de conexión',
        errorType: errorInfo.type,
        isCorsError: errorInfo.isCorsError,
        isNetworkError: errorInfo.isNetworkError,
        suggestions: errorInfo.suggestions,
        message: errorInfo.message
      };
    }
  }

  /**
   * Verifica si el backend está disponible antes de operaciones críticas
   * @param {number} timeout - Timeout en milisegundos (por defecto 5000ms)
   * @returns {Promise<boolean>} true si el backend está disponible, false en caso contrario
   */
  async isBackendReachable(timeout = 5000) {
    try {
      const quickCheck = axios.create({
        baseURL: API_BASE_URL,
        timeout: timeout,
        headers: {
          'Accept': 'application/json'
        }
      });

      await quickCheck.get('/health');
      return true;
    } catch (error) {
      console.warn('Backend no disponible:', error.message);
      return false;
    }
  }

  // Obtener configuración de la API
  getApiConfig() {
    return {
      baseURL: API_BASE_URL,
      hasToken: !!localStorage.getItem('authToken'),
      environment: process.env.NODE_ENV,
      isConfigured: !!API_BASE_URL
    };
  }
}

// Exportar instancia única del servicio
export const api = new ApiService();
export default api;

// Exportar cliente axios para uso directo si es necesario
export { apiClient };
