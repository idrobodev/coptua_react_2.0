import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "components/layout/DashboardLayout";
import { dbService } from "shared/services";
import { FilterBar } from "components/UI/Filter";
import { StatsGrid } from "components/UI/Card";
import { DataTable, ActionDropdown } from "components/UI/Table";
import { ViewDetailsModal, EditFormModal, CreateFormModal } from "components/common/CRUDModals";
import { useFilters, useModal } from "shared/hooks";
import { 
  validateAcudienteDocumentoUnico, 
  validateEmail,
  validateParticipanteExists 
} from "shared/utils/validationUtils";

const AcudientesComponent = () => {
  const [acudientes, setAcudientes] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use custom hooks
  const { filters: filtros, setFilter, clearFilters } = useFilters({
    participante: "Todos",
    busqueda: ""
  });
  
  const verModal = useModal();
  const editarModal = useModal();
  const crearModal = useModal();

  // Función para cargar acudientes
  const loadAcudientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando acudientes...');

      const result = await dbService.getAcudientes();
      console.log('📊 Resultado acudientes:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Error al cargar acudientes');
      }

      const acudientesData = Array.isArray(result.data) ? result.data : [];
      setAcudientes(acudientesData);
      console.log('✅ Acudientes cargados:', acudientesData.length);
    } catch (err) {
      console.error('❌ Error cargando acudientes:', err);
      setError(err.message || 'Error desconocido al cargar acudientes');
      setAcudientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar participantes
  const loadParticipantes = useCallback(async () => {
    try {
      console.log('🔄 Cargando participantes...');
      const result = await dbService.getParticipantes();
      
      if (result.error) {
        console.error('Error cargando participantes:', result.error);
        setParticipantes([]);
        return;
      }

      const participantesData = Array.isArray(result.data) ? result.data : [];
      setParticipantes(participantesData);
      console.log('✅ Participantes cargados:', participantesData.length);
    } catch (err) {
      console.error('❌ Error cargando participantes:', err);
      setParticipantes([]);
    }
  }, []);

  useEffect(() => {
    loadAcudientes();
    loadParticipantes();
  }, [loadAcudientes, loadParticipantes]);

  // Filtrar acudientes por nombre, documento y participante
  const filteredAcudientes = useMemo(() => {
    const safeAcudientes = Array.isArray(acudientes) ? acudientes : [];
    let filtered = safeAcudientes;

    // Filtrar por participante
    if (filtros.participante !== "Todos") {
      filtered = filtered.filter(a => {
        const participanteId = a.id_participante || a.participante?.id_participante;
        return participanteId && participanteId.toString() === filtros.participante;
      });
    }

    // Filtrar por búsqueda (nombre, documento)
    if (filtros.busqueda) {
      const searchLower = filtros.busqueda.toLowerCase();
      filtered = filtered.filter(a =>
        (a.nombres || '').toLowerCase().includes(searchLower) ||
        (a.apellidos || '').toLowerCase().includes(searchLower) ||
        (a.numero_documento || '').includes(filtros.busqueda) ||
        (`${a.nombres} ${a.apellidos}`).toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [acudientes, filtros]);

  // Estadísticas
  const statsData = useMemo(() => [
    {
      title: "Total Acudientes",
      value: filteredAcudientes.length,
      icon: "fas fa-user-friends",
      color: "blue"
    }
  ], [filteredAcudientes]);

  // Función para exportar a PDF
  const handleExportPDF = useCallback(() => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('es-ES');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista de Acudientes - ${currentDate}</title>
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
              color: #7c3aed;
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
              background: #ede9fe;
              padding: 15px;
              border-radius: 5px;
            }
            .stats h3 {
              margin: 0 0 10px 0;
              color: #7c3aed;
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
            <h1>Lista de Acudientes</h1>
            <p>Corporación Todo por un Alma</p>
            <p>Fecha de generación: ${currentDate}</p>
          </div>

          <div class="filters">
            <h3>Filtros aplicados:</h3>
            <p><strong>Participante:</strong> ${filtros.participante === 'Todos' ? 'Todos los participantes' : (() => {
              const p = participantes.find(part => (part.id_participante || part.id).toString() === filtros.participante);
              return p?.nombre || `${p?.nombres || ''} ${p?.apellidos || ''}`.trim() || 'N/A';
            })()}</p>
            ${filtros.busqueda ? `<p><strong>Búsqueda:</strong> "${filtros.busqueda}"</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Acudiente</th>
                <th>Documento</th>
                <th>Participante</th>
                <th>Parentesco</th>
                <th>Teléfono</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAcudientes.map(acudiente => {
                const participante = participantes.find(p =>
                  (p.id_participante || p.id) === acudiente.id_participante
                );
                return `
                  <tr>
                    <td>${`${acudiente.nombres || ''} ${acudiente.apellidos || ''}`.trim() || 'N/A'}</td>
                    <td>${acudiente.tipo_documento || 'CC'}: ${acudiente.numero_documento || 'N/A'}</td>
                    <td>${participante?.nombre || `${participante?.nombres || ''} ${participante?.apellidos || ''}`.trim() || 'N/A'}</td>
                    <td>${acudiente.parentesco || 'N/A'}</td>
                    <td>${acudiente.telefono || 'N/A'}</td>
                    <td>${acudiente.email || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="stats">
            <h3>Estadísticas:</h3>
            <p><strong>Total de acudientes:</strong> ${filteredAcudientes.length}</p>
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
  }, [filtros, filteredAcudientes, participantes]);

  if (loading) {
    return (
      <DashboardLayout title="Acudientes" subtitle="Gestión de acudientes" loading={true} loadingText="Cargando acudientes..." />
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Acudientes" subtitle="Error al cargar datos" loading={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading acudientes: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Configuración de filtros
  const filterConfig = [
    {
      type: 'select',
      name: 'participante',
      label: 'Participante',
      options: [
        { value: 'Todos', label: 'Todos los Participantes' },
        ...participantes.map(p => ({
          value: (p.id_participante || p.id).toString(),
          label: p.nombre || `${p.nombres} ${p.apellidos}` || 'Sin nombre'
        }))
      ]
    },
    {
      type: 'search',
      name: 'busqueda',
      label: 'Búsqueda',
      placeholder: 'Buscar por nombre o documento...'
    }
  ];

  return (
    <DashboardLayout 
      title="Gestión de Acudientes" 
      subtitle="Administra los acudientes de los participantes"
      extraActions={
        <div className="flex space-x-3">
          <button
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            title="Exportar lista filtrada a PDF"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            Exportar PDF
          </button>
          <button
            onClick={() => crearModal.open()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Nuevo Acudiente
          </button>
        </div>
      }
    >
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
        <StatsGrid stats={statsData} columns={1} />
      </div>

      {/* Tabla de Acudientes */}
      <div className="px-6 py-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Lista de Acudientes</h3>
          <p className="text-sm text-gray-600 mt-1">Gestiona los acudientes de los participantes</p>
        </div>

        {filteredAcudientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-user-friends text-gray-300 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron acudientes</h3>
            <p className="text-gray-500">No hay acudientes que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'acudiente',
                label: 'Acudiente',
                render: (acudiente) => (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-user-friends text-purple-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {`${acudiente.nombres || ''} ${acudiente.apellidos || ''}`.trim() || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {acudiente.tipo_documento || 'CC'}: {acudiente.numero_documento || 'N/A'}
                      </p>
                    </div>
                  </div>
                )
              },
              {
                key: 'participante',
                label: 'Participante',
                render: (acudiente) => {
                  // Buscar el participante asociado
                  const participante = participantes.find(p => 
                    (p.id_participante || p.id) === acudiente.id_participante
                  );
                  return (
                    <div>
                      <p className="text-gray-900">
                        {participante?.nombre || `${participante?.nombres || ''} ${participante?.apellidos || ''}`.trim() || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {acudiente.parentesco || 'Sin parentesco'}
                      </p>
                    </div>
                  );
                }
              },
              {
                key: 'contacto',
                label: 'Contacto',
                render: (acudiente) => (
                  <div>
                    <p className="text-gray-900">
                      <i className="fas fa-phone text-gray-400 mr-2"></i>
                      {acudiente.telefono || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      <i className="fas fa-envelope text-gray-400 mr-2"></i>
                      {acudiente.email || 'N/A'}
                    </p>
                  </div>
                )
              },
              {
                key: 'acciones',
                label: 'Acciones',
                render: (acudiente) => (
                  <ActionDropdown
                    actions={[
                      {
                        label: 'Ver detalles',
                        icon: 'fas fa-eye',
                        onClick: () => {
                          verModal.setData(acudiente);
                          verModal.open();
                        }
                      },
                      {
                        label: 'Editar',
                        icon: 'fas fa-edit',
                        onClick: () => {
                          editarModal.setData(acudiente);
                          editarModal.open();
                        }
                      }
                    ]}
                  />
                )
              }
            ]}
            data={filteredAcudientes}
          />
        )}
      </div>

      {/* Modales */}
      <ViewDetailsModal
        isOpen={verModal.isOpen}
        onClose={verModal.close}
        title="Detalles del Acudiente"
        data={verModal.data ? [
          { label: 'ID', value: verModal.data.id_acudiente || verModal.data.id },
          { 
            label: 'Nombre Completo', 
            value: `${verModal.data.nombres || ''} ${verModal.data.apellidos || ''}`.trim() 
          },
          { 
            label: 'Documento', 
            value: `${verModal.data.tipo_documento || 'CC'}: ${verModal.data.numero_documento || 'N/A'}` 
          },
          { label: 'Parentesco', value: verModal.data.parentesco || 'N/A' },
          { label: 'Teléfono', value: verModal.data.telefono || 'N/A' },
          { label: 'Email', value: verModal.data.email || 'N/A' },
          { label: 'Dirección', value: verModal.data.direccion || 'N/A' },
          { 
            label: 'Participante', 
            value: (() => {
              const participante = participantes.find(p => 
                (p.id_participante || p.id) === verModal.data.id_participante
              );
              return participante?.nombre || `${participante?.nombres || ''} ${participante?.apellidos || ''}`.trim() || 'N/A';
            })()
          }
        ] : []}
      />

      <EditFormModal
        isOpen={editarModal.isOpen}
        onClose={editarModal.close}
        title="Editar Acudiente"
        onSubmit={async (formData) => {
          // Validar documento único
          const acudienteId = editarModal.data.id_acudiente || editarModal.data.id;
          const documentoValidation = await validateAcudienteDocumentoUnico(formData.numero_documento, acudienteId);
          if (!documentoValidation.isValid) {
            throw new Error(documentoValidation.error);
          }

          // Validar email
          const emailValidation = validateEmail(formData.email);
          if (!emailValidation.isValid) {
            throw new Error(emailValidation.error);
          }

          const result = await dbService.updateAcudiente(
            editarModal.data.id_acudiente || editarModal.data.id, 
            formData
          );
          if (result.error) {
            throw new Error(result.error.message || 'Error al actualizar acudiente');
          }
          await loadAcudientes();
        }}
        initialData={editarModal.data}
        fields={[
          { 
            name: 'tipo_documento', 
            label: 'Tipo de Documento', 
            type: 'select',
            required: true,
            options: [
              { value: 'CC', label: 'Cédula de Ciudadanía' },
              { value: 'TI', label: 'Tarjeta de Identidad' },
              { value: 'CE', label: 'Cédula de Extranjería' },
              { value: 'PASAPORTE', label: 'Pasaporte' }
            ]
          },
          { 
            name: 'numero_documento', 
            label: 'Número de Documento', 
            type: 'text', 
            required: true,
            placeholder: 'Número de documento'
          },
          { 
            name: 'nombres', 
            label: 'Nombres', 
            type: 'text', 
            required: true,
            placeholder: 'Nombres del acudiente'
          },
          { 
            name: 'apellidos', 
            label: 'Apellidos', 
            type: 'text', 
            required: true,
            placeholder: 'Apellidos del acudiente'
          },
          { 
            name: 'parentesco', 
            label: 'Parentesco', 
            type: 'text', 
            required: true,
            placeholder: 'Ej: Madre, Padre, Hermano/a'
          },
          { 
            name: 'telefono', 
            label: 'Teléfono', 
            type: 'tel', 
            required: true,
            placeholder: 'Número de teléfono'
          },
          { 
            name: 'email', 
            label: 'Email', 
            type: 'email', 
            required: true,
            placeholder: 'correo@ejemplo.com'
          },
          { 
            name: 'direccion', 
            label: 'Dirección', 
            type: 'textarea', 
            required: true,
            placeholder: 'Dirección completa'
          }
        ]}
      />

      <CreateFormModal
        isOpen={crearModal.isOpen}
        onClose={crearModal.close}
        title="Nuevo Acudiente"
        onSubmit={async (formData) => {
          // Validar documento único
          const documentoValidation = await validateAcudienteDocumentoUnico(formData.numero_documento);
          if (!documentoValidation.isValid) {
            throw new Error(documentoValidation.error);
          }

          // Validar email
          const emailValidation = validateEmail(formData.email);
          if (!emailValidation.isValid) {
            throw new Error(emailValidation.error);
          }

          // Validar que el participante exista
          const participanteValidation = await validateParticipanteExists(formData.id_participante);
          if (!participanteValidation.isValid) {
            throw new Error(participanteValidation.error);
          }

          const result = await dbService.createAcudiente(formData);
          if (result.error) {
            throw new Error(result.error.message || 'Error al crear acudiente');
          }
          await loadAcudientes();
        }}
        initialData={{
          id_participante: '',
          tipo_documento: 'CC',
          numero_documento: '',
          nombres: '',
          apellidos: '',
          parentesco: '',
          telefono: '',
          email: '',
          direccion: ''
        }}
        fields={[
          { 
            name: 'id_participante', 
            label: 'Participante', 
            type: 'select',
            required: true,
            options: [
              { value: '', label: 'Seleccione un participante' },
              ...participantes.map(p => ({
                value: (p.id_participante || p.id).toString(),
                label: p.nombre || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Sin nombre'
              }))
            ]
          },
          { 
            name: 'tipo_documento', 
            label: 'Tipo de Documento', 
            type: 'select',
            required: true,
            options: [
              { value: 'CC', label: 'Cédula de Ciudadanía' },
              { value: 'TI', label: 'Tarjeta de Identidad' },
              { value: 'CE', label: 'Cédula de Extranjería' },
              { value: 'PASAPORTE', label: 'Pasaporte' }
            ]
          },
          { 
            name: 'numero_documento', 
            label: 'Número de Documento', 
            type: 'text', 
            required: true,
            placeholder: 'Número de documento'
          },
          { 
            name: 'nombres', 
            label: 'Nombres', 
            type: 'text', 
            required: true,
            placeholder: 'Nombres del acudiente'
          },
          { 
            name: 'apellidos', 
            label: 'Apellidos', 
            type: 'text', 
            required: true,
            placeholder: 'Apellidos del acudiente'
          },
          { 
            name: 'parentesco', 
            label: 'Parentesco', 
            type: 'text', 
            required: true,
            placeholder: 'Ej: Madre, Padre, Hermano/a'
          },
          { 
            name: 'telefono', 
            label: 'Teléfono', 
            type: 'tel', 
            required: true,
            placeholder: 'Número de teléfono'
          },
          { 
            name: 'email', 
            label: 'Email', 
            type: 'email', 
            required: true,
            placeholder: 'correo@ejemplo.com'
          },
          { 
            name: 'direccion', 
            label: 'Dirección', 
            type: 'textarea', 
            required: true,
            placeholder: 'Dirección completa'
          }
        ]}
      />
    </DashboardLayout>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
const Acudientes = React.memo(AcudientesComponent);

export default Acudientes;
