import React, { useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useAuth } from "shared/contexts";
import logo from "../../assets/images/logo.png";

const Sidebar = ({ isOpen = false, onToggle = () => {}, isCollapsed = false, onToggleCollapse = () => {} }) => {
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  
  // Get user role from currentUser
  const userRole = currentUser?.rol || currentUser?.role || 'CONSULTA';

  // Check for mobile screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      history.push("/");
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


  const allMenuItems = [
    {
      id: 'dashboard',
      icon: 'fas fa-home',
      label: 'Dashboard',
      link: '/dashboard',
      badge: null,
      roles: ['ADMINISTRADOR', 'CONSULTA'] // Available to all roles
    },
    {
      id: 'participantes',
      icon: 'fas fa-users',
      label: 'Participantes',
      link: '/participantes',
      badge: null,
      roles: ['ADMINISTRADOR', 'CONSULTA']
    },
    {
      id: 'acudientes',
      icon: 'fas fa-user-friends',
      label: 'Acudientes',
      link: '/acudientes',
      badge: null,
      roles: ['ADMINISTRADOR', 'CONSULTA']
    },
    {
      id: 'financiero',
      icon: 'fas fa-dollar-sign',
      label: 'Mensualidades',
      link: '/financiero',
      badge: null,
      roles: ['ADMINISTRADOR', 'CONSULTA']
    },
    {
      id: 'usuarios',
      icon: 'fas fa-users-cog',
      label: 'Usuarios',
      link: '/usuarios',
      badge: null,
      roles: ['ADMINISTRADOR'], // Only administrators
      adminOnly: true
    },
    {
      id: 'formatos',
      icon: 'fas fa-file-alt',
      label: 'Formatos',
      link: '/formatos',
      badge: null,
      roles: ['ADMINISTRADOR', 'CONSULTA']
    },
    {
      id: 'sedes',
      icon: 'fas fa-building',
      label: 'Sedes',
      link: '/sedes',
      badge: null,
      roles: ['ADMINISTRADOR', 'CONSULTA']
    },
    {
      id: 'configuracion',
      icon: 'fas fa-cog',
      label: 'Configuración',
      link: '/configuracion',
      badge: null,
      roles: ['ADMINISTRADOR', 'CONSULTA']
    }
  ];
  
  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Toggle Button - Mobile */}
      {isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 md:hidden bg-primary text-white p-2 rounded-lg shadow-lg hover:bg-primary-dark transition-colors"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      )}
      
      
      {/* Sidebar */}
      <aside 
        data-testid="sidebar"
        className={`
          fixed top-0 left-0 h-full text-gray-700 z-50
          transform transition-all duration-300 ease-in-out shadow-2xl
          ${isCollapsed && !isMobile ? 'w-20 translate-x-0' : isOpen || !isMobile ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
          ${isMobile ? 'md:relative md:z-auto' : ''}
          ${isCollapsed && !isMobile ? 'hover:w-64' : ''}  /* expand on hover */
        `}
        style={{
          background: isCollapsed && !isMobile 
            ? 'linear-gradient(135deg, rgba(240, 242, 245, 0.95) 0%, rgba(230, 232, 235, 0.85) 100%)' // Darker gradient for collapsed
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header with Logo */}
        <div className={`${isCollapsed && !isMobile ? 'p-4' : 'p-6'} border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-300 relative`}>
          {/* Collapse/Expand toggle desktop */}
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <i className={`fas ${isCollapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'} text-sm text-gray-600`}></i>
            </button>
          )}
          <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`}>
            <div className="relative">
              <img 
                src={logo} 
                alt="Corporación Logo" 
                className={`${isCollapsed && !isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl object-cover bg-white p-2 flex-shrink-0 shadow-md transition-all duration-300`}
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className={`${isCollapsed && !isMobile ? 'hidden' : 'block'} transition-all duration-300`}>
              <h2 className="text-lg font-Lato font-bold text-gray-800">Corporación</h2>
              <p className="text-xs font-Poppins text-gray-600">Todo por un Alma</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.link}
                  className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl hover:bg-gray-100 hover:shadow-sm transition-all duration-200 group relative overflow-hidden ${location.pathname.startsWith(item.link) ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : ''}`}
                  title={isCollapsed && !isMobile ? item.label : ''}
                  onClick={isMobile ? onToggle : undefined}
                  aria-current={location.pathname.startsWith(item.link) ? 'page' : undefined}
                  {...(isCollapsed && !isMobile && { 'data-tooltip-target': `tooltip-${item.id}`, 'data-tooltip-placement': 'right' })}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-25/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <i className={`${item.icon} text-lg ${location.pathname.startsWith(item.link) ? 'text-blue-700' : 'text-gray-600 group-hover:text-blue-600'} group-hover:scale-110 transition-all flex-shrink-0 relative z-10 ${isCollapsed && !isMobile ? 'group-hover:rotate-12' : ''}`}></i>
                  <span className={`font-Poppins font-medium ${location.pathname.startsWith(item.link) ? 'text-blue-800' : 'text-gray-700 group-hover:text-gray-900'} ${isCollapsed && !isMobile ? 'absolute left-full whitespace-nowrap ml-3 px-2 py-1 bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 shadow-lg' : 'block'} transition-all duration-300 z-10`}>{item.label}</span>
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
                {isCollapsed && !isMobile && (
                  <div id={`tooltip-${item.id}`} role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                      {item.label}
                      <div className="tooltip-arrow" data-popper-arrow></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Información del Usuario */}
        <div className="p-4 border-t border-gray-200 mt-auto bg-gradient-to-r from-gray-50 to-gray-100">
          <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'} mb-3`}>
            <div className="relative flex-shrink-0">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Usuario"
                  className={`rounded-full border-2 border-gray-300 shadow-md ${isCollapsed && !isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}
                />
              ) : (
                <div className={`rounded-full border-2 border-gray-300 shadow-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ${isCollapsed && !isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}>
                  <i className="fas fa-user text-blue-600 text-base"></i>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            {!isCollapsed && !isMobile && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-Poppins font-semibold text-gray-800 truncate">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-Poppins text-gray-600">
                    {userRole === 'ADMINISTRADOR' ? 'Administrador' : 'Consulta'}
                  </p>
                  {userRole === 'CONSULTA' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded" title="Solo lectura">
                      <i className="fas fa-eye text-[10px]"></i>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : ''} w-full px-4 py-2 text-sm text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-200 font-Poppins font-medium group relative overflow-hidden`}
            title={isCollapsed && !isMobile ? 'Cerrar Sesión' : ''}
            {...(isCollapsed && !isMobile && { 'data-tooltip-target': 'tooltip-logout', 'data-tooltip-placement': 'right' })}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-red-25/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <i className={`fas fa-sign-out-alt ${isCollapsed && !isMobile ? '' : 'mr-3'} group-hover:scale-110 transition-transform relative z-10`}></i>
            <span className="relative z-10">{!isCollapsed && !isMobile && 'Cerrar Sesión'}</span>
          </button>
          {isCollapsed && !isMobile && (
            <div id="tooltip-logout" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                Cerrar Sesión
                <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
