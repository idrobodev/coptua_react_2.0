import React from "react";
import Banner from "../../components/features/landing/Banner";
import CustomerReviews from "../../components/features/landing/CustomerReviews";
import Feature from "../../components/features/landing/Feature";
import HappyCustomers from "./../../components/features/landing/HappyCustomers";
import TransformationStories from "../../components/features/landing/TransformationStories";
import SEO from "../../components/features/landing/SEO";

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
