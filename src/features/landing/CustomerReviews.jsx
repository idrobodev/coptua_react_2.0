import React from "react";
import Review from "./Review";
import { GradientText } from "components/ui";

const reviews = [
  {
    key: "testimonial1",
    name: "María González",
    title: "Testimonio de Transformación",
    videoId: "kKsQRkOyKCI"
  },
  {
    key: "testimonial2",
    name: "Carlos Rodríguez",
    title: "Historia de Superación",
    videoId: "EsCm0WnK-CE"
  },
  {
    key: "testimonial3",
    name: "Ana Martínez",
    title: "Experiencia de Cambio",
    videoId: "AjohVQntKuY"
  }
];

const CustomerReviews = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-primary/5">
      <div className="container px-4">
        <div className="text-center max-w-4xl mx-auto mb-14 md:mb-16">
          <p className="text-primary font-semibold text-lg mb-2 tracking-wide">TESTIMONIOS</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <GradientText>Historias de Transformación</GradientText>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
            Conoce las experiencias reales de quienes han encontrado esperanza y transformación 
            a través de nuestro acompañamiento. Sus historias son testimonio del poder del amor y la fe.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 xl:gap-12 justify-items-center max-w-7xl mx-auto">
          {reviews.map((review) => (
            <div key={review.key} className="w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-xs xl:max-w-sm">
              <Review review={review} />
            </div>
          ))}
        </div>
        
        <div className="mt-14 md:mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 px-6 py-3 rounded-full ring-1 ring-primary/20">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-primary font-medium">Transformando vidas con amor y esperanza</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
