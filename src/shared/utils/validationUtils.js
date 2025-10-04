/**
 * Validation Utilities
 * Centralized validation functions for the application
 */

import { dbService } from '../services';

/**
 * Validate that a documento number is unique for participantes
 * @param {string} numeroDocumento - Document number to validate
 * @param {number|null} participanteId - ID of current participante (for edit mode)
 * @returns {Promise<{isValid: boolean, error: string|null}>}
 */
export const validateParticipanteDocumentoUnico = async (numeroDocumento, participanteId = null) => {
  try {
    if (!numeroDocumento || !numeroDocumento.trim()) {
      return { isValid: false, error: 'El número de documento es requerido' };
    }

    const result = await dbService.getParticipantes();
    if (result.data && Array.isArray(result.data)) {
      const exists = result.data.some(p => {
        const pId = p.id || p.id_participante;
        return p.numero_documento === numeroDocumento && pId !== participanteId;
      });
      
      if (exists) {
        return { 
          isValid: false, 
          error: 'El número de documento ya está registrado para otro participante' 
        };
      }
    }
    
    return { isValid: true, error: null };
  } catch (err) {
    console.error('Error validating participante documento:', err);
    // Allow if validation fails to not block the user
    return { isValid: true, error: null };
  }
};

/**
 * Validate that a documento number is unique for acudientes
 * @param {string} numeroDocumento - Document number to validate
 * @param {number|null} acudienteId - ID of current acudiente (for edit mode)
 * @returns {Promise<{isValid: boolean, error: string|null}>}
 */
export const validateAcudienteDocumentoUnico = async (numeroDocumento, acudienteId = null) => {
  try {
    if (!numeroDocumento || !numeroDocumento.trim()) {
      return { isValid: false, error: 'El número de documento es requerido' };
    }

    const result = await dbService.getAcudientes();
    if (result.data && Array.isArray(result.data)) {
      const exists = result.data.some(a => {
        const aId = a.id || a.id_acudiente;
        return a.numero_documento === numeroDocumento && aId !== acudienteId;
      });
      
      if (exists) {
        return { 
          isValid: false, 
          error: 'El número de documento ya está registrado para otro acudiente' 
        };
      }
    }
    
    return { isValid: true, error: null };
  } catch (err) {
    console.error('Error validating acudiente documento:', err);
    // Allow if validation fails to not block the user
    return { isValid: true, error: null };
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'El email es requerido' };
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      error: 'El formato del email no es válido' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate date format and ensure it's not in the future
 * @param {string} fecha - Date string to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateFecha = (fecha, fieldName = 'fecha') => {
  if (!fecha) {
    return { isValid: false, error: `La ${fieldName} es requerida` };
  }

  const date = new Date(fecha);
  const today = new Date();
  
  // Reset time to compare only dates
  today.setHours(23, 59, 59, 999);

  // Check if date is valid
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { 
      isValid: false, 
      error: `La ${fieldName} no es válida` 
    };
  }

  // Check if date is not in the future
  if (date > today) {
    return { 
      isValid: false, 
      error: `La ${fieldName} no puede ser futura` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate fecha_nacimiento specifically
 * @param {string} fechaNacimiento - Birth date to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateFechaNacimiento = (fechaNacimiento) => {
  return validateFecha(fechaNacimiento, 'fecha de nacimiento');
};

/**
 * Validate fecha_ingreso specifically
 * @param {string} fechaIngreso - Entry date to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateFechaIngreso = (fechaIngreso) => {
  return validateFecha(fechaIngreso, 'fecha de ingreso');
};

/**
 * Validate that a participante exists
 * @param {number} participanteId - ID of participante to validate
 * @returns {Promise<{isValid: boolean, error: string|null}>}
 */
export const validateParticipanteExists = async (participanteId) => {
  try {
    if (!participanteId) {
      return { isValid: false, error: 'Debe seleccionar un participante' };
    }

    const result = await dbService.getParticipantes();
    if (result.data && Array.isArray(result.data)) {
      const exists = result.data.some(p => 
        (p.id_participante || p.id) === parseInt(participanteId)
      );
      
      if (!exists) {
        return { 
          isValid: false, 
          error: 'El participante seleccionado no existe' 
        };
      }
    }
    
    return { isValid: true, error: null };
  } catch (err) {
    console.error('Error validating participante exists:', err);
    return { isValid: false, error: 'Error al validar el participante' };
  }
};

/**
 * Validate that a sede exists
 * @param {number} sedeId - ID of sede to validate
 * @returns {Promise<{isValid: boolean, error: string|null}>}
 */
export const validateSedeExists = async (sedeId) => {
  try {
    if (!sedeId) {
      return { isValid: false, error: 'Debe seleccionar una sede' };
    }

    const result = await dbService.getSedes();
    if (result.data && Array.isArray(result.data)) {
      const exists = result.data.some(s => 
        (s.id_sede || s.id) === parseInt(sedeId)
      );
      
      if (!exists) {
        return { 
          isValid: false, 
          error: 'La sede seleccionada no existe' 
        };
      }
    }
    
    return { isValid: true, error: null };
  } catch (err) {
    console.error('Error validating sede exists:', err);
    return { isValid: false, error: 'Error al validar la sede' };
  }
};

/**
 * Validate that an acudiente exists
 * @param {number} acudienteId - ID of acudiente to validate
 * @returns {Promise<{isValid: boolean, error: string|null}>}
 */
export const validateAcudienteExists = async (acudienteId) => {
  try {
    if (!acudienteId) {
      return { isValid: false, error: 'Debe seleccionar un acudiente' };
    }

    const result = await dbService.getAcudientes();
    if (result.data && Array.isArray(result.data)) {
      const exists = result.data.some(a => 
        (a.id_acudiente || a.id) === parseInt(acudienteId)
      );
      
      if (!exists) {
        return { 
          isValid: false, 
          error: 'El acudiente seleccionado no existe' 
        };
      }
    }
    
    return { isValid: true, error: null };
  } catch (err) {
    console.error('Error validating acudiente exists:', err);
    return { isValid: false, error: 'Error al validar el acudiente' };
  }
};

/**
 * Validate mensualidad relationships (participante and acudiente must exist)
 * @param {number} participanteId - ID of participante
 * @param {number} acudienteId - ID of acudiente
 * @returns {Promise<{isValid: boolean, error: string|null}>}
 */
export const validateMensualidadRelations = async (participanteId, acudienteId) => {
  // Validate participante
  const participanteValidation = await validateParticipanteExists(participanteId);
  if (!participanteValidation.isValid) {
    return participanteValidation;
  }

  // Validate acudiente
  const acudienteValidation = await validateAcudienteExists(acudienteId);
  if (!acudienteValidation.isValid) {
    return acudienteValidation;
  }

  return { isValid: true, error: null };
};
