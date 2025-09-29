import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/logo.png";

const Menu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { currentUser, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      history.push("/");
      setToggle(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const triggerToggle = () => {
    setToggle(!toggle);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setToggle(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg backdrop-blur-md bg-opacity-95' : 'bg-white bg-opacity-90 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <div className="relative">
              <img 
                src={logo} 
                alt="Corporación Todo por un Alma" 
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-Lato font-bold text-gray-800 leading-tight">
                Corporación
                <span className="block text-lg font-Poppins font-medium text-primary">
                  Todo por un Alma
                </span>
              </h1>
            </div>
            <div className="md:hidden">
              <h1 className="text-lg font-Lato font-bold text-gray-800">
                Todo por un Alma
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 ml-auto mr-8">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-Poppins font-medium text-sm transition-all duration-200 ${
                isActiveLink('/') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg font-Poppins font-medium text-sm transition-all duration-200 ${
                isActiveLink('/about') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
              }`}
            >
              Nosotros
            </Link>
            <Link
              to="/programs"
              className={`px-4 py-2 rounded-lg font-Poppins font-medium text-sm transition-all duration-200 ${
                isActiveLink('/programs') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
              }`}
            >
              Programas
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-2 rounded-lg font-Poppins font-medium text-sm transition-all duration-200 ${
                isActiveLink('/contact') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
              }`}
            >
              Contacto
            </Link>
          </div>

          {/* User Profile Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {currentUser?.email && (
              <div className="relative">
                <button
                  onClick={triggerToggle}
                  className="flex items-center space-x-3 p-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-white p-0.5">
                    {currentUser?.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        className="w-full h-full rounded-full object-cover"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                        <i className="fas fa-user text-gray-600 text-sm"></i>
                      </div>
                    )}
                  </div>
                  <span className="font-Poppins font-medium text-sm max-w-32 truncate">
                    {currentUser?.displayName || currentUser?.email}
                  </span>
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${toggle ? 'rotate-180' : ''}`}></i>
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200 ${
                  toggle ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}>
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-150"
                  >
                    <i className="fas fa-tachometer-alt w-5 text-primary"></i>
                    <span className="ml-3 font-Poppins font-medium">Panel de Control</span>
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                  >
                    <i className="fas fa-sign-out-alt w-5 text-red-500"></i>
                    <span className="ml-3 font-Poppins font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="py-4 space-y-2 border-t border-gray-100">
            <Link
              to="/"
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-Poppins font-medium transition-all duration-200 ${
                isActiveLink('/') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-Poppins font-medium transition-all duration-200 ${
                isActiveLink('/about') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Nosotros
            </Link>
            <Link
              to="/programs"
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-Poppins font-medium transition-all duration-200 ${
                isActiveLink('/programs') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Programas
            </Link>
            <Link
              to="/contact"
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-Poppins font-medium transition-all duration-200 ${
                isActiveLink('/contact') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Contacto
            </Link>
            
            {currentUser?.email && (
              <div className="pt-4 space-y-2 border-t border-gray-100">
                <div className="flex items-center px-4 py-2 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary p-0.5 mr-3">
                    {currentUser?.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        className="w-full h-full rounded-full object-cover"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <i className="fas fa-user text-gray-600 text-sm"></i>
                      </div>
                    )}
                  </div>
                  <span className="font-Poppins font-medium text-sm truncate">
                    {currentUser?.displayName || currentUser?.email}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <i className="fas fa-tachometer-alt w-5 text-primary mr-3"></i>
                  <span className="font-Poppins font-medium">Panel de Control</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <i className="fas fa-sign-out-alt w-5 mr-3"></i>
                  <span className="font-Poppins font-medium">Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
