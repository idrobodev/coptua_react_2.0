import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../services/api";

// Split contexts for better performance
const AuthStateContext = createContext();
const AuthActionsContext = createContext();

// Hooks to access state and actions separately
export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
};

// Backward compatibility hook
export const useAuth = () => {
  const state = useAuthState();
  const actions = useAuthActions();
  return { ...state, ...actions };
};

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


  // Memoized login function to prevent recreation on every render
  const login = useCallback(async (email, password) => {
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
  }, []);

  // Memoized logout function to prevent recreation on every render
  const logout = useCallback(async () => {
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
  }, []);

  // Memoized forgetPassword function to prevent recreation on every render
  const forgetPassword = useCallback(async (email) => {
    const { error } = await api.resetPassword(email);
    if (error) throw error;
    return { success: true };
  }, []);


  // Memoize state values to prevent unnecessary re-renders
  const stateValue = useMemo(() => ({
    currentUser,
    loading,
  }), [currentUser, loading]);

  // Memoize action values to prevent unnecessary re-renders
  const actionsValue = useMemo(() => ({
    login,
    logout,
    forgetPassword,
  }), []);

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

export default AuthProvider;
