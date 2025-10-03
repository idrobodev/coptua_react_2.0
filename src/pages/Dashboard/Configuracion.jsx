import React, { useState } from "react";
import { useAuth } from "shared/contexts";
import { api } from "shared/services";
import DashboardLayout from "components/layout/DashboardLayout";
import { Button, FormInput, FormGroup } from "components/ui";

const Configuracion = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const tabs = [
    { id: "perfil", label: "Perfil", icon: "fas fa-user" },
    { id: "preferencias", label: "Preferencias", icon: "fas fa-sliders-h" },
    { id: "notificaciones", label: "Notificaciones", icon: "fas fa-bell" },
    { id: "seguridad", label: "Seguridad", icon: "fas fa-shield-alt" },
  ];

  const handleProfileUpdate = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const nombreInput = document.getElementById('nombre');
      const nombre = nombreInput?.value.trim();
      if (nombre && nombre !== currentUser.nombre) {
        // Update user profile via API
        const { error } = await api.updateProfile({ nombre });
        if (error) throw new Error(error.message);

        setSuccess('Perfil actualizado correctamente');
      } else {
        setSuccess('No hay cambios para guardar');
      }
    } catch (err) {
      setError('Error al actualizar el perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Configuración" subtitle="Administra tu perfil y preferencias de la plataforma">
      <section className="px-4 md:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-200 shadow-sm p-2 flex overflow-auto gap-2">
            {tabs.map((t) => (
              <Button
                key={t.id}
                variant={activeTab === t.id ? "primary" : "ghost"}
                size="sm"
                icon={t.icon}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {activeTab === "perfil" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Datos de perfil</h2>
                  <FormGroup columns={2} gap="md">
                    <FormInput
                      label="Nombre"
                      name="nombre"
                      value={currentUser?.user_metadata?.full_name || currentUser?.nombre || ''}
                      onChange={() => {}}
                    />
                    <FormInput
                      label="Correo"
                      name="email"
                      type="email"
                      value={currentUser?.email || ''}
                      onChange={() => {}}
                      disabled
                    />
                    <FormInput
                      label="Rol"
                      name="rol"
                      value={currentUser?.rol || ''}
                      onChange={() => {}}
                      disabled
                    />
                    <FormInput
                      label="Sede"
                      name="sede"
                      value={currentUser?.sede_nombre || 'No asignada'}
                      onChange={() => {}}
                      disabled
                      className="md:col-span-2"
                    />
                  </FormGroup>
                  <div className="mt-4 flex items-center gap-4">
                    <Button
                      variant="primary"
                      icon="fas fa-save"
                      onClick={handleProfileUpdate}
                      loading={loading}
                    >
                      Guardar cambios
                    </Button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                  </div>
                </div>
              )}

              {activeTab === "preferencias" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Preferencias</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="form-checkbox" />
                      Modo compacto de tablas
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="form-checkbox" />
                      Mostrar ayudas contextuales
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "notificaciones" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span>Recordatorios de mensualidades</span>
                      <input type="checkbox" className="form-switch" />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "seguridad" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Seguridad</h2>
                  <FormGroup columns={2} gap="md">
                    <FormInput
                      label="Contraseña actual"
                      name="currentPassword"
                      type="password"
                      value=""
                      onChange={() => {}}
                      className="md:col-span-2"
                    />
                    <FormInput
                      label="Nueva contraseña"
                      name="newPassword"
                      type="password"
                      value=""
                      onChange={() => {}}
                    />
                    <FormInput
                      label="Confirmar nueva contraseña"
                      name="confirmPassword"
                      type="password"
                      value=""
                      onChange={() => {}}
                    />
                  </FormGroup>
                  <div className="mt-4">
                    <Button variant="primary" icon="fas fa-lock">
                      Actualizar contraseña
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Consejos de seguridad</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Usa contraseñas fuertes y únicas.</li>
                  <li>Activa la verificación en dos pasos si está disponible.</li>
                  <li>Revisa periódicamente tus dispositivos activos.</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  ¿Necesitas ayuda? Contacta al equipo de soporte para asistencia personalizada.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Configuracion;