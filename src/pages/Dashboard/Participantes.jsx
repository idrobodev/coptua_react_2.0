import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "components/layout/DashboardLayout";
import { dbService } from "shared/services";
import { FilterBar, StatsGrid, DataTable, ActionDropdown, StatusToggle, FormInput, FormSelect, FormGroup } from "components/UI";
import { ViewDetailsModal, EditFormModal, CreateFormModal } from "components/common";
import { useFilters, useModal } from "shared/hooks";
import { 
  validateParticipanteDocumentoUnico, 
  validateFechaNacimiento, 
  validateFechaIngreso,
  validateSedeExists 
} from "shared/utils/validationUtils";
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
      filtered = filtered.filter(p => {
        const sedeNombre = p.sede?.direccion || p.sede || '';
        return sedeNombre.toLowerCase().includes(filtros.sede.toLowerCase());
      });
    }
    if (filtros.genero !== "Todos") {
      filtered = filtered.filter(p => p.genero === filtros.genero);
    }
    if (filtros.estado !== "Todos") {
      // Support both ACTIVO/INACTIVO and Activo/Inactivo
      const estadoUpper = filtros.estado.toUpperCase();
      filtered = filtered.filter(p => 
        p.estado === filtros.estado || 
        p.estado === estadoUpper ||
        (filtros.estado === 'Activo' && p.estado === 'ACTIVO') ||
        (filtros.estado === 'Inactivo' && p.estado === 'INACTIVO')
      );
    }
    if (filtros.busqueda) {
      const searchLower = filtros.busqueda.toLowerCase();
      filtered = filtered.filter(p => {
        const nombreCompleto = p.nombres && p.apellidos 
          ? `${p.nombres} ${p.apellidos}`.toLowerCase()
          : (p.nombre || '').toLowerCase();
        const documento = (p.numero_documento || '').toLowerCase();
        const telefono = (p.telefono || '');
        
        return nombreCompleto.includes(searchLower) ||
               documento.includes(searchLower) ||
               telefono.includes(filtros.busqueda);
      });
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
              value: filteredParticipantes.filter(p => p.estado === "ACTIVO" || p.estado === "Activo").length,
              icon: 'fas fa-user-check',
              color: 'green'
            },
            {
              title: 'Inactivos',
              value: filteredParticipantes.filter(p => p.estado === "INACTIVO" || p.estado === "Inactivo").length,
              icon: 'fas fa-user-times',
              color: 'red'
            },
            {
              title: 'Promedio Edad',
              value: (() => {
                if (filteredParticipantes.length === 0) return '0 años';
                
                const edades = filteredParticipantes.map(p => {
                  if (p.fecha_nacimiento) {
                    const birthDate = new Date(p.fecha_nacimiento);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }
                    return age;
                  }
                  return p.edad || 0;
                });
                
                const promedio = Math.round(edades.reduce((sum, edad) => sum + edad, 0) / edades.length);
                return `${promedio} años`;
              })(),
              icon: 'fas fa-birthday-cake',
              color: 'blue'
            },
            {
              title: 'Sedes Bello',
              value: filteredParticipantes.filter(p => {
                const sedeNombre = p.sede?.direccion || p.sede || '';
                return sedeNombre.toLowerCase().includes("bello");
              }).length,
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
            keyExtractor={(row) => row.id || row.id_participante}
            columns={[
              {
                key: 'participante',
                header: 'Participante',
                render: (row) => {
                  const nombreCompleto = row.nombres && row.apellidos 
                    ? `${row.nombres} ${row.apellidos}` 
                    : row.nombre || 'N/A';
                  const tipoDoc = row.tipo_documento || 'N/A';
                  const numDoc = row.numero_documento || 'N/A';
                  
                  return (
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-blue-600"></i>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {nombreCompleto}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tipoDoc} {numDoc}
                        </div>
                      </div>
                    </div>
                  );
                }
              },
              {
                key: 'edad',
                header: 'Edad',
                render: (row) => {
                  if (row.fecha_nacimiento) {
                    const birthDate = new Date(row.fecha_nacimiento);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }
                    return `${age} años`;
                  }
                  return row.edad ? `${row.edad} años` : 'N/A';
                }
              },
              {
                key: 'genero',
                header: 'Género',
                render: (row) => (
                  row.genero === 'MASCULINO' ? 'Masculino' : row.genero === 'FEMENINO' ? 'Femenino' : 'N/A'
                )
              },
              {
                key: 'fecha_ingreso',
                header: 'Fecha Ingreso',
                render: (row) => {
                  if (row.fecha_ingreso) {
                    return new Date(row.fecha_ingreso).toLocaleDateString('es-ES');
                  }
                  return 'N/A';
                }
              },
              {
                key: 'sede',
                header: 'Sede',
                render: (row) => row.sede?.direccion || row.sede || 'N/A'
              },
              {
                key: 'estado',
                header: 'Estado',
                render: (row) => (
                  <StatusToggle
                    currentStatus={row.estado}
                    statuses={[
                      { value: 'ACTIVO', label: 'Activo', variant: 'success' },
                      { value: 'Activo', label: 'Activo', variant: 'success' },
                      { value: 'INACTIVO', label: 'Inactivo', variant: 'danger' },
                      { value: 'Inactivo', label: 'Inactivo', variant: 'danger' }
                    ]}
                    onChange={(newEstado) => toggleEstado(row.id || row.id_participante, newEstado)}
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
      <ParticipanteViewModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        participante={viewModal.modalData}
        onCrearAcudiente={() => {
          // TODO: Open acudiente creation modal with participante pre-selected
          console.log('Crear acudiente para participante:', viewModal.modalData);
        }}
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

// View Modal Component with Acudientes
const ParticipanteViewModal = ({ isOpen, onClose, participante, onCrearAcudiente }) => {
  const [acudientes, setAcudientes] = useState([]);
  const [loadingAcudientes, setLoadingAcudientes] = useState(false);

  useEffect(() => {
    if (isOpen && participante) {
      loadAcudientes();
    }
  }, [isOpen, participante]);

  const loadAcudientes = async () => {
    if (!participante?.id && !participante?.id_participante) return;
    
    try {
      setLoadingAcudientes(true);
      const participanteId = participante.id || participante.id_participante;
      const result = await dbService.getAcudientesByParticipante(participanteId);
      
      if (result.data && Array.isArray(result.data)) {
        setAcudientes(result.data);
      } else {
        setAcudientes([]);
      }
    } catch (err) {
      console.error('Error loading acudientes:', err);
      setAcudientes([]);
    } finally {
      setLoadingAcudientes(false);
    }
  };

  if (!participante) return null;

  const nombreCompleto = participante.nombres && participante.apellidos 
    ? `${participante.nombres} ${participante.apellidos}` 
    : participante.nombre || 'N/A';

  const edad = (() => {
    if (participante.fecha_nacimiento) {
      const birthDate = new Date(participante.fecha_nacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return participante.edad || 'N/A';
  })();

  const estadoLabel = participante.estado === 'ACTIVO' || participante.estado === 'Activo' ? 'Activo' : 'Inactivo';
  const estadoClass = participante.estado === 'ACTIVO' || participante.estado === 'Activo' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';

  return (
    <ViewDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Participante"
      data={[
        { label: 'Nombre Completo', value: nombreCompleto },
        { label: 'Tipo de Documento', value: participante.tipo_documento || 'N/A' },
        { label: 'Número de Documento', value: participante.numero_documento || 'N/A' },
        { label: 'Edad', value: typeof edad === 'number' ? `${edad} años` : edad },
        { label: 'Fecha de Nacimiento', value: participante.fecha_nacimiento 
          ? new Date(participante.fecha_nacimiento).toLocaleDateString('es-ES') 
          : 'N/A' 
        },
        { label: 'Género', value: participante.genero === 'MASCULINO' ? 'Masculino' : participante.genero === 'FEMENINO' ? 'Femenino' : 'N/A' },
        { label: 'Fecha de Ingreso', value: participante.fecha_ingreso
          ? new Date(participante.fecha_ingreso).toLocaleDateString('es-ES')
          : 'N/A'
        },
        { label: 'Sede', value: participante.sede?.direccion || participante.sede || 'N/A' },
        { label: 'Teléfono', value: participante.telefono || 'N/A' },
        { 
          label: 'Estado', 
          value: (
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${estadoClass}`}>
              {estadoLabel}
            </span>
          )
        },
        {
          label: 'Acudientes',
          value: (
            <div className="mt-2">
              {loadingAcudientes ? (
                <p className="text-sm text-gray-500">Cargando acudientes...</p>
              ) : acudientes.length > 0 ? (
                <div className="space-y-2">
                  {acudientes.map((acudiente, index) => (
                    <div key={acudiente.id_acudiente || index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {acudiente.nombres} {acudiente.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">
                            {acudiente.parentesco} • {acudiente.tipo_documento} {acudiente.numero_documento}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <i className="fas fa-phone mr-1"></i>{acudiente.telefono}
                            {acudiente.email && (
                              <span className="ml-2">
                                <i className="fas fa-envelope mr-1"></i>{acudiente.email}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={onCrearAcudiente}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Agregar otro acudiente
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">No hay acudientes registrados</p>
                  <button
                    onClick={onCrearAcudiente}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Agregar acudiente
                  </button>
                </div>
              )}
            </div>
          )
        }
      ]}
    />
  );
};

// Edit Modal Component
const ParticipanteEditModal = ({ isOpen, onClose, participante, onActualizar }) => {
  if (!participante) return null;

  const handleSubmit = async (formData) => {
    console.log('🔄 Actualizando participante:', formData);
    
    // Validate required fields
    if (!formData.tipo_documento || !formData.numero_documento) {
      throw new Error('Tipo y número de documento son requeridos');
    }
    if (!formData.nombres?.trim() || !formData.apellidos?.trim()) {
      throw new Error('Nombres y apellidos son requeridos');
    }
    if (!formData.fecha_nacimiento || !formData.fecha_ingreso) {
      throw new Error('Fechas de nacimiento e ingreso son requeridas');
    }
    if (!formData.id_sede) {
      throw new Error('Debe seleccionar una sede');
    }
    
    // Validate fecha_nacimiento format and value
    const fechaNacimientoValidation = validateFechaNacimiento(formData.fecha_nacimiento);
    if (!fechaNacimientoValidation.isValid) {
      throw new Error(fechaNacimientoValidation.error);
    }
    
    // Validate fecha_ingreso format and value
    const fechaIngresoValidation = validateFechaIngreso(formData.fecha_ingreso);
    if (!fechaIngresoValidation.isValid) {
      throw new Error(fechaIngresoValidation.error);
    }
    
    // Validate documento único
    const participanteId = participante.id || participante.id_participante;
    const documentoValidation = await validateParticipanteDocumentoUnico(formData.numero_documento, participanteId);
    if (!documentoValidation.isValid) {
      throw new Error(documentoValidation.error);
    }
    
    // Validate sede exists
    const sedeValidation = await validateSedeExists(formData.id_sede);
    if (!sedeValidation.isValid) {
      throw new Error(sedeValidation.error);
    }
    
    const result = await dbService.updateParticipante(participanteId, formData);
    
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
        tipo_documento: participante.tipo_documento || 'CC',
        numero_documento: participante.numero_documento || '',
        nombres: participante.nombres || participante.nombre?.split(' ')[0] || '',
        apellidos: participante.apellidos || participante.nombre?.split(' ').slice(1).join(' ') || '',
        fecha_nacimiento: participante.fecha_nacimiento || '',
        genero: participante.genero || 'MASCULINO',
        fecha_ingreso: participante.fecha_ingreso || '',
        estado: participante.estado || 'ACTIVO',
        id_sede: participante.id_sede || participante.sede_id || '',
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
    
    // Validate required fields
    if (!formData.tipo_documento || !formData.numero_documento) {
      throw new Error('Tipo y número de documento son requeridos');
    }
    if (!formData.nombres?.trim() || !formData.apellidos?.trim()) {
      throw new Error('Nombres y apellidos son requeridos');
    }
    if (!formData.fecha_nacimiento || !formData.fecha_ingreso) {
      throw new Error('Fechas de nacimiento e ingreso son requeridas');
    }
    if (!formData.id_sede) {
      throw new Error('Debe seleccionar una sede');
    }
    
    // Validate fecha_nacimiento format and value
    const fechaNacimientoValidation = validateFechaNacimiento(formData.fecha_nacimiento);
    if (!fechaNacimientoValidation.isValid) {
      throw new Error(fechaNacimientoValidation.error);
    }
    
    // Validate fecha_ingreso format and value
    const fechaIngresoValidation = validateFechaIngreso(formData.fecha_ingreso);
    if (!fechaIngresoValidation.isValid) {
      throw new Error(fechaIngresoValidation.error);
    }
    
    // Validate documento único
    const documentoValidation = await validateParticipanteDocumentoUnico(formData.numero_documento);
    if (!documentoValidation.isValid) {
      throw new Error(documentoValidation.error);
    }
    
    // Validate sede exists
    const sedeValidation = await validateSedeExists(formData.id_sede);
    if (!sedeValidation.isValid) {
      throw new Error(sedeValidation.error);
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
        tipo_documento: 'CC',
        numero_documento: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        genero: 'MASCULINO',
        fecha_ingreso: '',
        estado: 'ACTIVO',
        id_sede: '',
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
  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(true);

  useEffect(() => {
    const loadSedes = async () => {
      try {
        setLoadingSedes(true);
        const result = await dbService.getSedes();
        if (result.data && Array.isArray(result.data)) {
          setSedes(result.data);
        }
      } catch (err) {
        console.error('Error loading sedes:', err);
      } finally {
        setLoadingSedes(false);
      }
    };
    loadSedes();
  }, []);

  return (
    <FormGroup columns={2} gap="md">
      <FormSelect
        label="Tipo de Documento"
        name="tipo_documento"
        value={formData.tipo_documento}
        onChange={(value) => handleChange('tipo_documento', value)}
        options={[
          { value: 'CC', label: 'Cédula de Ciudadanía' },
          { value: 'TI', label: 'Tarjeta de Identidad' },
          { value: 'CE', label: 'Cédula de Extranjería' },
          { value: 'PASAPORTE', label: 'Pasaporte' }
        ]}
        error={errors?.tipo_documento}
        required
      />

      <FormInput
        label="Número de Documento"
        name="numero_documento"
        type="text"
        value={formData.numero_documento}
        onChange={(value) => handleChange('numero_documento', value)}
        error={errors?.numero_documento}
        required
        placeholder="Ingrese el número de documento"
      />

      <FormInput
        label="Nombres"
        name="nombres"
        type="text"
        value={formData.nombres}
        onChange={(value) => handleChange('nombres', value)}
        error={errors?.nombres}
        required
        placeholder="Ingrese los nombres"
      />

      <FormInput
        label="Apellidos"
        name="apellidos"
        type="text"
        value={formData.apellidos}
        onChange={(value) => handleChange('apellidos', value)}
        error={errors?.apellidos}
        required
        placeholder="Ingrese los apellidos"
      />

      <FormInput
        label="Fecha de Nacimiento"
        name="fecha_nacimiento"
        type="date"
        value={formData.fecha_nacimiento}
        onChange={(value) => handleChange('fecha_nacimiento', value)}
        error={errors?.fecha_nacimiento}
        required
      />

      <FormSelect
        label="Género"
        name="genero"
        value={formData.genero}
        onChange={(value) => handleChange('genero', value)}
        options={[
          { value: 'MASCULINO', label: 'Masculino' },
          { value: 'FEMENINO', label: 'Femenino' }
        ]}
        error={errors?.genero}
        required
      />

      <FormInput
        label="Fecha de Ingreso"
        name="fecha_ingreso"
        type="date"
        value={formData.fecha_ingreso}
        onChange={(value) => handleChange('fecha_ingreso', value)}
        error={errors?.fecha_ingreso}
        required
      />

      <FormSelect
        label="Estado"
        name="estado"
        value={formData.estado}
        onChange={(value) => handleChange('estado', value)}
        options={[
          { value: 'ACTIVO', label: 'Activo' },
          { value: 'INACTIVO', label: 'Inactivo' }
        ]}
        error={errors?.estado}
        required
      />

      <FormSelect
        label="Sede"
        name="id_sede"
        value={formData.id_sede}
        onChange={(value) => handleChange('id_sede', value)}
        options={loadingSedes ? [{ value: '', label: 'Cargando sedes...' }] : sedes.map(sede => ({
          value: sede.id_sede || sede.id,
          label: sede.direccion || sede.nombre
        }))}
        error={errors?.id_sede}
        required
        disabled={loadingSedes}
      />
    </FormGroup>
  );
};

export default Participantes;
