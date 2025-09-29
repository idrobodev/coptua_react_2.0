import React, { useState, useEffect, useRef, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSidebarContext } from "../../contexts/SidebarContext";
import logo from "../../assets/images/logo.png";

/**
 * DashboardHeader - Componente reutilizable para el header del dashboard
 * Incluye menú de usuario, logo y título dinámico
 */
const DashboardHeader = ({ title = "Dashboard", subtitle = "Bienvenido", extraActions = null }) => {
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  const { sidebarCollapsed } = useSidebarContext();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await logout();
      setUserMenuOpen(false);
      history.push('/');
    } catch (e) {
      console.error('Error al cerrar sesión', e);
    }
  }, [history, logout]);

  const handleCopyEmail = async () => {
    try {
      if (currentUser?.email) {
        await navigator.clipboard.writeText(currentUser.email);
        setUserMenuOpen(false);
      }
    } catch (e) {
      console.error('No se pudo copiar el correo', e);
    }
  };

  const marginClass = sidebarCollapsed ? 'md:ml-20' : 'md:ml-64';

  return (
    <header className={`fixed top-0 right-0 left-0 z-40 bg-white bg-opacity-90 backdrop-blur-lg shadow-md border-b border-gray-200`}>
      <div className={`px-6 py-3 transition-all duration-300 ${marginClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo y Título */}
            <div className="flex items-center space-x-3">
              <img 
                src={logo}
                alt="Todo por un Alma" 
                className="h-10 w-10 rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-Lato font-bold text-gray-800">
                  {title}
                </h1>
                <p className="text-sm font-Poppins text-gray-600">{subtitle}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Acciones extra */}
            {extraActions && extraActions}
            
            {/* Perfil de Usuario */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center space-x-3 bg-gray-100 rounded-full pl-2 pr-3 py-1.5 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-haspopup="true"
              >
                <div className="relative">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Usuario"
                      className="w-8 h-8 rounded-full border-2 border-primary"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm font-Poppins font-medium text-gray-700 hidden md:block">
                  {currentUser?.displayName || currentUser?.email}
                </span>
                <i className={`fas fa-chevron-${userMenuOpen ? 'up' : 'down'} text-gray-500 text-xs hidden md:block`}></i>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 font-Poppins">Sesión iniciada como</p>
                    <p className="text-sm text-gray-800 truncate font-Poppins font-medium">{currentUser?.email}</p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <button onClick={handleCopyEmail} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-Poppins">
                        <i className="fas fa-copy mr-2 text-gray-500"></i>
                        Copiar correo
                      </button>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-Poppins">
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;