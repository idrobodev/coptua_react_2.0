import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService, ROLES } from '../../services/database';

const ProtectedRoute = ({ children, requiredRole = ROLES.CONSULTA, fallback = null }) => {
  const { currentUser } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!currentUser) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        const permission = await dbService.hasPermission(requiredRole);
        setHasPermission(permission);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [currentUser, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-Poppins">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-Lato font-bold text-gray-800 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 font-Poppins">
            Debes iniciar sesión para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-user-slash text-6xl text-red-400 mb-4"></i>
          <h2 className="text-2xl font-Lato font-bold text-gray-800 mb-2">
            Sin Permisos Suficientes
          </h2>
          <p className="text-gray-600 font-Poppins">
            No tienes los permisos necesarios para acceder a esta sección
          </p>
          <p className="text-sm text-gray-500 font-Poppins mt-2">
            Rol requerido: {requiredRole}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
