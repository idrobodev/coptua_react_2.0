import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dbService } from "../../services/database";

// Simple Map Component
const MapPlaceholder = ({ address, className = "" }) => {
  return (
    <div className={`bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-green-500 opacity-10"></div>
      <div className="text-center">
        <i className="fas fa-map-marked-alt text-green-600 text-3xl mb-2"></i>
        <p className="text-xs text-gray-600 font-medium">Mapa de Ubicación</p>
        <p className="text-xs text-gray-500 mt-1 px-2">{address?.substring(0, 30)}...</p>
      </div>
      <div className="absolute top-2 right-2">
        <i className="fas fa-external-link-alt text-gray-400 text-xs"></i>
      </div>
    </div>
  );
};

const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: "Todos",
    busqueda: ""
  });

  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(null);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  // Función para cargar sedes
  const loadSedes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando sedes...');

      const result = await dbService.getSedes();
      console.log('📊 Resultado sedes:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Error al cargar sedes');
      }

      const sedesData = Array.isArray(result.data) ? result.data : [];
      setSedes(sedesData);
      console.log('✅ Sedes cargadas:', sedesData.length);
    } catch (err) {
      console.error('❌ Error cargando sedes:', err);
      setError(err.message || 'Error desconocido al cargar sedes');
      setSedes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSedes();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDropdownAbierto(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funciones para manejar modales
  const abrirModal = (tipo, sede) => {
    setSedeSeleccionada(sede);
    setModalAbierto(tipo);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
    setSedeSeleccionada(null);
  };

  const filteredSedes = useMemo(() => {
    const safeSedes = Array.isArray(sedes) ? sedes : [];
    let filtered = safeSedes;

    if (filtros.estado !== "Todos") {
      filtered = filtered.filter(s => s.estado === filtros.estado);
    }
    if (filtros.busqueda) {
      filtered = filtered.filter(s =>
        (s.nombre || '').toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        (s.direccion || '').toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }
    return filtered;
  }, [sedes, filtros]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Activa": return "bg-green-100 text-green-800";
      case "Inactiva": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const toggleEstado = async (id, newEstado) => {
    try {
      await dbService.updateSede(id, { estado: newEstado });
      const { data } = await dbService.getSedes();
      setSedes(data || []);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleActionClick = (action, sede) => {
    switch (action) {
      case 'ver':
        abrirModal('ver', sede);
        break;
      case 'editar':
        abrirModal('editar', sede);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Sedes" subtitle="Gestión de sedes" loading={true} loadingText="Cargando sedes..." />
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Sedes" subtitle="Error al cargar datos" loading={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading sedes: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestión de Sedes" subtitle="Administra las sedes de la fundación" extraActions={
      <button
        onClick={() => abrirModal('crear', null)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i className="fas fa-plus mr-2"></i>
        Nueva Sede
      </button>
    }>
      {/* Filtros */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
            <input
              type="text"
              placeholder="Nombre, dirección..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                // Filters are applied automatically via useMemo
                console.log('Filtros aplicados:', filtros);
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-search mr-2"></i>
              Aplicar Filtros
            </button>
            <button
              onClick={() => setFiltros({ estado: "Todos", busqueda: "" })}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              title="Limpiar filtros"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sedes</p>
                <p className="text-2xl font-bold text-blue-600">{filteredSedes.length}</p>
              </div>
              <i className="fas fa-building text-blue-600 text-2xl"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredSedes.filter(s => s.estado === "Activa").length}
                </p>
              </div>
              <i className="fas fa-check-circle text-green-600 text-2xl"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredSedes.filter(s => s.estado === "Inactiva").length}
                </p>
              </div>
              <i className="fas fa-times-circle text-red-600 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Sedes */}
      <div className="px-6 py-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Lista de Sedes</h3>
          <p className="text-sm text-gray-600 mt-1">Haz clic en una sede para ver más detalles</p>
        </div>

        {filteredSedes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-building text-gray-300 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron sedes</h3>
            <p className="text-gray-500">No hay sedes que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSedes.map((sede) => (
              <div
                key={sede.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => abrirModal('ver', sede)}
              >
                {/* Map */}
                <MapPlaceholder
                  address={sede.direccion}
                  className="h-32 rounded-t-xl"
                />

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-building text-blue-600 text-lg"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {sede.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">{sede.tipo || 'Principal'}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEstado(sede.id, sede.estado === 'Activa' ? 'Inactiva' : 'Activa');
                      }}
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${getEstadoColor(sede.estado)} hover:opacity-80`}
                      aria-label={`Cambiar estado de ${sede.nombre}`}
                      title={`Cambiar estado a ${sede.estado === 'Activa' ? 'Inactiva' : 'Activa'}`}
                    >
                      {sede.estado}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt text-gray-400 mt-1 mr-3 flex-shrink-0"></i>
                      <p className="text-sm text-gray-600 line-clamp-2">{sede.direccion}</p>
                    </div>

                    {sede.telefono && (
                      <div className="flex items-center">
                        <i className="fas fa-phone text-gray-400 mr-3 flex-shrink-0"></i>
                        <p className="text-sm text-gray-600">{sede.telefono}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirModal('ver', sede);
                      }}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-eye mr-2"></i>
                      Ver detalles
                    </button>

                    <div className="relative dropdown-container">
                      <button
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownAbierto(dropdownAbierto === sede.id ? null : sede.id);
                        }}
                        aria-label="Opciones de la sede"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      <div className={`absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 ${dropdownAbierto === sede.id ? 'block' : 'hidden'}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick('ver', sede);
                            setDropdownAbierto(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <i className="fas fa-eye mr-2"></i>Ver detalles
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick('editar', sede);
                            setDropdownAbierto(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <i className="fas fa-edit mr-2"></i>Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {modalAbierto === 'ver' && (
              <ModalVerSede
                sede={sedeSeleccionada}
                onCerrar={cerrarModal}
              />
            )}
            {modalAbierto === 'editar' && (
              <ModalEditarSede
                sede={sedeSeleccionada}
                onCerrar={cerrarModal}
                onActualizar={loadSedes}
              />
            )}
            {modalAbierto === 'crear' && (
              <ModalCrearSede
                onCerrar={cerrarModal}
                onCrear={loadSedes}
              />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// Componentes de modales
const ModalVerSede = ({ sede, onCerrar }) => {
  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Detalles de la Sede</h3>
        <button
          onClick={onCerrar}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <p className="text-lg font-semibold text-gray-800">{sede.nombre}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
              <p className="text-gray-800">{sede.direccion}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
              <p className="text-gray-800">{sede.telefono}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                sede.estado === 'Activa' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {sede.estado}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <p className="text-gray-800">{sede.tipo || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end p-6 border-t border-gray-200 space-x-3">
        <button
          onClick={onCerrar}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </>
  );
};

const ModalEditarSede = ({ sede, onCerrar, onActualizar }) => {
  const [formData, setFormData] = useState({
    nombre: sede.nombre,
    direccion: sede.direccion,
    telefono: sede.telefono,
    estado: sede.estado,
    tipo: sede.tipo || 'Principal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Actualizando sede:', formData);

      const result = await dbService.updateSede(sede.id, formData);

      if (result.error) {
        throw new Error(result.error.message || 'Error al actualizar sede');
      }

      console.log('✅ Sede actualizada exitosamente');
      onActualizar();
      onCerrar();
    } catch (err) {
      console.error('❌ Error actualizando sede:', err);
      setError(err.message || 'Error desconocido al actualizar sede');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Editar Sede</h3>
        <button
          onClick={onCerrar}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
            <textarea
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Principal">Principal</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Temporal">Temporal</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onCerrar}
            disabled={loading}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

const ModalCrearSede = ({ onCerrar, onCrear }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    estado: 'Activa',
    tipo: 'Principal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Creando sede:', formData);

      if (!formData.nombre.trim() || !formData.direccion.trim()) {
        throw new Error('Nombre y dirección son campos obligatorios');
      }

      const result = await dbService.createSede(formData);

      if (result.error) {
        throw new Error(result.error.message || 'Error al crear sede');
      }

      console.log('✅ Sede creada exitosamente');
      onCrear();
      onCerrar();
    } catch (err) {
      console.error('❌ Error creando sede:', err);
      setError(err.message || 'Error desconocido al crear sede');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Nueva Sede</h3>
        <button
          onClick={onCerrar}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de la sede"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Número de teléfono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
            <textarea
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dirección completa de la sede"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Principal">Principal</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Temporal">Temporal</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onCerrar}
            disabled={loading}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creando...
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i>
                Crear Sede
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default Sedes;