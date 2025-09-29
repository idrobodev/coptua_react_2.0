import React, { createContext, useContext } from 'react';
import useSidebar from '../hooks/useSidebar';

/**
 * SidebarContext - Proporciona estado global del sidebar a través de la aplicación
 */
const SidebarContext = createContext();

/**
 * Proveedor del contexto del sidebar
 */
export const SidebarProvider = ({ children }) => {
  const sidebarState = useSidebar();

  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto del sidebar
 */
export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext debe usarse dentro de un SidebarProvider');
  }
  return context;
};

export default SidebarContext;