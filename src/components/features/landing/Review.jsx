import React from "react";

const Review = ({ review }) => {
  const { name, title, videoId } = review;

  return (
    <div className="relative group w-full mx-auto">
      <div className="relative w-full rounded-3xl overflow-hidden bg-black/90 shadow-2xl hover:shadow-[0_20px_40px_rgba(67,65,148,0.35)] transition-all duration-500 transform hover:scale-[1.02] ring-1 ring-white/10">
        {/* Aspect ratio 9:16 usando padding-top (compatibilidad Tailwind v2) */}
        <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&showinfo=0&controls=1&fs=1&cc_load_policy=0&iv_load_policy=3`}
            title={`Testimonio de ${name}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />

          {/* Texto sobre el video */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-7 md:p-8 bg-black/60">
            <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-2xl mb-1.5 sm:mb-2">{name}</h3>
            <p className="text-white/95 text-white sm:text-lg drop-shadow-lg font-medium">{title}</p>
          </div>

          {/* Badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/15 backdrop-blur-[2px] px-2.5 py-1 rounded-full ring-1 ring-white/20">
            <span className="text-white text-xs sm:text-sm font-medium">Video</span>
          </div>

          {/* Play visual (decorativo, no bloquea clics) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-300">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M6.5 5.5l8 4.5-8 4.5v-9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
