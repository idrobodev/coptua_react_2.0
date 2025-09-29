import { useState, useEffect } from 'react';

/**
 * Custom hook para manejar el estado del sidebar a través de toda la aplicación
 * Permite abrir/cerrar y colapsar/expandir el sidebar, guardando el estado en localStorage
 */
const useSidebar = () => {
  // Estado para controlar si el sidebar está abierto en móvil
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const v = localStorage.getItem('sidebarOpen');
      return v ? JSON.parse(v) : false;
    } catch (_) {
      return false;
    }
  });

  // Estado para controlar si el sidebar está colapsado en desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem('sidebarCollapsed');
      return v ? JSON.parse(v) : false;
    } catch (_) {
      return false;
    }
  });

  // Detectar cambios de tamaño de pantalla para ajustar el sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // En desktop, cerramos el sidebar móvil
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Función para alternar el estado de apertura del sidebar en móvil
   */
  const toggleSidebarOpen = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    try { 
      localStorage.setItem('sidebarOpen', JSON.stringify(next)); 
    } catch (_) {}
  };

  /**
   * Función para alternar el estado de colapso del sidebar en desktop
   */
  const toggleSidebarCollapsed = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { 
      localStorage.setItem('sidebarCollapsed', JSON.stringify(next)); 
    } catch (_) {}
  };

  return { 
    sidebarOpen, 
    sidebarCollapsed, 
    toggleSidebarOpen, 
    toggleSidebarCollapsed 
  };
};

export default useSidebar;