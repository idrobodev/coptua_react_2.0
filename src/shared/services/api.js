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
  timeout: 30000, // Aumentar timeout a 30 segundos
  // withCredentials: false, // Deshabilitado temporalmente para evitar CORS issues
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Enviando request a:', config.baseURL + config.url);
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response exitoso:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error);
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    
    // Manejar errores de red
    if (!error.response) {
      console.error('🔥 Error de red completo:', error);
      console.error('🔥 Error message:', error.message);
      console.error('🔥 Error code:', error.code);
      console.error('🔥 Error config:', error.config);
      return Promise.reject({
        message: `Error de conexión con el servidor: ${error.message}`,
        status: 0,
        originalError: error
      });
    }
    
    console.error('🔥 Error con response:', error.response.status, error.response.data);
    return Promise.reject(error.response.data || error);
  }
);

// Definición de roles del sistema
export const ROLES = {
  CONSULTA: 'CONSULTA',
  ADMINISTRADOR: 'ADMINISTRADOR'
};

class ApiService {
  // ==================== AUTENTICACIÓN ====================
  
  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      console.log('🔍 Response completa:', response.data);
      
      // La API devuelve {data: {token, user}, error: null}
      const { data: responseData, error: responseError } = response.data;
      
      if (responseError) {
        throw new Error(responseError.message || 'Error en el servidor');
      }
      
      const { token, user } = responseData;
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      console.log('✅ Login exitoso, usuario guardado:', user);
      
      return { data: { user, token }, error: null };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        data: null, 
        error: { 
          message: error.message || 'Error al iniciar sesión' 
        } 
      };
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

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken');
      
      console.log('🔍 Verificando localStorage:', { 
        hasUser: !!storedUser, 
        hasToken: !!storedToken 
      });
      
      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          console.log('👤 Usuario recuperado del localStorage:', user);
          
          // Verificar que el usuario tenga los campos necesarios
          if (user && user.email && user.id) {
            return { data: user, error: null };
          } else {
            console.warn('⚠️ Usuario en localStorage está corrupto');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            return { data: null, error: null };
          }
        } catch (parseError) {
          console.error('❌ Error parseando usuario del localStorage:', parseError);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          return { data: null, error: null };
        }
      }
      
      console.log('❌ No hay usuario o token en localStorage');
      return { data: null, error: null };
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
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

  // Crear nuevo participante
  async createParticipante(participanteData) {
    try {
      console.log('🔄 Enviando datos de participante:', participanteData);
      
      // Validar datos requeridos
      if (!participanteData.nombre || !participanteData.telefono) {
        return { 
          data: null, 
          error: { message: 'Nombre y teléfono son campos obligatorios' } 
        };
      }

      const response = await apiClient.post('/participantes', participanteData);
      console.log('✅ Participante creado, respuesta:', response.data);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('❌ Error creando participante:', error);
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

  // Crear nueva sede
  async createSede(sedeData) {
    try {
      console.log('🔄 Enviando datos de sede:', sedeData);

      const response = await apiClient.post('/sedes', sedeData);
      console.log('✅ Sede creada, respuesta:', response.data);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('❌ Error creando sede:', error);
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
  
  // Verificar conexión con la API
  async testConnection() {
    try {
      const response = await apiClient.get('/health');
      console.log('✅ Conexión con API exitosa');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error de conexión con API:', error.message);
      return { 
        success: false, 
        error: error.message || 'Error de conexión' 
      };
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
