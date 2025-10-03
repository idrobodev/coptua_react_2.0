import React, { useState, useEffect } from 'react';
import { GradientText } from 'components/ui';

// Import images
import happyImg from 'assets/images/happyCl.jpg';
import bookingImg from 'assets/images/booking.jpg';
import review1 from 'assets/images/review/1.jpg';
import review2 from 'assets/images/review/2.jpg';
import review3 from 'assets/images/review/3.jpg';

const TransformationStories = () => {
  // Estado de carrusel y visibilidad
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);

  const stories = [
    {
      id: 1,
      image: happyImg,
      title: 'Renovación de Esperanza',
      description:
        'Cada día es una nueva oportunidad para transformar vidas y renovar la esperanza en quienes más lo necesitan.',
      highlight: 'Esperanza',
    },
    {
      id: 2,
      image: bookingImg,
      title: 'Camino hacia la Sanidad',
      description:
        'Acompañamos a cada persona en su proceso único de recuperación, brindando apoyo integral y personalizado.',
      highlight: 'Sanidad',
    },
    {
      id: 3,
      image: review1,
      title: 'Fortaleza Interior',
      description:
        'Desarrollamos la fortaleza interior necesaria para superar cualquier adversidad y construir un futuro sólido.',
      highlight: 'Fortaleza',
    },
    {
      id: 4,
      image: review2,
      title: 'Comunidad de Apoyo',
      description:
        'Creamos una comunidad donde cada persona se siente valorada, comprendida y apoyada en su proceso.',
      highlight: 'Comunidad',
    },
    {
      id: 5,
      image: review3,
      title: 'Nueva Vida',
      description:
        'Celebramos cada logro, cada paso adelante, cada momento de crecimiento en el camino hacia una nueva vida.',
      highlight: 'Vida Nueva',
    },
  ];

  // Cálculo responsivo de ítems visibles (alineado con breakpoints Tailwind)
  useEffect(() => {
    const computeItems = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 0;
      if (w >= 1024) return 4; // lg
      if (w >= 768) return 3; // md
      if (w >= 640) return 2; // sm
      return 1; // xs
    };

    const update = () => {
      const next = computeItems();
      setItemsPerView(prev => {
        if (prev !== next) {
          // Asegurar que el índice actual no quede fuera de rango al cambiar el layout
          setCurrentSlide((prevSlide) => {
            const maxIndex = Math.max(0, stories.length - next);
            return Math.min(prevSlide, maxIndex);
          });
        }
        return next;
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [stories.length]);

  // Auto-advance por intervalo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxIndex = Math.max(0, stories.length - itemsPerView);
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [stories.length, itemsPerView]);

  // Intersection Observer para animación de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('transformation-stories');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxIndex = Math.max(0, stories.length - itemsPerView);
      if (prev >= maxIndex) return 0;
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxIndex = Math.max(0, stories.length - itemsPerView);
      if (prev <= 0) return maxIndex;
      return prev - 1;
    });
  };

  const pageCount = Math.max(1, Math.ceil(stories.length / itemsPerView));
  const activePage = Math.floor(currentSlide / itemsPerView);

  const goToPage = (pageIdx) => {
    const target = pageIdx * itemsPerView;
    setCurrentSlide(Math.min(target, Math.max(0, stories.length - itemsPerView)));
  };

  // Helper: padding-top en % según relación de aspecto deseada
  // Todas las imágenes usan formato 4:5
  const aspectRatio = '4:5';
  const ratioToPadding = (ratio) => {
    const [w, h] = ratio.split(':').map(Number);
    if (!w || !h) return '125%'; // fallback 4:5
    return `${(h / w) * 100}%`;
  };

  // Transform del track basado en el slide actual
  const trackTranslatePercent = currentSlide * (100 / itemsPerView);

  return (
    <section
      id="transformation-stories"
      className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary/5 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-primary font-semibold text-lg mb-4 tracking-wide">
            HISTORIAS DE TRANSFORMACIÓN
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <GradientText>Vidas que Inspiran</GradientText>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cada historia es única, cada transformación es un milagro. Descubre cómo acompañamos a las personas en su camino hacia una nueva vida.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary  to-secondary mx-auto rounded-full mt-8"></div>
        </div>

        {/* Carrusel (4 visibles en desktop) */}
        <div
          className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="relative rounded-3xl overflow-visible">
            {/* Viewport */}
            <div className="overflow-hidden">
              {/* Track */}
              <div
                className="flex -mx-2 transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${trackTranslatePercent}%)` }}
              >
                {stories.map((story, index) => {
                  return (
                    <div
                      key={story.id}
                      className="flex-none px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                      aria-hidden={false}
                    >
                      <div className="group relative rounded-2xl overflow-hidden bg-white/30 backdrop-blur-sm ring-1 ring-black/5 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                        {/* Aspect Ratio Wrapper */}
                        <div
                          className="relative w-full"
                          style={{ paddingTop: ratioToPadding(aspectRatio) }}
                        >
                          <img
                            src={story.image}
                            alt={story.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* Overlay para legibilidad */}
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-black/50 pointer-events-none"></div>

                          {/* Etiqueta highlight */}
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/80 text-white shadow-md">
                              {story.highlight}
                            </span>
                          </div>

                          {/* Overlay de texto al hover */}
                          <div className="absolute inset-0 flex items-end p-4">
                            <div className="text-white drop-shadow-sm">
                              <h3 className="text-lg md:text-xl font-bold leading-tight">
                                {story.title}
                              </h3>
                              <p className="mt-1 text-sm text-white/90 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                {story.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flechas de navegación */}
            <button
              onClick={prevSlide}
              aria-label="Anterior"
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 hover:bg-gray-100 p-2.5 rounded-full shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              aria-label="Siguiente"
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 hover:bg-gray-100 p-2.5 rounded-full shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicadores por página */}
            <div className="mt-6 flex items-center justify-center space-x-2">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  aria-label={`Ir a la página ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === activePage
                      ? 'w-6 bg-primary'
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TransformationStories;
