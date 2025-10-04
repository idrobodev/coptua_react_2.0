// Servicio API   
import axios from 'axios';

// Configuración base de las APIs
// URLs para servicios separados
const AUTH_API_BASE_URL = process.env.REACT_APP_AUTH_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8080/api`;

const DASHBOARD_API_BASE_URL = process.env.REACT_APP_DASHBOARD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8081/api`;

console.log('🔧 AUTH_API_BASE_URL configurada como:', AUTH_API_BASE_URL);
console.log('🔧 DASHBOARD_API_BASE_URL configurada como:', DASHBOARD_API_BASE_URL);

// Crear instancia de axios para autenticación
const authClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Crear instancia de axios para dashboard
const dashboardClient = axios.create({
  baseURL: DASHBOARD_API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Función helper para configurar interceptors
const setupInterceptors = (client, serviceName) => {
  // Interceptor para agregar token de autenticación
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error(`Error en ${serviceName} request interceptor:`, error);
      return Promise.reject(error);
    }
  );

  // Interceptor para manejar respuestas y errores
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorInfo = generateErrorMessage(error);

      // Solo log crítico de errores
      if (errorInfo.isCorsError) {
        console.error(`CORS ERROR (${serviceName}):`, error.config?.url);
      } else if (errorInfo.isNetworkError) {
        console.error(`Network error (${serviceName}):`, error.message);
      } else if (error.response) {
        console.error(`HTTP ${error.response.status} (${serviceName}):`, error.response.data);
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
};

// Configurar interceptors para ambos clientes
setupInterceptors(authClient, 'AUTH');
setupInterceptors(dashboardClient, 'DASHBOARD');

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
      const response = await authClient.post('/auth/login', { email, password });
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
      await authClient.post('/auth/logout');

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
      const response = await authClient.post('/auth/reset-password', { email });
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
      const response = await authClient.put('/auth/profile', profileData);

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
      const response = await authClient.get('/auth/permission', {
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
      const response = await dashboardClient.get('/dashboard/stats');
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
      const response = await dashboardClient.get('/participantes');
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

      const response = await dashboardClient.post('/participantes', participanteData);
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

      const response = await dashboardClient.put(`/participantes/${id}`, participanteData);
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
      await dashboardClient.delete(`/participantes/${id}`);
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
      const response = await dashboardClient.get('/mensualidades');
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

      const response = await dashboardClient.post('/mensualidades', mensualidadData);
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

      const response = await dashboardClient.put(`/mensualidades/${id}`, mensualidadData);
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
      const response = await dashboardClient.get('/sedes');
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
      const response = await dashboardClient.post('/sedes', sedeData);
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

      const response = await dashboardClient.put(`/sedes/${id}`, sedeData);
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

  // Eliminar sede
  async deleteSede(id) {
    try {
      if (!id) {
        return {
          error: { message: 'ID de sede requerido' }
        };
      }

      await dashboardClient.delete(`/sedes/${id}`);
      return { error: null };
    } catch (error) {
      console.error('Error eliminando sede:', error);
      return {
        error: {
          message: error.response?.data?.message || error.message || 'Error al eliminar sede'
        }
      };
    }
  }

  // ==================== USUARIOS ====================

  /**
   * Obtener lista de usuarios
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getUsuarios() {
    try {
      const response = await dashboardClient.get('/usuarios');
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return {
        data: [],
        error: { message: 'Error al cargar usuarios' }
      };
    }
  }

  /**
   * Crear nuevo usuario
   * @param {Object} usuarioData - {email, password, rol}
   * @returns {Promise<{data: Object, error: Object|null}>}
   */
  async createUsuario(usuarioData) {
    try {
      if (!usuarioData.email || !usuarioData.password || !usuarioData.rol) {
        return {
          data: null,
          error: { message: 'Email, contraseña y rol son campos obligatorios' }
        };
      }

      const response = await dashboardClient.post('/usuarios', usuarioData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando usuario:', error);
      return {
        data: null,
        error: {
          message: error.response?.data?.message || error.message || 'Error al crear usuario'
        }
      };
    }
  }

  /**
   * Actualizar usuario existente
   * @param {number} id - ID del usuario
   * @param {Object} usuarioData - Datos a actualizar
   * @returns {Promise<{data: Object, error: Object|null}>}
   */
  async updateUsuario(id, usuarioData) {
    try {
      if (!id) {
        return {
          data: null,
          error: { message: 'ID de usuario requerido' }
        };
      }

      const response = await dashboardClient.put(`/usuarios/${id}`, usuarioData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al actualizar usuario'
        }
      };
    }
  }

  /**
   * Eliminar usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<{error: Object|null}>}
   */
  async deleteUsuario(id) {
    try {
      if (!id) {
        return {
          error: { message: 'ID de usuario requerido' }
        };
      }

      await dashboardClient.delete(`/usuarios/${id}`);
      return { error: null };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      return {
        error: {
          message: error.message || 'Error al eliminar usuario'
        }
      };
    }
  }

  // ==================== ACUDIENTES ====================

  /**
   * Obtener lista de acudientes
   * @param {Object} filters - Filtros opcionales {participante_id}
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getAcudientes(filters = {}) {
    try {
      const response = await dashboardClient.get('/acudientes', { params: filters });
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error obteniendo acudientes:', error);
      return {
        data: [],
        error: { message: 'Error al cargar acudientes' }
      };
    }
  }

  /**
   * Obtener acudientes de un participante específico
   * @param {number} participanteId - ID del participante
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getAcudientesByParticipante(participanteId) {
    try {
      if (!participanteId) {
        return {
          data: [],
          error: { message: 'ID de participante requerido' }
        };
      }

      const response = await dashboardClient.get(`/participantes/${participanteId}/acudientes`);
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error obteniendo acudientes del participante:', error);
      return {
        data: [],
        error: { message: 'Error al cargar acudientes del participante' }
      };
    }
  }

  /**
   * Crear nuevo acudiente
   * @param {Object} acudienteData - Datos del acudiente
   * @returns {Promise<{data: Object, error: Object|null}>}
   */
  async createAcudiente(acudienteData) {
    try {
      if (!acudienteData.id_participante || !acudienteData.numero_documento ||
          !acudienteData.nombres || !acudienteData.apellidos) {
        return {
          data: null,
          error: { message: 'Participante, documento, nombres y apellidos son campos obligatorios' }
        };
      }

      const response = await dashboardClient.post('/acudientes', acudienteData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando acudiente:', error);
      return {
        data: null,
        error: {
          message: error.response?.data?.message || error.message || 'Error al crear acudiente'
        }
      };
    }
  }

  /**
   * Actualizar acudiente existente
   * @param {number} id - ID del acudiente
   * @param {Object} acudienteData - Datos a actualizar
   * @returns {Promise<{data: Object, error: Object|null}>}
   */
  async updateAcudiente(id, acudienteData) {
    try {
      if (!id) {
        return {
          data: null,
          error: { message: 'ID de acudiente requerido' }
        };
      }

      const response = await dashboardClient.put(`/acudientes/${id}`, acudienteData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando acudiente:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Error al actualizar acudiente'
        }
      };
    }
  }

  /**
   * Eliminar acudiente
   * @param {number} id - ID del acudiente
   * @returns {Promise<{error: Object|null}>}
   */
  async deleteAcudiente(id) {
    try {
      if (!id) {
        return {
          error: { message: 'ID de acudiente requerido' }
        };
      }

      await dashboardClient.delete(`/acudientes/${id}`);
      return { error: null };
    } catch (error) {
      console.error('Error eliminando acudiente:', error);
      return {
        error: {
          message: error.message || 'Error al eliminar acudiente'
        }
      };
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Verifica la conexión con ambos backends y proporciona estado detallado
   * @returns {Promise<Object>} Objeto con información detallada de la conexión
   */
  async testConnection() {
    const startTime = Date.now();
    const results = {
      auth: null,
      dashboard: null,
      overall: { success: false, message: 'Conexión fallida' }
    };

    // Test auth service
    try {
      const authResponse = await authClient.get('/health');
      results.auth = {
        success: true,
        connected: true,
        responseTime: Date.now() - startTime,
        status: authResponse.status,
        baseURL: AUTH_API_BASE_URL,
        data: authResponse.data,
        message: 'Conexión exitosa con auth service'
      };
    } catch (error) {
      const errorInfo = generateErrorMessage(error);
      results.auth = {
        success: false,
        connected: false,
        responseTime: Date.now() - startTime,
        baseURL: AUTH_API_BASE_URL,
        error: error.message || 'Error de conexión',
        errorType: errorInfo.type,
        isCorsError: errorInfo.isCorsError,
        isNetworkError: errorInfo.isNetworkError,
        suggestions: errorInfo.suggestions,
        message: errorInfo.message
      };
    }

    // Test dashboard service
    try {
      const dashboardResponse = await dashboardClient.get('/health');
      results.dashboard = {
        success: true,
        connected: true,
        responseTime: Date.now() - startTime,
        status: dashboardResponse.status,
        baseURL: DASHBOARD_API_BASE_URL,
        data: dashboardResponse.data,
        message: 'Conexión exitosa con dashboard service'
      };
    } catch (error) {
      const errorInfo = generateErrorMessage(error);
      results.dashboard = {
        success: false,
        connected: false,
        responseTime: Date.now() - startTime,
        baseURL: DASHBOARD_API_BASE_URL,
        error: error.message || 'Error de conexión',
        errorType: errorInfo.type,
        isCorsError: errorInfo.isCorsError,
        isNetworkError: errorInfo.isNetworkError,
        suggestions: errorInfo.suggestions,
        message: errorInfo.message
      };
    }

    // Overall result
    const authSuccess = results.auth.success;
    const dashboardSuccess = results.dashboard.success;

    if (authSuccess && dashboardSuccess) {
      results.overall = {
        success: true,
        message: 'Conexión exitosa con ambos servicios'
      };
    } else if (authSuccess) {
      results.overall = {
        success: false,
        message: 'Auth service OK, pero dashboard service falló'
      };
    } else if (dashboardSuccess) {
      results.overall = {
        success: false,
        message: 'Dashboard service OK, pero auth service falló'
      };
    } else {
      results.overall = {
        success: false,
        message: 'Ambos servicios no están disponibles'
      };
    }

    return results;
  }

  /**
   * Verifica si los backends están disponibles antes de operaciones críticas
   * @param {number} timeout - Timeout en milisegundos (por defecto 5000ms)
   * @returns {Promise<Object>} Objeto con estado de ambos servicios
   */
  async isBackendReachable(timeout = 5000) {
    const results = { auth: false, dashboard: false };

    // Check auth service
    try {
      const authCheck = axios.create({
        baseURL: AUTH_API_BASE_URL,
        timeout: timeout,
        headers: { 'Accept': 'application/json' }
      });
      await authCheck.get('/health');
      results.auth = true;
    } catch (error) {
      console.warn('Auth service no disponible:', error.message);
    }

    // Check dashboard service
    try {
      const dashboardCheck = axios.create({
        baseURL: DASHBOARD_API_BASE_URL,
        timeout: timeout,
        headers: { 'Accept': 'application/json' }
      });
      await dashboardCheck.get('/health');
      results.dashboard = true;
    } catch (error) {
      console.warn('Dashboard service no disponible:', error.message);
    }

    return results;
  }

  // Obtener configuración de la API
  getApiConfig() {
    return {
      authBaseURL: AUTH_API_BASE_URL,
      dashboardBaseURL: DASHBOARD_API_BASE_URL,
      hasToken: !!localStorage.getItem('authToken'),
      environment: process.env.NODE_ENV,
      isConfigured: !!(AUTH_API_BASE_URL && DASHBOARD_API_BASE_URL)
    };
  }
}

// Exportar instancia única del servicio
export const api = new ApiService();
export default api;

// Exportar clientes axios para uso directo si es necesario
export { authClient, dashboardClient };
