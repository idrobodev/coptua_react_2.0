import React from "react";
import { SidebarProvider, useSidebarContext } from "../../contexts/SidebarContext";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import LoadingSpinner from "../UI/LoadingSpinner";

/**
 * DashboardLayout - Componente de layout reutilizable para todas las páginas del dashboard
 * Incluye Sidebar con contexto global, header dinámico y main con márgenes responsivos
 */
const DashboardLayoutContent = ({ title = "Dashboard", subtitle = "", children, loading = false, loadingText = "Cargando...", extraActions = null }) => {
  const { sidebarOpen, sidebarCollapsed, toggleSidebarOpen, toggleSidebarCollapsed } = useSidebarContext();
  
  const marginClass = sidebarCollapsed ? 'md:ml-20' : 'md:ml-64';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebarOpen} isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapsed} />
          <main className={`flex-1 transition-all duration-300 ${marginClass} pt-20`}>
            <div className="flex items-center justify-center h-screen">
              <LoadingSpinner size="xl" text={loadingText} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebarOpen} isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${marginClass} pt-20`}>
          <DashboardHeader title={title} subtitle={subtitle} extraActions={extraActions} />
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * Proveedor y layout combinados
 */
const DashboardLayout = (props) => (
  <SidebarProvider>
    <DashboardLayoutContent {...props} />
  </SidebarProvider>
);

export default DashboardLayout;