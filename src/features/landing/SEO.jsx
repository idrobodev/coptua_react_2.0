import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Todo por un Alma - Centro de Rehabilitación y Desintoxicación",
  description = "Centro especializado en tratamiento de adicciones que combina terapia psicológica profesional con guía espiritual basada en la Palabra de Dios. Transformamos vidas en Bello y Apartadó, Colombia.",
  keywords = "rehabilitación, desintoxicación, adicciones, centro de rehabilitación, terapia cognitivo conductual, logoterapia, Bello, Apartadó, Colombia, tratamiento adicciones, recuperación, transformación de vidas",
  image = "/logo512.png",
  url = "",
  type = "website",
  author = "Corporación Todo por un Alma",
  structuredData = null
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://todoporunalma.org";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Corporación Todo por un Alma",
    "description": "Centro especializado en tratamiento de adicciones que combina terapia psicológica profesional con guía espiritual basada en la Palabra de Dios.",
    "url": siteUrl,
    "logo": `${siteUrl}/logo512.png`,
    "image": fullImageUrl,
    "telephone": ["+57-314-570-2708", "+57-321-648-1687", "+57-310-457-7835"],
    "address": [
      {
        "@type": "PostalAddress",
        "addressLocality": "Bello",
        "addressRegion": "Antioquia",
        "addressCountry": "Colombia"
      },
      {
        "@type": "PostalAddress",
        "addressLocality": "Apartadó",
        "addressRegion": "Antioquia", 
        "addressCountry": "Colombia"
      }
    ],
    "serviceType": [
      "Tratamiento de Adicciones",
      "Terapia Cognitivo-Conductual",
      "Logoterapia",
      "Rehabilitación Integral",
      "Guía Espiritual"
    ],
    "foundingDate": "2020",
    "sameAs": [
      "https://www.facebook.com/todoporunalma",
      "https://www.instagram.com/todoporunalma"
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Todo por un Alma" />
      <meta property="og:locale" content="es_CO" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@todoporunalma" />
      
      {/* Additional SEO Tags */}
      <meta name="geo.region" content="CO-ANT" />
      <meta name="geo.placename" content="Bello, Apartadó" />
      <meta name="geo.position" content="6.3373;-75.5553" />
      <meta name="ICBM" content="6.3373, -75.5553" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
