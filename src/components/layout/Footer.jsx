import React from "react";
import { Link } from "react-router-dom";
import logo from "assets/images/logo.png";

const Footer = () => {
  return (
    <div 
      className="relative py-16 text-white"
      style={{
        background: 'linear-gradient(to right, #21188e, #5b2076, #ea3238)'
      }}
    >
      
      <div className="container relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 z-10">
        <div className="">
          <div className="flex items-center mb-4">
            <img 
              src={logo} 
              alt="Corporación Todo por un Alma" 
              className="h-16 w-16 object-contain mr-4 bg-white rounded-lg p-2 shadow-md"
              style={{ filter: 'brightness(1) contrast(1.1)', opacity: 1 }}
            />
            <div>
              <span className="text-2xl font-Lato font-bold border-l-4 px-2 border-white">
                Corporación Todo por un Alma
              </span>
            </div>
          </div>
          <p className="text-justify py-4 font-Poppins">
            Centro de desintoxicación que combina enfoques psicológicos validados 
            con guía espiritual basada en la Palabra de Dios para el tratamiento 
            integral de adicciones. Transformando vidas desde el amor y la evidencia científica.
          </p>
          <div className="text-white text-2xl flex">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.facebook.com/"
            >
              <i className="fab fa-facebook-square ml-2 hover:text-blue-400 transition"></i>
            </a>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.instagram.com/"
            >
              <i className="fab fa-instagram-square ml-2 hover:text-pink-400 transition"></i>
            </a>
            <a rel="noreferrer" target="_blank" href="https://twitter.com/">
              <i className="fab fa-twitter-square ml-2 hover:text-blue-300 transition"></i>
            </a>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.linkedin.com/"
            >
              <i className="fab fa-linkedin ml-2 hover:text-blue-500 transition"></i>
            </a>
          </div>
        </div>
        
        <div className="">
          <h1 className="text-2xl font-Lato font-bold uppercase border-white border-l-4 px-2">
            Enlaces Rápidos
          </h1>
          <ul className="py-4 font-Poppins">
            <li className="py-1 hover:text-blue-200 transition">
              <Link to="/">Inicio</Link>
            </li>
            <li className="py-1 hover:text-blue-200 transition">
              <Link to="/about">Nosotros</Link>
            </li>
            <li className="py-1 hover:text-blue-200 transition">
              <Link to="/programs">Programas</Link>
            </li>
            <li className="py-1 hover:text-blue-200 transition">
              <Link to="/contact">Contacto</Link>
            </li>
            <li className="py-1 hover:text-blue-200 transition">
              <Link to="/donate">Donaciones</Link>
            </li>
          </ul>
        </div>
        
        <div className="">
          <h1 className="text-2xl uppercase font-Lato font-bold border-white border-l-4 px-2">
            Información de Contacto
          </h1>

          <div className="py-4 font-Poppins">
            <p className="flex items-center">
              <i className="fas fa-phone-alt mr-3"></i> 
              <span>Teléfono Principal: 3104577835</span>
            </p>
            <p className="py-2 flex items-center">
              <i className="far fa-envelope mr-3"></i> 
              <span>info@todoporalma.org</span>
            </p>
            <p className="flex items-center">
              <i className="fas fa-map-marker-alt mr-3"></i> 
              <span>Antioquia (Bello y Apartadó)</span>
            </p>
            <p className="pt-4 text-sm">
              <i className="fas fa-users mr-2"></i>
              Atención para hombres y mujeres por separado
            </p>
          </div>
        </div>

        <div className="">
          <h1 className="text-2xl font-Lato font-bold border-l-4 px-2 border-white">
            Cómo Ayudar
          </h1>
          <p className="py-4 font-Poppins">
            Su apoyo hace posible nuestra labor de transformar vidas. 
            Únase a nuestra misión.
          </p>
          <div className="space-y-3">
            <div className="flex items-center">
              <i className="fas fa-hand-holding-heart mr-2"></i>
              <Link to="/donate" className="hover:text-blue-200 transition">Donaciones en especie y efectivo</Link>
            </div>
            <div className="flex items-center">
              <i className="fas fa-hands-helping mr-2"></i>
              <span>Voluntariado profesional</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-handshake mr-2"></i>
              <span>Alianzas estratégicas</span>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
};

export default Footer;