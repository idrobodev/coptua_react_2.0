import React, { useEffect, useRef, useState } from "react";
import impactoImage from "../../../assets/images/impacto.png";

const CounterAnimation = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const targetNumber = parseInt(target);
      const duration = 2000;
      const increment = targetNumber / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
          setCount(targetNumber);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isVisible, target]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
};

const HappyCustomers = () => {
  return (
    <>
      <div
        className="bg-cover bg-no-repeat bg-center bg-fixed w-full relative"
        style={{
          backgroundImage: `url(${impactoImage})`,
        }}
      >
        {/* Overlay con gradiente del footer y opacidad negra para contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#21188e]/70 via-[#5b2076]/70 to-[#ea3238]/70"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="container relative py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl py-6 font-Lato font-bold text-white drop-shadow-2xl tracking-tight">
              Nuestro <span className="text-white font-extrabold">Impacto</span> 2025
            </h1>
            <p className="text-xl md:text-2xl text-white mb-16 font-Poppins font-light max-w-3xl mx-auto leading-relaxed">
              Transformando vidas desde el amor y la evidencia científica
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
              <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-2xl">
                <div className="relative">
                  <h1 className="text-5xl md:text-6xl font-Lato font-black text-white mb-3 drop-shadow-xl tracking-tight">
                    <CounterAnimation target="300" suffix="+" />
                  </h1>
                  <div className="w-16 h-1 bg-white/80 mx-auto mb-4 rounded-full"></div>
                  <p className="text-white text-lg md:text-xl font-Poppins font-medium leading-snug">
                    Personas Atendidas
                  </p>
                </div>
              </div>

              <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-2xl">
                <div className="relative">
                  <h1 className="text-5xl md:text-6xl font-Lato font-black text-white mb-3 drop-shadow-xl tracking-tight">
                    <CounterAnimation target="200" suffix="+" />
                  </h1>
                  <div className="w-16 h-1 bg-white/80 mx-auto mb-4 rounded-full"></div>
                  <p className="text-white text-lg md:text-xl font-Poppins font-medium leading-snug">
                    Familias Acompañadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HappyCustomers;
