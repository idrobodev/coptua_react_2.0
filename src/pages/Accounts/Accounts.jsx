import React, { useState } from "react";
import { FaUniversity, FaMobileAlt, FaCopy, FaCheck, FaUser, FaTags } from "react-icons/fa";
import Breadcrumbs from "../../components/features/dashboard/Breadcrumbs";
import SEO from "../../components/features/landing/SEO";

const Accounts = () => {
  const [copied, setCopied] = useState("");

  const sections = [
    {
      title: "Servicios",
      description: "Cuentas habilitadas para pagos de servicios específicos.",
      items: [
        {
          area: "Laboratorios",
          bank: "Nequi",
          type: "Cuenta Nequi",
          number: "3205524365",
          holder: "Julieth Zapata",
          icon: <FaMobileAlt className="text-primary" />,
        },
        {
          area: "Psiquiatría",
          bank: "Bancolombia",
          type: "Cuenta",
          number: "015305441",
          holder: undefined,
          icon: <FaUniversity className="text-primary" />,
        },
        {
          area: "Médico General",
          bank: "Bancolombia",
          type: "Cuenta",
          number: "2556069581",
          holder: "Luisa Fernanda Osorio",
          icon: <FaUniversity className="text-primary" />,
        },
        {
          area: "Plásticos",
          bank: "Bancolombia",
          type: "Cuenta de Ahorros",
          number: "6300002014",
          holder: undefined,
          icon: <FaUniversity className="text-primary" />,
        },
      ],
    },
    {
      title: "Institucional",
      description: "Cuenta corporativa para la gestión general de la entidad.",
      items: [
        {
          area: "COPTUA",
          bank: "Bancolombia",
          type: "Cuenta Corriente",
          number: "49900003104",
          holder: "COPTUA",
          icon: <FaUniversity className="text-primary" />,
        },
      ],
    },
    {
      title: "Ingresos por destino",
      description: "Cuentas específicas para la categorización de ingresos por destino.",
      items: [
        {
          area: "Bonos para Hombres de Apartadó",
          bank: "Bancolombia",
          type: "Cuenta de Ahorros",
          number: "311529813",
          holder: undefined,
          icon: <FaTags className="text-primary" />,
        },
        {
          area: "Ingresos para Mujeres",
          bank: "Bancolombia",
          type: "Cuenta",
          number: "91218411431",
          holder: undefined,
          icon: <FaTags className="text-primary" />,
        },
        {
          area: "Ingresos para Hombres de Bello",
          bank: "Bancolombia",
          type: "Cuenta de Ahorros",
          number: "31100080446",
          holder: undefined,
          icon: <FaTags className="text-primary" />,
        },
      ],
    },
  ];

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1800);
    } catch (e) {
      console.error("No se pudo copiar al portapapeles", e);
    }
  };

  const pageTitle = "Cuentas";
  const pageDescription =
    "Consulta las cuentas oficiales de la Corporación Todo por un Alma para pagos y consignaciones por área y destino.";

  return (
    <>
      <SEO title={pageTitle} description={pageDescription} />
      <Breadcrumbs title={pageTitle} />

      <div className="container py-10">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-3">Cuentas oficiales</h2>
          <p className="text-gray-600">
            La Corporación Todo por un Alma maneja sus finanzas a través de varias cuentas específicas
            para cada servicio y destino. Aquí encuentras la información actualizada para realizar tus pagos de forma segura.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-secondary">{section.title}</h3>
                <p className="text-gray-500">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.items.map((acc) => (
                  <div
                    key={`${section.title}-${acc.area}-${acc.number}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 flex items-center justify-center bg-primary/10 rounded-lg">
                        {acc.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-800">{acc.area}</h4>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {acc.bank}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-base font-sans font-medium text-gray-900">
                            {acc.number}
                          </span>
                          <button
                            onClick={() => copyToClipboard(acc.number)}
                            className="ml-2 inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 transition"
                            aria-label={`Copiar número ${acc.number}`}
                          >
                            {copied === acc.number ? (
                              <>
                                <FaCheck /> Copiado
                              </>
                            ) : (
                              <>
                                <FaCopy /> Copiar
                              </>
                            )}
                          </button>
                        </div>

                        {acc.holder && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                            <FaUser className="text-gray-400" />
                            <span>Titular: {acc.holder}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-10 text-gray-500 text-sm">
          <p>
            Si necesitas soporte con un pago, escríbenos desde la página de contacto indicando el servicio y la cuenta utilizada.
          </p>
        </div>
      </div>
    </>
  );
};

export default Accounts;