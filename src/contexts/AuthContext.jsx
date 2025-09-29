import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
const AuthContext = createContext();

// Make useAuth
export const useAuth = () => useContext(AuthContext);

// Provider

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start - SOLO localStorage
    const initializeAuth = () => {
      setLoading(true);
      try {
        console.log('🔄 Inicializando autenticación desde localStorage...');
        
        const storedUser = localStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken');
        
        console.log('🔍 Estado localStorage:', { 
          hasUser: !!storedUser, 
          hasToken: !!storedToken,
          userLength: storedUser?.length,
          tokenLength: storedToken?.length
        });
        
        if (storedUser && storedToken) {
          try {
            const user = JSON.parse(storedUser);
            console.log('👤 Usuario parseado:', user);
            
            // Verificar que el usuario tenga los campos mínimos necesarios
            if (user && user.email && (user.id || user.userId)) {
              setCurrentUser(user);
              console.log('✅ Usuario restaurado exitosamente:', user.email);
            } else {
              console.warn('⚠️ Usuario incompleto en localStorage:', user);
              setCurrentUser(null);
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');
            }
          } catch (parseError) {
            console.error('❌ Error parseando usuario:', parseError);
            setCurrentUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
          }
        } else {
          console.log('❌ No hay datos de sesión en localStorage');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('❌ Error inicializando auth:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
        console.log('✅ Inicialización de auth completada');
      }
    };

    // Ejecutar sincrónicamente - no async
    initializeAuth();
  }, []);


  // User login using email password
  const login = async (email, password) => {
    try {
      console.log('🔄 Iniciando login...');
      const { data, error } = await api.login(email, password);

      if (error) {
        console.error('❌ Error en login:', error);
        throw error;
      }

      console.log('✅ Login exitoso, datos recibidos:', data);
      
      // Asegurar que el usuario se guarde en el estado
      setCurrentUser(data.user);
      
      // Verificar que se guardó en localStorage
      const savedUser = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('authToken');
      
      console.log('🔍 Verificación post-login:', {
        userInState: !!data.user,
        userInLocalStorage: !!savedUser,
        tokenInLocalStorage: !!savedToken
      });
      
      return { user: data.user };
    } catch (error) {
      console.error('❌ Error durante login:', error);
      throw error;
    }
  };

  // User logout
  const logout = async () => {
    try {
      console.log('🔄 Cerrando sesión...');
      // Limpiar estado local primero
      setCurrentUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      
      // Intentar notificar al servidor (opcional)
      try {
        await api.logout();
      } catch (logoutError) {
        console.warn('⚠️ Error notificando logout al servidor:', logoutError);
        // No es crítico si falla
      }
      
      console.log('✅ Sesión cerrada correctamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      // Asegurar limpieza incluso si hay error
      setCurrentUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      throw error;
    }
  };


  // forget Password
  const forgetPassword = async (email) => {
    const { error } = await api.resetPassword(email);
    if (error) throw error;
    return { success: true };
  };


  // Context values
  const value = {
    currentUser,
    logout,
    login,
    forgetPassword,
    loading,
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
