import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "components/layout/DashboardLayout";
import { dbService } from "shared/services";
import { FilterBar } from "components/UI/Filter";
import { StatsGrid } from "components/UI/Card";
import { StatusToggle } from "components/UI/Badge";
import { ActionDropdown } from "components/UI/Table";
import { ViewDetailsModal, EditFormModal, CreateFormModal } from "components/common/CRUDModals";
import { useFilters, useModal } from "shared/hooks";

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

const SedesComponent = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use custom hooks
  const { filters: filtros, setFilter, clearFilters } = useFilters({
    estado: "Todos",
    busqueda: ""
  });
  
  const verModal = useModal();
  const editarModal = useModal();
  const crearModal = useModal();

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

  const statsData = useMemo(() => [
    {
      title: "Total Sedes",
      value: filteredSedes.length,
      icon: "fas fa-building",
      color: "blue"
    },
    {
      title: "Activas",
      value: filteredSedes.filter(s => s.estado === "Activa").length,
      icon: "fas fa-check-circle",
      color: "green"
    },
    {
      title: "Inactivas",
      value: filteredSedes.filter(s => s.estado === "Inactiva").length,
      icon: "fas fa-times-circle",
      color: "red"
    }
  ], [filteredSedes]);

  const toggleEstado = async (id, newEstado) => {
    try {
      await dbService.updateSede(id, { estado: newEstado });
      const { data } = await dbService.getSedes();
      setSedes(data || []);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteSede = async (id) => {
    try {
      setLoading(true);
      
      // Verificar si la sede tiene participantes asociados
      const participantesResult = await dbService.getParticipantes();
      if (participantesResult.error) {
        throw new Error('Error al verificar participantes asociados');
      }
      
      const participantesEnSede = (participantesResult.data || []).filter(
        p => p.id_sede === id || p.sede_id === id || p.sedeId === id
      );
      
      if (participantesEnSede.length > 0) {
        alert(`No se puede eliminar la sede porque tiene ${participantesEnSede.length} participante(s) asociado(s). Por favor, reasigna o elimina los participantes primero.`);
        setLoading(false);
        return;
      }
      
      // Si no hay participantes, proceder con la eliminación
      const result = await dbService.deleteSede(id);
      if (result.error) {
        throw new Error(result.error.message || 'Error al eliminar sede');
      }
      
      // Recargar la lista de sedes
      await loadSedes();
      alert('Sede eliminada exitosamente');
    } catch (err) {
      console.error('Error eliminando sede:', err);
      alert(err.message || 'Error al eliminar sede');
      setLoading(false);
    }
  };

  const filterConfig = [
    {
      type: 'select',
      name: 'estado',
      label: 'Estado',
      options: [
        { value: 'Todos', label: 'Todos los Estados' },
        { value: 'Activa', label: 'Activa' },
        { value: 'Inactiva', label: 'Inactiva' }
      ]
    },
    {
      type: 'search',
      name: 'busqueda',
      label: 'Búsqueda',
      placeholder: 'Nombre, dirección...'
    }
  ];

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
        onClick={() => crearModal.openModal()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i className="fas fa-plus mr-2"></i>
        Nueva Sede
      </button>
    }>
      {/* Filtros */}
      <FilterBar
        filters={filterConfig}
        values={filtros}
        onChange={setFilter}
        onClear={clearFilters}
        showClearButton={true}
      />

      {/* Estadísticas Rápidas */}
      <div className="px-6 py-4">
        <StatsGrid stats={statsData} columns={3} />
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
                onClick={() => {
                  verModal.setData(sede);
                  verModal.openModal();
                }}
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
                    <div onClick={(e) => e.stopPropagation()}>
                      <StatusToggle
                        currentStatus={sede.estado}
                        statuses={[
                          { value: 'Activa', label: 'Activa', variant: 'success' },
                          { value: 'Inactiva', label: 'Inactiva', variant: 'danger' }
                        ]}
                        onChange={(newEstado) => toggleEstado(sede.id, newEstado)}
                      />
                    </div>
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

                    {sede.capacidad_maxima && (
                      <div className="flex items-center">
                        <i className="fas fa-users text-gray-400 mr-3 flex-shrink-0"></i>
                        <p className="text-sm text-gray-600">Capacidad: {sede.capacidad_maxima} participantes</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        verModal.setData(sede);
                        verModal.openModal();
                      }}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-eye mr-2"></i>
                      Ver detalles
                    </button>

                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown
                        actions={[
                          {
                            label: 'Ver detalles',
                            icon: 'fas fa-eye',
                            onClick: () => {
                              verModal.setData(sede);
                              verModal.openModal();
                            }
                          },
                          {
                            label: 'Editar',
                            icon: 'fas fa-edit',
                            onClick: () => {
                              editarModal.setData(sede);
                              editarModal.openModal();
                            }
                          },
                          {
                            label: 'Eliminar',
                            icon: 'fas fa-trash',
                            onClick: async () => {
                              if (window.confirm('¿Estás seguro de que deseas eliminar esta sede?')) {
                                await handleDeleteSede(sede.id);
                              }
                            },
                            variant: 'danger'
                          }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <ViewDetailsModal
        isOpen={verModal.isOpen}
        onClose={verModal.closeModal}
        title="Detalles de la Sede"
        data={verModal.data ? [
          { label: 'Nombre', value: verModal.data.nombre },
          { label: 'Dirección', value: verModal.data.direccion, fullWidth: true },
          { label: 'Teléfono', value: verModal.data.telefono },
          { label: 'Capacidad Máxima', value: verModal.data.capacidad_maxima ? `${verModal.data.capacidad_maxima} participantes` : 'No especificada' },
          { label: 'Estado', value: verModal.data.estado },
          { label: 'Tipo', value: verModal.data.tipo || 'No especificado' }
        ] : []}
      />

      <EditFormModal
        isOpen={editarModal.isOpen}
        onClose={editarModal.closeModal}
        title="Editar Sede"
        onSubmit={async (formData) => {
          // Validar capacidad_maxima si está presente
          if (formData.capacidad_maxima !== undefined && formData.capacidad_maxima !== null && formData.capacidad_maxima !== '') {
            const capacidad = Number(formData.capacidad_maxima);
            if (isNaN(capacidad) || capacidad <= 0) {
              throw new Error('La capacidad máxima debe ser un número positivo');
            }
          }
          
          const result = await dbService.updateSede(editarModal.data.id, formData);
          if (result.error) {
            throw new Error(result.error.message || 'Error al actualizar sede');
          }
          await loadSedes();
        }}
        initialData={editarModal.data}
        fields={[
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'telefono', label: 'Teléfono', type: 'tel' },
          { name: 'direccion', label: 'Dirección', type: 'textarea', required: true, fullWidth: true },
          { name: 'capacidad_maxima', label: 'Capacidad Máxima', type: 'number', placeholder: 'Número de participantes', min: 1 },
          { 
            name: 'estado', 
            label: 'Estado', 
            type: 'select',
            options: [
              { value: 'Activa', label: 'Activa' },
              { value: 'Inactiva', label: 'Inactiva' }
            ]
          },
          { 
            name: 'tipo', 
            label: 'Tipo', 
            type: 'select',
            options: [
              { value: 'Principal', label: 'Principal' },
              { value: 'Secundaria', label: 'Secundaria' },
              { value: 'Temporal', label: 'Temporal' }
            ]
          }
        ]}
      />

      <CreateFormModal
        isOpen={crearModal.isOpen}
        onClose={crearModal.closeModal}
        title="Nueva Sede"
        onSubmit={async (formData) => {
          if (!formData.nombre?.trim() || !formData.direccion?.trim()) {
            throw new Error('Nombre y dirección son campos obligatorios');
          }
          
          // Validar capacidad_maxima si está presente
          if (formData.capacidad_maxima !== undefined && formData.capacidad_maxima !== null && formData.capacidad_maxima !== '') {
            const capacidad = Number(formData.capacidad_maxima);
            if (isNaN(capacidad) || capacidad <= 0) {
              throw new Error('La capacidad máxima debe ser un número positivo');
            }
          }
          
          const result = await dbService.createSede(formData);
          if (result.error) {
            throw new Error(result.error.message || 'Error al crear sede');
          }
          await loadSedes();
        }}
        initialData={{
          nombre: '',
          direccion: '',
          telefono: '',
          capacidad_maxima: '',
          estado: 'Activa',
          tipo: 'Principal'
        }}
        fields={[
          { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre de la sede' },
          { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: 'Número de teléfono' },
          { name: 'direccion', label: 'Dirección', type: 'textarea', required: true, placeholder: 'Dirección completa de la sede', fullWidth: true },
          { name: 'capacidad_maxima', label: 'Capacidad Máxima', type: 'number', placeholder: 'Número de participantes', min: 1 },
          { 
            name: 'estado', 
            label: 'Estado', 
            type: 'select',
            options: [
              { value: 'Activa', label: 'Activa' },
              { value: 'Inactiva', label: 'Inactiva' }
            ]
          },
          { 
            name: 'tipo', 
            label: 'Tipo', 
            type: 'select',
            options: [
              { value: 'Principal', label: 'Principal' },
              { value: 'Secundaria', label: 'Secundaria' },
              { value: 'Temporal', label: 'Temporal' }
            ]
          }
        ]}
      />
    </DashboardLayout>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
// Component will only re-render when props change
const Sedes = React.memo(SedesComponent);

export default Sedes;