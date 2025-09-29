import React, { useState } from "react";
import { FaMobileAlt, FaUniversity, FaCopy, FaCheck, FaQrcode, FaShieldAlt } from "react-icons/fa";
import Breadcrumbs from "../../components/features/dashboard/Breadcrumbs";
import SEO from "../../components/features/landing/SEO";

const Donate = () => {
  // TODO: Reemplazar por los datos reales de donación
  const NEQUI_NUMBER = "3XX XXX XXXX"; // Número de Nequi
  const BANCO_ACCOUNT = {
    bank: "Bancolombia",
    type: "Cuenta de ahorros",
    number: "XXXX-XXXX-XXXX-XX",
    holder: "Corporación Todo por un Alma",
  };

  const [copied, setCopied] = useState("");

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    } catch (e) {
      console.error("Error al copiar:", e);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Donaciones",
    description:
      "Apoya a la Corporación Todo por un Alma a través de donaciones por Nequi o cuenta Bancolombia.",
    potentialAction: {
      "@type": "DonateAction",
      target: "https://todoporunalma.org/donate",
    },
  };

  return (
    <div>
      <SEO
        title="Donaciones - Todo por un Alma | Apóyanos"
        description="Haz tu donación por Nequi o Bancolombia y ayúdanos a transformar vidas."
        keywords="donaciones, nequi, bancolombia, fundación, ayuda, aporte"
        url="/donate"
        type="website"
        structuredData={structuredData}
      />

      <Breadcrumbs title="Donaciones" />

      {/* Intro Section */}
      <section className="bg-gradient-to-b from-primary/5 to-white">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-Lato font-bold text-gray-900">
              Tu ayuda transforma vidas
            </h2>
            <p className="mt-4 text-gray-600 font-Poppins">
              Gracias a tu aporte hacemos posible la rehabilitación integral de hombres y mujeres
              en Bello y Apartadó. Puedes donar fácilmente mediante Nequi o consignación en
              Bancolombia.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500">
              <FaShieldAlt className="text-primary" />
              <span>Transacciones seguras y transparentes</span>
            </div>
          </div>

          {/* Donation Methods */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Nequi Card */}
            <div className="group relative overflow-hidden rounded-3xl shadow-xl border border-gray-100 bg-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <FaMobileAlt size={22} />
                  </div>
                  <h3 className="text-2xl font-Lato font-bold text-gray-900">Donación por Nequi</h3>
                </div>

                <p className="mt-3 text-gray-600">
                  Realiza una transferencia directa desde tu app de Nequi al siguiente número:
                </p>

                <div className="mt-5 flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Número Nequi</p>
                    <p className="text-xl font-Lato font-bold tracking-wider text-gray-900">
                      {NEQUI_NUMBER}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(NEQUI_NUMBER, "nequi")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition"
                  >
                    {copied === "nequi" ? (
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

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-center">
                    <FaQrcode className="mx-auto text-gray-400" size={36} />
                    <p className="text-sm text-gray-500 mt-2">
                      ¿Tienes QR? Podemos añadirlo aquí.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
                    <p className="text-sm text-gray-700">
                      Si deseas confirmar tu donación o recibir certificado, escríbenos a
                      <span className="font-medium"> info@todoporunalma.org</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bancolombia Card */}
            <div className="group relative overflow-hidden rounded-3xl shadow-xl border border-gray-100 bg-white">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
                    <FaUniversity size={22} />
                  </div>
                  <h3 className="text-2xl font-Lato font-bold text-gray-900">Cuenta Bancolombia</h3>
                </div>

                <p className="mt-3 text-gray-600">
                  Puedes consignar o transferir a nuestra cuenta bancaria:
                </p>

                <div className="mt-5 space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Banco</span>
                    <span className="font-medium text-gray-900">{BANCO_ACCOUNT.bank}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Tipo de cuenta</span>
                    <span className="font-medium text-gray-900">{BANCO_ACCOUNT.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Número</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-Lato text-gray-900 tracking-wider">
                        {BANCO_ACCOUNT.number}
                      </span>
                      <button
                        onClick={() => handleCopy(BANCO_ACCOUNT.number, "banco")}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition text-sm"
                      >
                        {copied === "banco" ? (
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
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Titular</span>
                    <span className="font-medium text-gray-900">{BANCO_ACCOUNT.holder}</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  Nota: Si necesitas soporte para realizar tu donación, contáctanos y te guiaremos en el proceso.
                </p>
              </div>
            </div>
          </div>

          {/* Thanks */}
          <div className="max-w-3xl mx-auto text-center mt-16">
            <h4 className="text-xl font-Lato font-bold text-gray-900">¡Gracias por tu generosidad!</h4>
            <p className="text-gray-600 mt-2">
              Cada aporte nos permite continuar con nuestra misión de rehabilitación integral
              desde el amor, la fe y la evidencia científica.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;