import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "components/layout/DashboardLayout";
import { dbService } from "shared/services";
import { FilterBar, StatsGrid, DataTable, ActionDropdown, StatusToggle, FormInput, FormSelect, FormGroup } from "components/UI";
import { ViewDetailsModal, EditFormModal, CreateFormModal } from "components/common";
import { useFilters, useModal } from "shared/hooks";
// import jsPDF from 'jspdf'; // Temporarily disabled - not available in Docker dev

const Participantes = React.memo(() => {
  const [participantes, setParticipantes] = useState([]); // Asegurar que siempre sea array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the useFilters hook for filter state management
  const { filters: filtros, setFilter, clearFilters } = useFilters({
    sede: "Todas",
    genero: "Todos",
    estado: "Todos",
    busqueda: ""
  });

  // Use the useModal hook for modal state management
  const viewModal = useModal();
  const editModal = useModal();
  const createModal = useModal();

  // Función para cargar participantes (usando useCallback para evitar re-renders)
  const loadParticipantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando participantes...');
      
      const result = await dbService.getParticipantes();
      console.log('📊 Resultado participantes:', result);
      
      if (result.error) {
        throw new Error(result.error.message || 'Error al cargar participantes');
      }
      
      const participantesData = Array.isArray(result.data) ? result.data : [];
      setParticipantes(participantesData);
      console.log('✅ Participantes cargados:', participantesData.length);
    } catch (err) {
      console.error('❌ Error cargando participantes:', err);
      setError(err.message || 'Error desconocido al cargar participantes');
      setParticipantes([]); // Asegurar que no quede undefined
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParticipantes();
  }, [loadParticipantes]);

  // Funciones para manejar modales (memoized)
  const abrirModal = useCallback((tipo, participante) => {
    if (tipo === 'ver') {
      viewModal.openModal(null, participante);
    } else if (tipo === 'editar') {
      editModal.openModal(null, participante);
    } else if (tipo === 'crear') {
      createModal.openModal();
    }
  }, [viewModal, editModal, createModal]);

  const filteredParticipantes = useMemo(() => {
    // Asegurar que participantes siempre sea un array
    const safeParticipantes = Array.isArray(participantes) ? participantes : [];
    let filtered = safeParticipantes;

    if (filtros.sede !== "Todas") {
      filtered = filtered.filter(p => p.sede && p.sede.toLowerCase().includes(filtros.sede.toLowerCase()));
    }
    if (filtros.genero !== "Todos") {
      filtered = filtered.filter(p => p.genero === filtros.genero);
    }
    if (filtros.estado !== "Todos") {
      filtered = filtered.filter(p => p.estado === filtros.estado);
    }
    if (filtros.busqueda) {
      filtered = filtered.filter(p =>
        (p.nombre || '').toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        (p.telefono || '').includes(filtros.busqueda)
      );
    }
    return filtered;
  }, [participantes, filtros]);

  const toggleEstado = useCallback(async (id, newEstado) => {
    try {
      await dbService.updateParticipante(id, { estado: newEstado });
      // Refresh data
      const { data } = await dbService.getParticipantes();
      setParticipantes(data || []);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }, []);

  const handleActionClick = useCallback((action, participante) => {
    switch (action) {
      case 'ver':
        abrirModal('ver', participante);
        break;
      case 'editar':
        abrirModal('editar', participante);
        break;
      default:
        // No action
        break;
    }
  }, [abrirModal]);

  const handleExportPDF = useCallback(() => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('es-ES');

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista de Participantes - ${currentDate}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 24px;
            }
            .filters {
              margin-bottom: 20px;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            .filters h3 {
              margin: 0 0 10px 0;
              color: #495057;
            }
            .filters p {
              margin: 5px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #495057;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .stats {
              margin-top: 30px;
              background: #e3f2fd;
              padding: 15px;
              border-radius: 5px;
            }
            .stats h3 {
              margin: 0 0 10px 0;
              color: #1976d2;
            }
            .stats p {
              margin: 5px 0;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Participantes</h1>
            <p>Corporación Todo por un Alma</p>
            <p>Fecha de generación: ${currentDate}</p>
          </div>

          <div class="filters">
            <h3>Filtros aplicados:</h3>
            <p><strong>Sede:</strong> ${filtros.sede === 'Todas' ? 'Todas las sedes' : filtros.sede}</p>
            <p><strong>Género:</strong> ${filtros.genero === 'Todos' ? 'Todos los géneros' : filtros.genero}</p>
            <p><strong>Estado:</strong> ${filtros.estado === 'Todos' ? 'Todos los estados' : filtros.estado}</p>
            ${filtros.busqueda ? `<p><strong>Búsqueda:</strong> "${filtros.busqueda}"</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Género</th>
                <th>Teléfono</th>
                <th>Sede</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filteredParticipantes.map(participante => `
                <tr>
                  <td>${participante.nombre || 'N/A'}</td>
                  <td>${participante.edad || 'N/A'}</td>
                  <td>${participante.genero || 'N/A'}</td>
                  <td>${participante.telefono || 'N/A'}</td>
                  <td>${participante.sede || 'N/A'}</td>
                  <td>${participante.estado || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="stats">
            <h3>Estadísticas:</h3>
            <p><strong>Total de participantes:</strong> ${filteredParticipantes.length}</p>
            <p><strong>Activos:</strong> ${filteredParticipantes.filter(p => p.estado === 'Activo').length}</p>
            <p><strong>Inactivos:</strong> ${filteredParticipantes.filter(p => p.estado === 'Inactivo').length}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, [filtros, filteredParticipantes]);

  if (loading) {
    return (
      <DashboardLayout title="Participantes" subtitle="Gestión de participantes" loading={true} loadingText="Cargando participantes..." />
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Participantes" subtitle="Error al cargar datos" loading={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading participants: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestión de Participantes" subtitle="Administra los participantes de la fundación" extraActions={
      <div className="flex space-x-3">
        <button
          onClick={() => handleExportPDF()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          title="Exportar lista filtrada a PDF"
        >
          <i className="fas fa-file-pdf mr-2"></i>
          Exportar PDF
        </button>
        <button
          onClick={() => abrirModal('crear', null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Nuevo Participante
        </button>
      </div>
    }>
      {/* Filtros */}
      <FilterBar
        filters={[
          {
            type: 'select',
            name: 'sede',
            label: 'Sede',
            options: [
              { value: 'Todas', label: 'Todas las Sedes' },
              { value: 'Bello Principal', label: 'Bello Principal' },
              { value: 'Bello Campestre', label: 'Bello Campestre' },
              { value: 'Apartadó', label: 'Apartadó' }
            ]
          },
          {
            type: 'select',
            name: 'genero',
            label: 'Género',
            options: [
              { value: 'Todos', label: 'Todos los Géneros' },
              { value: 'MASCULINO', label: 'Masculino' },
              { value: 'FEMENINO', label: 'Femenino' }
            ]
          },
          {
            type: 'select',
            name: 'estado',
            label: 'Estado',
            options: [
              { value: 'Todos', label: 'Todos los Estados' },
              { value: 'Activo', label: 'Activo' },
              { value: 'Inactivo', label: 'Inactivo' }
            ]
          },
          {
            type: 'search',
            name: 'busqueda',
            placeholder: 'Nombre, teléfono...',
            debounceMs: 300
          }
        ]}
        values={filtros}
        onChange={setFilter}
        onClear={clearFilters}
        showClearButton={true}
      />


      {/* Estadísticas Rápidas */}
      <div className="px-6 py-4">
        <StatsGrid
          stats={[
            {
              title: 'Total Participantes',
              value: filteredParticipantes.length,
              icon: 'fas fa-users',
              color: 'blue'
            },
            {
              title: 'Activos',
              value: filteredParticipantes.filter(p => p.estado === "Activo").length,
              icon: 'fas fa-user-check',
              color: 'green'
            },
            {
              title: 'Inactivos',
              value: filteredParticipantes.filter(p => p.estado === "Inactivo").length,
              icon: 'fas fa-user-times',
              color: 'red'
            },
            {
              title: 'Promedio Edad',
              value: filteredParticipantes.length > 0
                ? `${Math.round(filteredParticipantes.reduce((sum, p) => sum + (p.edad || 0), 0) / filteredParticipantes.length)} años`
                : '0 años',
              icon: 'fas fa-birthday-cake',
              color: 'blue'
            },
            {
              title: 'Sedes Bello',
              value: filteredParticipantes.filter(p => p.sede && p.sede.toLowerCase().includes("bello")).length,
              icon: 'fas fa-map-marker-alt',
              color: 'purple'
            }
          ]}
          columns={5}
          gap="md"
        />
      </div>

      {/* Tabla de Participantes */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Participantes</h3>
          </div>
          
          <DataTable
            data={filteredParticipantes}
            keyExtractor={(row) => row.id}
            columns={[
              {
                key: 'participante',
                header: 'Participante',
                render: (row) => (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-blue-600"></i>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {row.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {row.edad} años • {row.telefono}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                key: 'genero',
                header: 'Género',
                render: (row) => (
                  row.genero === 'MASCULINO' ? 'Masculino' : row.genero === 'FEMENINO' ? 'Femenino' : 'N/A'
                )
              },
              {
                key: 'sede',
                header: 'Sede',
                render: (row) => row.sede
              },
              {
                key: 'estado',
                header: 'Estado',
                render: (row) => (
                  <StatusToggle
                    currentStatus={row.estado}
                    statuses={[
                      { value: 'Activo', label: 'Activo', variant: 'success' },
                      { value: 'Inactivo', label: 'Inactivo', variant: 'danger' }
                    ]}
                    onChange={(newEstado) => toggleEstado(row.id, newEstado)}
                  />
                )
              },
              {
                key: 'acciones',
                header: 'Acciones',
                render: (row) => (
                  <ActionDropdown
                    actions={[
                      {
                        label: 'Ver detalles',
                        icon: 'fas fa-eye',
                        onClick: () => handleActionClick('ver', row)
                      },
                      {
                        label: 'Editar',
                        icon: 'fas fa-edit',
                        onClick: () => handleActionClick('editar', row)
                      }
                    ]}
                  />
                )
              }
            ]}
            loading={loading}
          />
        </div>
      </div>

      {/* Modales */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title="Detalles del Participante"
        data={viewModal.modalData ? [
          { label: 'Nombre Completo', value: viewModal.modalData.nombre },
          { label: 'Edad', value: `${viewModal.modalData.edad} años` },
          { label: 'Teléfono', value: viewModal.modalData.telefono },
          { label: 'Sede', value: viewModal.modalData.sede },
          { 
            label: 'Estado', 
            value: (
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                viewModal.modalData.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {viewModal.modalData.estado}
              </span>
            )
          },
          { 
            label: 'Fecha de Ingreso', 
            value: viewModal.modalData.fechaIngreso
              ? new Date(viewModal.modalData.fechaIngreso).toLocaleDateString('es-ES')
              : 'No disponible'
          }
        ] : []}
      />

      <ParticipanteEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        participante={editModal.modalData}
        onActualizar={loadParticipantes}
      />

      <ParticipanteCreateModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onCrear={loadParticipantes}
      />
    </DashboardLayout>
  );
});

// Helper function for sede options by gender
const getSedesPorGenero = (genero) => {
  if (genero === 'MASCULINO') {
    return [
      { value: 'Sede Masculina Bello Principal', label: 'Bello Principal Masculina' },
      { value: 'Sede Masculina Bello Campestre', label: 'Bello Campestre Masculina' },
      { value: 'Sede Masculina Apartadó', label: 'Apartadó Masculina' },
    ];
  } else {
    return [
      { value: 'Sede Femenina Bello Principal', label: 'Bello Principal Femenina' },
      { value: 'Sede Femenina Apartadó', label: 'Apartadó Femenina' },
    ];
  }
};

// Edit Modal Component
const ParticipanteEditModal = ({ isOpen, onClose, participante, onActualizar }) => {
  if (!participante) return null;

  const handleSubmit = async (formData) => {
    console.log('🔄 Actualizando participante:', formData);
    const result = await dbService.updateParticipante(participante.id, formData);
    
    if (result.error) {
      throw new Error(result.error.message || 'Error al actualizar participante');
    }
    
    console.log('✅ Participante actualizado exitosamente');
    onActualizar();
  };

  return (
    <EditFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Participante"
      initialData={{
        nombre: participante.nombre,
        edad: participante.edad,
        telefono: participante.telefono,
        genero: participante.genero || 'MASCULINO',
        sede: participante.sede,
        estado: participante.estado,
      }}
      onSubmit={handleSubmit}
      submitLabel="Guardar Cambios"
    >
      {({ formData, handleChange, errors }) => (
        <ParticipanteForm 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors}
        />
      )}
    </EditFormModal>
  );
};

// Create Modal Component
const ParticipanteCreateModal = ({ isOpen, onClose, onCrear }) => {
  const handleSubmit = async (formData) => {
    console.log('🔄 Creando participante:', formData);
    
    if (!formData.nombre.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!formData.telefono.trim()) {
      throw new Error('El teléfono es requerido');
    }
    
    const result = await dbService.createParticipante(formData);
    
    if (result.error) {
      throw new Error(result.error.message || 'Error al crear participante');
    }
    
    console.log('✅ Participante creado exitosamente');
    onCrear();
  };

  return (
    <CreateFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Participante"
      defaultValues={{
        nombre: '',
        edad: '',
        telefono: '',
        genero: 'MASCULINO',
        sede: 'Sede Masculina Bello Principal',
        estado: 'Activo',
      }}
      onSubmit={handleSubmit}
      submitLabel="Crear Participante"
    >
      {({ formData, handleChange, errors }) => (
        <ParticipanteForm 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors}
        />
      )}
    </CreateFormModal>
  );
};

// Shared Form Component using reusable Form components
const ParticipanteForm = ({ formData, handleChange, errors }) => {
  const handleGeneroChange = (genero) => {
    const sedesDisponibles = getSedesPorGenero(genero);
    const nuevaSede = sedesDisponibles[0]?.value || '';
    handleChange('genero', genero);
    handleChange('sede', nuevaSede);
  };

  return (
    <FormGroup columns={2} gap="md">
      <FormInput
        label="Nombre Completo"
        name="nombre"
        type="text"
        value={formData.nombre}
        onChange={(value) => handleChange('nombre', value)}
        error={errors?.nombre}
        required
        placeholder="Ingrese el nombre completo"
      />

      <FormInput
        label="Edad"
        name="edad"
        type="number"
        value={formData.edad}
        onChange={(value) => handleChange('edad', value)}
        error={errors?.edad}
        placeholder="Edad"
      />

      <FormSelect
        label="Género"
        name="genero"
        value={formData.genero}
        onChange={(value) => handleGeneroChange(value)}
        options={[
          { value: 'MASCULINO', label: 'Masculino' },
          { value: 'FEMENINO', label: 'Femenino' }
        ]}
        error={errors?.genero}
        required
      />

      <FormInput
        label="Teléfono"
        name="telefono"
        type="tel"
        value={formData.telefono}
        onChange={(value) => handleChange('telefono', value)}
        error={errors?.telefono}
        required
        placeholder="Número de teléfono"
      />

      <FormSelect
        label="Sede"
        name="sede"
        value={formData.sede}
        onChange={(value) => handleChange('sede', value)}
        options={getSedesPorGenero(formData.genero).map(sede => ({
          value: sede.value,
          label: sede.label
        }))}
        error={errors?.sede}
      />

      <FormSelect
        label="Estado"
        name="estado"
        value={formData.estado}
        onChange={(value) => handleChange('estado', value)}
        options={[
          { value: 'Activo', label: 'Activo' },
          { value: 'Inactivo', label: 'Inactivo' }
        ]}
        error={errors?.estado}
      />
    </FormGroup>
  );
};

export default Participantes;
