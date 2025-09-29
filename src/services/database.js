import { api, ROLES } from './api';

// Re-exportar roles para compatibilidad
export { ROLES };

class DatabaseService {
  // Obtener usuario actual con rol
  async getCurrentUser() {
    return await api.getCurrentUser();
  }

  // Verificar permisos del usuario
  async hasPermission(requiredRole) {
    return await api.hasPermission(requiredRole);
  }

  // Obtener datos del dashboard
  async getDashboardData() {
    return await api.getDashboardData();
  }

  // Obtener participantes
  async getParticipantes() {
    return await api.getParticipantes();
  }

  // Obtener mensualidades/pagos
  async getMensualidades() {
    return await api.getMensualidades();
  }


  // Crear nuevo participante
  async createParticipante(participanteData) {
    return await api.createParticipante(participanteData);
  }

  // Actualizar participante
  async updateParticipante(id, participanteData) {
    return await api.updateParticipante(id, participanteData);
  }

  // Eliminar participante
  async deleteParticipante(id) {
    return await api.deleteParticipante(id);
  }

  // Obtener sedes
  async getSedes() {
    return await api.getSedes();
  }

  // Crear nueva sede
  async createSede(sedeData) {
    return await api.createSede(sedeData);
  }

  // Actualizar sede
  async updateSede(id, sedeData) {
    return await api.updateSede(id, sedeData);
  }

  // Crear nueva mensualidad
  async createMensualidad(mensualidadData) {
    return await api.createMensualidad(mensualidadData);
  }

  // Actualizar mensualidad
  async updateMensualidad(id, mensualidadData) {
    return await api.updateMensualidad(id, mensualidadData);
  }

  // Verificar conexión con la API
  async testConnection() {
    return await api.testConnection();
  }

  // Obtener configuración de la API
  getApiConfig() {
    return api.getApiConfig();
  }
}

// Exportar instancia única del servicio
export const dbService = new DatabaseService();
export default dbService;
