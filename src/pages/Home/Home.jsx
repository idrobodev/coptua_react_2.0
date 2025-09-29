import React from "react";
import Banner from "features/landing/Banner";
import CustomerReviews from "features/landing/CustomerReviews";
import Feature from "features/landing/Feature";
import HappyCustomers from "features/landing/HappyCustomers";
import TransformationStories from "features/landing/TransformationStories";
import SEO from "features/landing/SEO";

const Home = () => {
  return (
    <>
      <SEO 
        title="Todo por un Alma - Centro de Rehabilitación y Desintoxicación en Colombia"
        description="Centro especializado en tratamiento de adicciones que combina terapia psicológica profesional con guía espiritual basada en la Palabra de Dios. Transformamos vidas en Bello y Apartadó, Colombia."
        keywords="rehabilitación, desintoxicación, adicciones, centro de rehabilitación, terapia cognitivo conductual, logoterapia, Bello, Apartadó, Colombia, tratamiento adicciones, recuperación, transformación de vidas, centro cristiano"
        url="/"
        type="website"
      />
      <div>
        <Banner />
        <TransformationStories />
        <HappyCustomers />
        <CustomerReviews />
        <Feature />
      </div>
    </>
  );
};

export default Home;
