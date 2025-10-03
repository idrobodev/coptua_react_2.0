import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dbService } from "../../services/database";
// import jsPDF from 'jspdf'; // Temporarily disabled - not available in Docker dev

const Participantes = React.memo(() => {
  const [participantes, setParticipantes] = useState([]); // Asegurar que siempre sea array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    sede: "Todas",
    genero: "Todos",
    estado: "Todos",
    busqueda: ""
  });

  // Memoized filter handlers to prevent unnecessary re-renders
  const handleFilterChange = useCallback((field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  }, []);

  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(null);
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

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

  // Funciones para manejar modales (memoized)
  const abrirModal = useCallback((tipo, participante) => {
    setParticipanteSeleccionado(participante);
    setModalAbierto(tipo);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(null);
    setParticipanteSeleccionado(null);
  }, []);

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

  const getEstadoColor = useCallback((estado) => {
    switch (estado) {
      case "Activo": return "bg-green-100 text-green-800";
      case "Inactivo": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }, []);

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
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
            <select
              value={filtros.sede}
              onChange={(e) => handleFilterChange('sede', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Todas">Todas las Sedes</option>
              <option value="Bello Principal">Bello Principal</option>
              <option value="Bello Campestre">Bello Campestre</option>
              <option value="Apartadó">Apartadó</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <select
              value={filtros.genero}
              onChange={(e) => handleFilterChange('genero', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Todos">Todos los Géneros</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
            <input
              type="text"
              placeholder="Nombre, teléfono..."
              value={filtros.busqueda}
              onChange={(e) => handleFilterChange('busqueda', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
              <i className="fas fa-search mr-2"></i>
              Filtrar
            </button>
          </div>
        </div>
      </div>


      {/* Estadísticas Rápidas */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participantes</p>
                <p className="text-2xl font-bold text-blue-600">{filteredParticipantes.length}</p>
              </div>
              <i className="fas fa-users text-blue-600 text-2xl"></i>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredParticipantes.filter(p => p.estado === "Activo").length}
                </p>
              </div>
              <i className="fas fa-user-check text-green-600 text-2xl"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredParticipantes.filter(p => p.estado === "Inactivo").length}
                </p>
              </div>
              <i className="fas fa-user-times text-red-600 text-2xl"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Edad</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredParticipantes.length > 0
                    ? Math.round(filteredParticipantes.reduce((sum, p) => sum + (p.edad || 0), 0) / filteredParticipantes.length)
                    : 0
                  } años
                </p>
              </div>
              <i className="fas fa-birthday-cake text-blue-600 text-2xl"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sedes Bello</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredParticipantes.filter(p => p.sede && p.sede.toLowerCase().includes("bello")).length}
                </p>
              </div>
              <i className="fas fa-map-marker-alt text-purple-600 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Participantes */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Participantes</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Género
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sede
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParticipantes.map((participante) => (
                  <tr key={participante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-blue-600"></i>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {participante.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {participante.edad} años • {participante.telefono}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participante.genero === 'MASCULINO' ? 'Masculino' : participante.genero === 'FEMENINO' ? 'Femenino' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participante.sede}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleEstado(participante.id, participante.estado === 'Activo' ? 'Inactivo' : 'Activo')}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getEstadoColor(participante.estado)} hover:opacity-80`}
                        aria-label={`Cambiar estado de ${participante.nombre} a ${participante.estado === 'Activo' ? 'Inactivo' : 'Activo'}`}
                        title={`Cambiar estado a ${participante.estado === 'Activo' ? 'Inactivo' : 'Activo'}`}
                      >
                        {participante.estado}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative dropdown-container">
                        <button
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownAbierto(dropdownAbierto === participante.id ? null : participante.id);
                          }}
                          aria-label="Opciones del participante"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 ${dropdownAbierto === participante.id ? 'block' : 'hidden'}`}>
                          <button
                            onClick={() => {
                              handleActionClick('ver', participante);
                              setDropdownAbierto(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <i className="fas fa-eye mr-2"></i>Ver detalles
                          </button>
                          <button
                            onClick={() => {
                              handleActionClick('editar', participante);
                              setDropdownAbierto(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <i className="fas fa-edit mr-2"></i>Editar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {modalAbierto === 'ver' && (
              <ModalVerParticipante
                participante={participanteSeleccionado}
                onCerrar={cerrarModal}
              />
            )}
            {modalAbierto === 'editar' && (
              <ModalEditarParticipante
                participante={participanteSeleccionado}
                onCerrar={cerrarModal}
                onActualizar={loadParticipantes}
              />
            )}
            {modalAbierto === 'crear' && (
              <ModalCrearParticipante
                onCerrar={cerrarModal}
                onCrear={loadParticipantes}
              />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
});

// Componente Modal para Ver Participante (memoized)
const ModalVerParticipante = React.memo(({ participante, onCerrar }) => {
  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Detalles del Participante</h3>
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
              <p className="text-lg font-semibold text-gray-800">{participante.nombre}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Edad</label>
              <p className="text-gray-800">{participante.edad} años</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
              <p className="text-gray-800">{participante.telefono}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sede</label>
              <p className="text-gray-800">{participante.sede}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                participante.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {participante.estado}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Ingreso</label>
              <p className="text-gray-800">
                {participante.fechaIngreso
                  ? new Date(participante.fechaIngreso).toLocaleDateString('es-ES')
                  : 'No disponible'
                }
              </p>
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
});

// Componente Modal para Editar Participante (memoized)
const ModalEditarParticipante = React.memo(({ participante, onCerrar, onActualizar }) => {
  const [formData, setFormData] = useState({
    nombre: participante.nombre,
    edad: participante.edad,
    telefono: participante.telefono,
    genero: participante.genero || 'MASCULINO', // Default if not provided
    sede: participante.sede,
    estado: participante.estado,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Opciones de sedes por género
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

  // Actualizar sede cuando cambia el género
  const handleGeneroChange = (genero) => {
    const sedesDisponibles = getSedesPorGenero(genero);
    const nuevaSede = sedesDisponibles[0]?.value || '';
    setFormData(prev => ({
      ...prev,
      genero,
      sede: nuevaSede
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Actualizando participante:', formData);

      const result = await dbService.updateParticipante(participante.id, formData);

      if (result.error) {
        throw new Error(result.error.message || 'Error al actualizar participante');
      }

      console.log('✅ Participante actualizado exitosamente');
      onActualizar(); // Recargar la lista
      onCerrar();
    } catch (err) {
      console.error('❌ Error actualizando participante:', err);
      setError(err.message || 'Error desconocido al actualizar participante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Editar Participante</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
            <input
              type="number"
              value={formData.edad}
              onChange={(e) => setFormData({...formData, edad: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
            <select
              value={formData.genero}
              onChange={(e) => handleGeneroChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sede</label>
            <select
              value={formData.sede}
              onChange={(e) => setFormData({...formData, sede: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {getSedesPorGenero(formData.genero).map(sede => (
                <option key={sede.value} value={sede.value}>
                  {sede.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
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
});

// Componente Modal para Crear Participante (memoized)
const ModalCrearParticipante = React.memo(({ onCerrar, onCrear }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    telefono: '',
    genero: 'MASCULINO',
    sede: 'Sede Masculina Bello Principal',
    estado: 'Activo',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Opciones de sedes por género
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

  // Actualizar sede cuando cambia el género
  const handleGeneroChange = (genero) => {
    const sedesDisponibles = getSedesPorGenero(genero);
    const nuevaSede = sedesDisponibles[0]?.value || '';
    setFormData(prev => ({
      ...prev,
      genero,
      sede: nuevaSede
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Creando participante:', formData);
      
      // Validaciones básicas
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
      onCrear(); // Recargar la lista
      onCerrar(); // Cerrar modal
    } catch (err) {
      console.error('❌ Error creando participante:', err);
      setError(err.message || 'Error desconocido al crear participante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Nuevo Participante</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingrese el nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
            <input
              type="number"
              value={formData.edad}
              onChange={(e) => setFormData({...formData, edad: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Edad"
              min="1"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Género *</label>
            <select
              value={formData.genero}
              onChange={(e) => handleGeneroChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Número de teléfono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sede</label>
            <select
              value={formData.sede}
              onChange={(e) => setFormData({...formData, sede: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getSedesPorGenero(formData.genero).map(sede => (
                <option key={sede.value} value={sede.value}>
                  {sede.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
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
                Crear Participante
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
});

export default Participantes;
