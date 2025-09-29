import React, { useEffect, useState } from "react";
import heroImage from "../../../assets/images/happyCl.jpg";

const Breadcrumbs = ({ title }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Sección principal con imagen de fondo y efecto parallax */}
      <div className="relative">
        <div
          className="bg-cover bg-no-repeat bg-center h-80 md:h-96 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          {/* Overlay con gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
          
          {/* Contenido centrado */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white font-Lato mb-4 drop-shadow-2xl">
                {title}
              </h1>
              <div className="w-24 h-1 bg-white/80 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Partículas decorativas */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Transición curva integrada en la imagen */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              className="w-full h-16 md:h-20"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                  <stop offset="30%" style={{ stopColor: 'rgba(255,255,255,0.3)', stopOpacity: 1 }} />
                  <stop offset="70%" style={{ stopColor: 'rgba(255,255,255,0.8)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M0,0 C150,120 350,120 600,60 C850,0 1050,0 1200,60 L1200,120 L0,120 Z"
                fill="url(#curveGradient)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;
