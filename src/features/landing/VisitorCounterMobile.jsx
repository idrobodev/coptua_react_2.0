import React from 'react';
import { useVisitorCounter } from 'shared/hooks';

const VisitorCounterMobile = () => {
  const { formattedCount, isLoading, isAnimating } = useVisitorCounter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 text-white text-opacity-80 py-2">
        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
        <span className="text-xs font-Poppins">Cargando visitantes...</span>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white border-opacity-20 w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <svg 
              className="w-4 h-4 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            {isAnimating && (
              <div className="absolute inset-0 animate-ping">
                <svg 
                  className="w-4 h-4 text-green-300" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-Poppins text-white text-opacity-70 uppercase">
              Visitantes
            </div>
            <div className={`text-sm font-bold font-Lato transition-all duration-500 ${
              isAnimating ? 'scale-110 text-green-300' : 'text-white'
            }`}>
              {formattedCount}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-Poppins text-white text-opacity-70">
              En línea
            </span>
          </div>
          <div className="text-sm font-Lato text-white font-semibold">
            {Math.floor(Math.random() * 12) + 3}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorCounterMobile;
