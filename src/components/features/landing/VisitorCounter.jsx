import React from 'react';
import useVisitorCounter from '../../../hooks/useVisitorCounter';

const VisitorCounter = () => {
  const { formattedCount, isLoading, isAnimating } = useVisitorCounter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 text-white text-opacity-80">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span className="text-sm font-Poppins">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white border-opacity-20">
      <div className="flex items-center justify-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <svg 
              className="w-5 h-5 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isAnimating && (
              <div className="absolute inset-0 animate-ping">
                <svg 
                  className="w-5 h-5 text-green-300" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-white">
            <div className="text-xs font-Poppins text-white text-opacity-80 uppercase tracking-wide">
              Visitantes
            </div>
            <div className={`text-lg font-bold font-Lato transition-all duration-500 ${
              isAnimating ? 'scale-110 text-green-300' : 'text-white'
            }`}>
              {formattedCount}
            </div>
          </div>
        </div>
        
        <div className="h-8 w-px bg-white bg-opacity-30"></div>
        
        <div className="text-center">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-Poppins text-white text-opacity-80">
              En línea
            </span>
          </div>
          <div className="text-sm font-Lato text-white font-semibold">
            {Math.floor(Math.random() * 15) + 5}
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <div className="text-xs font-Poppins text-white text-opacity-60">
          🌟 Transformando vidas desde 2020
        </div>
      </div>
    </div>
  );
};

export default VisitorCounter;
