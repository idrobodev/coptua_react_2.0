import React from "react";
import { Link } from "react-router-dom";
import bannerVideo from "../../../assets/images/banner.webm";

const Banner = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 md:py-36 px-4 overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        style={{
          objectPosition: 'center',
          minHeight: '100%',
          minWidth: '100%',
          width: 'auto',
          height: 'auto',
        }}
      >
        <source src={bannerVideo} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/30 z-1"></div>
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 text-center md:text-left">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Transformando vidas desde el amor y la evidencia científica
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto md:mx-0">
            Centro de desintoxicación que combina enfoques psicológicos validados con guía espiritual 
            basada en la Palabra de Dios para el tratamiento integral de adicciones.
          </p>
          <div className="mt-8">
            <Link
              to="/contact"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              CONTÁCTANOS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
